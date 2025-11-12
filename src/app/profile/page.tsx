"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // === State cho Form 1: Thông tin cá nhân ===
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // === State cho Form 2: Mật khẩu ===
  const [oldPassword, setOldPassword] = useState(""); // THÊM MỚI
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // 1. Tải dữ liệu người dùng khi component được mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setEmail(user.email || "");

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single(); 

        if (error && error.code !== "PGRST116") {
          console.error("Lỗi tải hồ sơ:", error);
          setProfileError("Không thể tải thông tin hồ sơ.");
        }

        if (profile) {
          setFullName(profile.full_name || "");
        }
      } catch (e) {
        console.error(e);
        setProfileError("Đã xảy ra lỗi khi tải dữ liệu.");
      }

      setLoading(false);
    };

    fetchUserData();
  }, [supabase, router]);

  // 2. Xử lý Cập nhật Thông tin Hồ sơ (Form 1)
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMessage("");
    setProfileError("");
    setIsSavingProfile(true);

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) {
      setProfileError(`Lỗi cập nhật: ${error.message}`);
    } else {
      setProfileMessage("Cập nhật thông tin thành công!");
    }
    setIsSavingProfile(false);
  };

  // 3. Xử lý Cập nhật Mật khẩu (Form 2) - ĐÃ CẬP NHẬT
  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (!oldPassword) {
      setPasswordError("Vui lòng nhập mật khẩu cũ.");
      return;
    }

    setIsSavingPassword(true);

    // Bước 1: Kiểm tra mật khẩu cũ có đúng không
    // Chúng ta làm điều này bằng cách thử "đăng nhập lại"
    if (!user || !user.email) {
      setPasswordError("Không tìm thấy thông tin người dùng.");
      setIsSavingPassword(false);
      return;
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (reauthError) {
      setPasswordError("Mật khẩu cũ không đúng.");
      setIsSavingPassword(false);
      return;
    }

    // Bước 2: Nếu mật khẩu cũ đúng, tiến hành cập nhật mật khẩu mới
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setPasswordError(`Lỗi cập nhật mật khẩu: ${updateError.message}`);
    } else {
      setPasswordMessage("Cập nhật mật khẩu thành công!");
      // Xóa tất cả trường mật khẩu sau khi thành công
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsSavingPassword(false);
  };

  // 4. HÀM MỚI: Xử lý Quên mật khẩu
  const handleForgotPassword = async () => {
    setPasswordMessage("");
    setPasswordError("");

    if (!email) {
      setPasswordError("Không tìm thấy email người dùng.");
      return;
    }

    setPasswordMessage("Đang gửi email khôi phục...");
    
    // Yêu cầu Supabase gửi link/OTP khôi phục
    // (Cần cấu hình template "Reset password" trong Supabase)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`, // Trang bạn muốn họ đến
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMessage("Đã gửi email khôi phục. Vui lòng kiểm tra hộp thư.");
    }
  };


  // Hiển thị trạng thái tải
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-white">
        Đang tải thông tin...
      </div>
    );
  }

  // Giao diện chính
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="w-full max-w-lg p-8 space-y-8">
        
        {/* --- Card 1: Thông tin tài khoản --- */}
        <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 p-8">
          {/* ... (Form 1 không thay đổi) ... */}
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Thông tin tài khoản
          </h1>
          
          {profileMessage && <p className="text-center text-green-500 mb-4">{profileMessage}</p>}
          {profileError && <p className="text-center text-red-500 mb-4">{profileError}</p>}

          <form className="space-y-6" onSubmit={handleProfileUpdate}>
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email" id="email" name="email"
                value={email}
                disabled
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 focus:outline-none"
              />
            </div>

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

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
              {isSavingProfile ? "Đang lưu..." : "Cập nhật thông tin"}
            </button>
          </form>
        </div>

        {/* --- Card 2: Đổi mật khẩu --- (ĐÃ CẬP NHẬT) */}
        <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Thay đổi mật khẩu
          </h1>

          {passwordMessage && <p className="text-center text-green-500 mb-4">{passwordMessage}</p>}
          {passwordError && <p className="text-center text-red-500 mb-4">{passwordError}</p>}

          <form className="space-y-6" onSubmit={handlePasswordUpdate}>
            {/* THÊM MỚI: Mật khẩu cũ */}
            <div>
              <div className="flex justify-between items-center">
                <label 
                  htmlFor="oldPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mật khẩu cũ
                </label>
                {/* THÊM MỚI: Nút Quên mật khẩu */}
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  Quên mật khẩu?
                </button>
              </div>
              <input
                type="password" id="oldPassword" name="oldPassword" required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label 
                htmlFor="newPassword" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mật khẩu mới
              </label>
              <input
                type="password" id="newPassword" name="newPassword" required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Xác nhận mật khẩu mới
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
              disabled={isSavingPassword}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
              {isSavingPassword ? "Đang lưu..." : "Thay đổi mật khẩu"}
            </button>
          </form>
        </div>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          <Link href="/" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Quay về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}