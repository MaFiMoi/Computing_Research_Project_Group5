import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// LƯU Ý: Dùng key 'anon' vì đây là key bạn có trong file .env
// Điều này AN TOÀN vì chúng ta đã tạo RLS (Chính sách 3)
// chỉ cho phép đọc các mục 'confirmed'.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { found: false, error: "Thiếu nội dung tra cứu" },
        { status: 400 }
      );
    }

    // Tra cứu trong "file chính" (VIEW) 'confirmed_scams'
    const { data, error } = await supabase
      .from("confirmed_scams") // Tên VIEW bạn đã tạo
      .select("content, type, created_at") // <--- ĐÃ XÓA "description"
      .eq("content", content) // Tìm chính xác nội dung (SĐT hoặc website)
      .single(); // Chỉ lấy 1 kết quả

    if (error && error.code !== "PGRST116") {
      // PGRST116 là lỗi "không tìm thấy hàng nào", đây là trường hợp BÌNH THƯỜNG
      console.error("Lỗi Supabase (check-db):", error);
      return NextResponse.json({ found: false, error: error.message }, { status: 500 });
    }

    if (data) {
      // TÌM THẤY!
      // 'data' bây giờ sẽ không còn chứa 'description'
      return NextResponse.json({ found: true, data: data });
    } else {
      // KHÔNG TÌM THẤY
      return NextResponse.json({ found: false, data: null });
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Lỗi máy chủ nội bộ";
    return NextResponse.json({ found: false, error: errorMessage }, { status: 500 });
  }
}