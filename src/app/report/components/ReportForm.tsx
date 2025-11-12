"use client";
// 1. Import thêm useEffect và useState
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
// 2. Import kiểu 'User' để dùng với state
import { User } from "@supabase/supabase-js";

export default function ReportForm() {
  // 3. Khởi tạo client
  const supabase = createClient();

  // 4. Thêm state để lưu thông tin user và trạng thái tải
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Bắt đầu = true

  // State của form (giữ nguyên)
  const [report_type, setReportType] = useState("");
  const [report_value, setReportValue] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 5. Thêm useEffect để kiểm tra user khi component tải
  useEffect(() => {
    // Hàm này chạy 1 lần khi component mount
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthLoading(false); // Đánh dấu là đã tải xong
    };

    fetchUser();

    // Thiết lập listener để tự động cập nhật UI nếu user đăng nhập/đăng xuất
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Dọn dẹp listener khi component unmount
    return () => {
    authListener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  // Sửa đổi handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;

    // 6. Thêm kiểm tra: Dù form đã bị ẩn,
    // đây là hàng rào bảo vệ cuối cùng
    if (!user) {
      setMessage("❌ Bạn phải đăng nhập để gửi báo cáo.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      let evidenceUrl: string | null = null;

      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: storageError } = await supabase.storage
          .from("evidence")
          .upload(fileName, file);

        if (storageError) {
          throw new Error(`Lỗi tải ảnh lên: ${storageError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("evidence")
          .getPublicUrl(fileName);
        
        evidenceUrl = urlData.publicUrl;
      }

      // 7. Sửa đổi newReport:
      // Vì chúng ta đã chắc chắn có user,
      // user_id sẽ là user.id (không còn là null)
      const newReport = {
        user_id: user.id, // <-- Thay đổi ở đây
        report_type: report_type,
        report_value: report_value,
        description: description,
        evidence_url: evidenceUrl,
      };

      const { error: dbError } = await supabase
        .from("userreports")
        .insert([newReport]);

      if (dbError) {
        throw new Error(`Lỗi lưu CSDL: ${dbError.message}`);
      }

      // Reset form
      setMessage("✅ Cảm ơn bạn đã báo cáo! Hệ thống sẽ xem xét sớm.");
      setReportType("");
      setReportValue("");
      setDescription("");
      setFile(null);
      setAgree(false);

    } catch (error: any) {
      setMessage(`❌ Lỗi: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Hiển thị có điều kiện dựa trên trạng thái auth
  const renderContent = () => {
    // TRƯỜNG HỢP 1: Đang kiểm tra auth
    if (isAuthLoading) {
      return (
        <div className="text-center p-8">
          <p>Đang tải...</p>
        </div>
      );
    }

    // TRƯỜNG HỢP 2: Chưa đăng nhập
    if (!user) {
      return (
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold mb-4">
            Vui lòng đăng nhập
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Bạn cần đăng nhập để có thể gửi báo cáo.
          </p>
          {/* Bạn có thể thêm link/button đăng nhập ở đây */}
          {/* <a href="/login" className="mt-4 inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
            Đi đến trang đăng nhập
          </a> */}
        </div>
      );
    }

    // TRƯỜNG HỢP 3: Đã đăng nhập (hiển thị form)
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (Toàn bộ JSX của form của bạn ở đây) ... */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Website / SĐT / Email cần báo cáo
          </label>
          <input
            type="text"
            required
            value={report_value}
            onChange={(e) => setReportValue(e.target.value)}
            placeholder="https://example.com hoặc +84912345678"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 dark:bg-trueGray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            Loại hình lừa đảo
          </label>
          <select
            required
            value={report_type}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 dark:bg-trueGray-900 dark:text-white"
          >
            <option value="">Chọn loại hình</option>
            <option value="fake_shopping">Trang web mua sắm giả mạo</option>
            <option value="phishing">Cuộc gọi / SMS lừa đảo (Phishing)</option>
            <option value="investment">Lừa đảo đầu tư / Tiền ảo</option>
            <option value="romance">Lừa đảo tình cảm</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            Mô tả (Tùy chọn)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chuyện gì đã xảy ra..."
            rows={4}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 dark:bg-trueGray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            Tải lên bằng chứng (Ảnh)
          </label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
          />
        </div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
            required
          />
          <span className="text-sm">
            Tôi đã đọc và đồng ý với các điều khoản báo cáo.
          </span>
        </label>
        <button
          type="submit"
          disabled={!agree || isLoading}
          className={`w-full text-white py-2 rounded-md transition font-semibold ${
            !agree || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isLoading ? "Đang gửi..." : "Gửi Báo Cáo"}
        </button>
        {message && (
          <p className="text-sm text-center mt-4">{message}</p>
        )}
      </form>
    );
  };

  // Render chính của component
  return (
    <div className="bg-white dark:bg-trueGray-800 shadow-md rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-indigo-600 mb-6 uppercase">
        Báo cáo Lừa đảo
      </h2>
      {renderContent()}
    </div>
  );
}