"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
// 1. Import Supabase client
import { createClient } from "@/lib/supabaseClient"; 

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Chúng ta có thể không cần 'success' ở đây nữa
  const [isLoading, setIsLoading] = useState(false);

  // 2. Khởi tạo Supabase client
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(""); // Xóa thông báo thành công cũ
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      setIsLoading(false);
      return;
    }

    try {
      // 3. TẠO USER TRONG SUPABASE AUTH
      // Bỏ 'options: { emailRedirectTo: ... }' vì chúng ta dùng OTP
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) {
        // Xử lý lỗi đăng ký
        if (signUpError.message.includes("User already registered")) {
          setError("Email này đã được sử dụng.");
        } else if (signUpError.message.includes("Password should be")) {
          setError("Mật khẩu quá yếu. Vui lòng sử dụng ít nhất 6 ký tự.");
        } else {
          setError(signUpError.message);
        }
        setIsLoading(false);
        return;
      }

      // 4. KIỂM TRA NẾU ĐĂNG KÝ THÀNH CÔNG
      if (data.user) {
        
        // 5. LƯU THÔNG TIN BỔ SUNG VÀO DATABASE
        // Ghi vào bảng 'profiles'
        const { error: profileError } = await supabase
          .from("profiles") // Tên bảng của bạn
          .insert({
            id: data.user.id,        // Lấy 'id' từ user vừa tạo
            full_name: fullName,   // Lưu tên người dùng
            email: data.user.email,  // Lưu email
            // 'created_at' sẽ được database tự động điền (như chúng ta đã sửa)
          });

        if (profileError) {
          // Xử lý lỗi nếu không lưu được vào 'profiles'
          setError(`Lỗi tạo hồ sơ: ${profileError.message}. Vui lòng liên hệ hỗ trợ.`);
          setIsLoading(false);
          // TODO: Nên xóa user auth vừa tạo nếu bước này thất bại
          return;
        }

        // 6. CHUYỂN HƯỚNG SANG TRANG XÁC THỰC OTP
        // Supabase đã tự động gửi email OTP
        // Chuyển hướng và mang theo email
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);

      } else {
        // Trường hợp hiếm gặp khi không có lỗi nhưng user cũng không có
        setError("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
      }

    } catch (err: any) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Phần JSX (return) giữ nguyên, không cần thay đổi
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Tạo tài khoản
        </h1>
        
        {error && <p className="text-center text-red-500">{error}</p>}
        {/* Không cần 'success' vì chúng ta chuyển trang ngay lập tức */}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Trường Họ tên */}
          <div>
            <label 
              htmlFor="fullName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Họ và tên
            </label>
            <input
              type="text" id="fullName" name="fullName" required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email" id="email" name="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mật khẩu
            </label>
            <input
              type="password" id="password" name="password" required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Nhập lại Mật khẩu */}
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nhập lại mật khẩu
            </label>
            <input
              type="password" id="confirmPassword" name="confirmPassword" required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}