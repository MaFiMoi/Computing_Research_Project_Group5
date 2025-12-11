"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabaseClient"; // Đảm bảo đường dẫn đúng
// 1. Import thư viện Turnstile
import { Turnstile } from "@marsidev/react-turnstile";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. State cho Captcha
  const [captchaToken, setCaptchaToken] = useState("");

  const supabase = createClient();
  // Lấy Site Key từ .env
  const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // --- Validate cơ bản ---
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      setIsLoading(false);
      return;
    }

    // --- Validate Captcha ---
    if (!captchaToken) {
      setError("Vui lòng xác nhận bạn không phải là người máy.");
      setIsLoading(false);
      return;
    }

    try {
      // (Tùy chọn) Gọi API verify-turnstile nếu bạn muốn bảo mật tuyệt đối từ server
      // Nếu chỉ cần check client, bước này có thể bỏ qua, nhưng khuyên dùng.
      const verifyRes = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setError("Lỗi xác thực Captcha. Vui lòng thử lại.");
        setIsLoading(false);
        setCaptchaToken(""); // Reset để user bấm lại
        return;
      }

      // --- Gửi đăng ký sang Supabase ---
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName 
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          setError("Email này đã được sử dụng.");
        } else if (signUpError.message.includes("Password should be")) {
          setError("Mật khẩu quá yếu. Vui lòng sử dụng ít nhất 6 ký tự.");
        } else {
          setError(signUpError.message);
        }
        setIsLoading(false);
        setCaptchaToken(""); // Reset khi lỗi
        return;
      }

      // Thành công -> Chuyển hướng
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);

    } catch (err: any) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    // Background Gradient đẹp mắt
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      
      {/* Card Container với Shadow và Bo góc lớn hơn */}
      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:bg-gray-800/90 dark:border-gray-700 transition-all">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Tạo tài khoản mới
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tham gia cùng chúng tôi ngay hôm nay
          </p>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-pulse dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
            ⚠️ {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Input Group: Họ tên */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Họ và tên
            </label>
            <input
              type="text" id="fullName" name="fullName" required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:bg-gray-600"
            />
          </div>
          
          {/* Input Group: Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email" id="email" name="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:bg-gray-600"
            />
          </div>

          {/* Input Group: Mật khẩu (2 cột) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mật khẩu
              </label>
              <input
                type="password" id="password" name="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:bg-gray-600"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nhập lại
              </label>
              <input
                type="password" id="confirmPassword" name="confirmPassword" required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:bg-gray-600"
              />
            </div>
          </div>

          {/* --- WIDGET CAPTCHA --- */}
          <div className="flex justify-center py-2">
            {SITE_KEY ? (
               <Turnstile
               siteKey={SITE_KEY}
               onSuccess={(token: string) => setCaptchaToken(token)}
               onError={() => setError("Không tải được Captcha")}
               onExpire={() => setCaptchaToken("")}
             />
            ) : (
              <p className="text-red-500 text-xs">Chưa cấu hình Site Key</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/30"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng ký tài khoản"
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Hoặc</span>
          </div>
        </div>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}