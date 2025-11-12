"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
// 1. Import Supabase client
import { createClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. Khởi tạo Supabase client
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 3. Đăng nhập bằng Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        // 4. Xử lý lỗi
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email hoặc mật khẩu không đúng.");
        } else if (signInError.message.includes("Email not confirmed")) {
          // Đây là phần thay thế cho (user.emailVerified) của Firebase
          setError("Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn.");
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      // 5. Đăng nhập thành công
      // Gói auth-helpers sẽ tự động xử lý cookie
      // Chuyển hướng đến trang chủ
      router.push("/");
      
      // Quan trọng: Refresh lại trang để Server Components
      // nhận được session mới
      router.refresh(); 

    } catch (err: any) {
      // Lỗi chung (ví dụ: mất mạng)
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
          Đăng nhập
        </h1>
        
        {error && <p className="text-center text-red-500">{error}</p>}

        <form className="space-y-6" onSubmit={handleSubmit}>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
            {isLoading ? "Đang tải..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}