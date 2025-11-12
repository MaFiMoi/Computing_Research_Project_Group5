// file: app/verify-otp/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  // Lấy email từ URL khi component được tải
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl));
    } else {
      // Nếu không có email, quay về trang đăng ký
      setError("Không tìm thấy email. Vui lòng thử lại.");
      setTimeout(() => router.push("/register"), 2000);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email || !otp) {
      setError("Vui lòng nhập mã OTP.");
      setIsLoading(false);
      return;
    }

    try {
      // Dùng hàm verifyOtp của Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: "signup", // Rất quan trọng: chỉ định type là 'signup'
      });

      if (verifyError) {
        if (verifyError.message.includes("expired")) {
          setError("Mã OTP đã hết hạn. Vui lòng thử đăng ký lại.");
        } else {
          setError("Mã OTP không hợp lệ. Vui lòng kiểm tra lại.");
        }
        setIsLoading(false);
        return;
      }

      // XÁC THỰC THÀNH CÔNG
      if (data.user) {
        setSuccess("Xác thực thành công! Đang chuyển đến trang đăng nhập...");
        
        // Chuyển về trang ĐĂNG NHẬP theo yêu cầu của bạn
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }

    } catch (err: any) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Xác thực Email
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Chúng tôi đã gửi mã OTP đến <strong>{email}</strong>. Vui lòng kiểm tra
          hộp thư của bạn.
        </p>

        {error && <p className="text-center text-red-500">{error}</p>}
        {success && <p className="text-center text-green-500">{success}</p>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mã OTP (6 chữ số)
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? "Đang xác thực..." : "Xác thực"}
          </button>
        </form>
      </div>
    </div>
  );
}