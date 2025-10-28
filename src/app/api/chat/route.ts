import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// Cấu hình cho OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

// Hàm kiểm tra SĐT đơn giản (chỉ cần là số và có độ dài phù hợp)
const isPhoneNumber = (str: string): boolean => {

  const phoneRegex = /^[0-9\+]{10,15}$/;
  return phoneRegex.test(str.replace(/[\s\-()]/g, '')); // Xóa khoảng trắng, gạch nối
};

// Hàm lấy thông tin SĐT từ Numlookupapi
async function getPhoneInfo(phoneNumber: string) {
  const apiKey = process.env.NUMLOOKUP_API_KEY;
  if (!apiKey) {
    console.log("Thiếu NUMLOOKUP_API_KEY, bỏ qua tra cứu SĐT.");
    return null;
  }

  try {
    const url = `https://api.numlookupapi.com/v1/validate/${phoneNumber}?apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Lỗi Numlookupapi: ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    // Chỉ lấy thông tin nếu SĐT 'valid'
    if (data && data.valid === true) {
      return {
        country: data.country_name || "Không rõ",
        carrier: data.carrier || "Không rõ",
        type: data.line_type || "Không rõ",
      };
    }
    return null;
  } catch (error) {
    console.error("Lỗi khi gọi Numlookupapi:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();
  let extraInfo = ""; // Thông tin bổ sung từ tra cứu

  // BƯỚC MỚI: Nếu prompt là SĐT, hãy tra cứu nó
  if (isPhoneNumber(prompt)) {
    const phoneInfo = await getPhoneInfo(prompt);
    if (phoneInfo) {
      extraInfo = ` (Thông tin tra cứu SĐT: Nhà mạng ${phoneInfo.carrier}, Loại SĐT ${phoneInfo.type}, Quốc gia ${phoneInfo.country}).`;
    }
  }
  
  // Tạo prompt cuối cùng cho AI (bao gồm thông tin tra cứu nếu có)
  const fullPrompt = `Hãy phân tích mục sau đây để xem nó có dấu hiệu lừa đảo hay không: "${prompt}"${extraInfo}. 
Vui lòng ưu tiên tra cứu thông tin trực tuyến về mục này. 
Nếu không tìm thấy báo cáo cụ thể, hãy phân tích các dấu hiệu chung dựa trên dữ liệu huấn luyện. 
Cung cấp câu trả lời ngắn gọn, đi thẳng vào vấn đề.`;

  try {
    const completion = await openai.chat.completions.create({
      // ✅ THAY ĐỔI DUY NHẤT:
      model: "minimax/minimax-m2:free", 
      messages: [{ role: "user", content: fullPrompt }],
    });

    return NextResponse.json({
      response: completion.choices[0]?.message?.content || "No response",
    });
  } catch (error) {
    // Xử lý lỗi nếu gọi API AI thất bại
    console.error("Lỗi khi gọi API AI:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Không thể xử lý yêu cầu bởi AI.";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}