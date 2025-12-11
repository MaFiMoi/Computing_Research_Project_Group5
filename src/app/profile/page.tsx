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
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'security'>('info');

  // === State: Thông tin cá nhân ===
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // === State: Mật khẩu ===
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // === State: Bảo mật (MFA) ===
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isEnrollingMFA, setIsEnrollingMFA] = useState(false);
  const [qrCode, setQrCode] = useState(""); // URL ảnh QR
  const [mfaSecret, setMfaSecret] = useState(""); // Mã text để nhập tay
  const [verifyCode, setVerifyCode] = useState(""); // Mã 6 số user nhập
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [factorIdToVerify, setFactorIdToVerify] = useState(""); // Lưu ID factor đang chờ verify

  // 1. Tải dữ liệu
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

      // Lấy Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile) setFullName(profile.full_name || "");

      // Kiểm tra MFA status
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp?.some(f => f.status === 'verified')) {
        setMfaEnabled(true);
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [supabase, router]);

  // === LOGIC TỰ ĐỘNG SUBMIT KHI NHẬP ĐỦ 6 SỐ MFA ===
  useEffect(() => {
    if (showMFASetup && verifyCode.length === 6) {
      handleVerifyMFA();
    }
  }, [verifyCode]);

  // 2. Update Profile
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMessage(""); setProfileError(""); setIsSavingProfile(true);
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) setProfileError(error.message);
    else setProfileMessage("Cập nhật thành công!");
    
    setIsSavingProfile(false);
  };

  // 3. Password Reset Logic
  const handleSendOtp = async () => {
    setPasswordMessage(""); setPasswordError(""); setIsSendingOtp(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: '' });
    setIsSendingOtp(false);
    if (error) setPasswordError(error.message);
    else {
      setPasswordMessage("Đã gửi OTP vào email.");
      setOtpSent(true);
    }
  };

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(""); setPasswordError("");
    if (newPassword !== confirmPassword) return setPasswordError("Mật khẩu không khớp.");
    
    setIsSavingPassword(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email, token: otp, type: 'recovery',
    });

    if (verifyError) {
      setPasswordError("OTP sai hoặc hết hạn.");
      setIsSavingPassword(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) setPasswordError(updateError.message);
    else {
      setPasswordMessage("Đổi mật khẩu thành công!");
      setOtpSent(false); setOtp(""); setNewPassword(""); setConfirmPassword("");
    }
    setIsSavingPassword(false);
  };

  // 4. === LOGIC MFA (QUAN TRỌNG) ===

  const handleEnableMFA = async () => {
    setSecurityMessage(""); setSecurityError(""); setIsEnrollingMFA(true);

    try {
      // Dọn dẹp: Xóa các factor "rác" (chưa verified) trước khi tạo mới
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp) {
        for (const f of factors.totp) {
          if ((f.status as string) === 'unverified') {
            await supabase.auth.mfa.unenroll({ factorId: f.id });
          }
        }
      }

      // Tạo factor mới
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App' // Tên hiển thị trong app Google Auth
      });

      if (error) throw error;

      // Lưu thông tin để hiển thị và verify
      setFactorIdToVerify(data.id);
      setQrCode(data.totp.qr_code); // Supabase trả về Data URI (SVG)
      setMfaSecret(data.totp.secret);
      setShowMFASetup(true);

    } catch (e: any) {
      setSecurityError(e.message || "Lỗi tạo MFA");
    } finally {
      setIsEnrollingMFA(false);
    }
  };

  const handleVerifyMFA = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setSecurityMessage(""); setSecurityError("");

    try {
      // 1. Tạo challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorIdToVerify
      });
      if (challengeError) throw challengeError;

      // 2. Verify mã user nhập
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorIdToVerify,
        challengeId: challengeData.id,
        code: verifyCode
      });

      if (verifyError) {
        setSecurityError("Mã không đúng. Vui lòng thử lại.");
        setVerifyCode(""); // Xóa để nhập lại
      } else {
        setSecurityMessage("Đã kích hoạt xác thực 2 yếu tố!");
        setMfaEnabled(true);
        setShowMFASetup(false);
        // Reset state rác
        setVerifyCode(""); setQrCode(""); setMfaSecret(""); setFactorIdToVerify("");
      }
    } catch (e: any) {
      setSecurityError(e.message || "Lỗi xác thực MFA");
    }
  };

  const handleDisableMFA = async () => {
    if (!confirm("Bạn chắc chắn muốn tắt 2FA? Tài khoản sẽ kém bảo mật hơn.")) return;
    
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp) {
        // Xóa hết các factors
        await Promise.all(factors.totp.map(f => supabase.auth.mfa.unenroll({ factorId: f.id })));
        setMfaEnabled(false);
        setSecurityMessage("Đã tắt xác thực 2 yếu tố.");
      }
    } catch (e: any) {
      setSecurityError("Lỗi khi tắt MFA.");
    }
  };

  // Helper: Copy mã secret
  const copyToClipboard = () => {
    navigator.clipboard.writeText(mfaSecret);
    alert("Đã sao chép mã bí mật!");
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Đang tải...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="w-full max-w-2xl p-8">
        
        {/* Header Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
           <div className="flex border-b dark:border-gray-700">
            {['info', 'password', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600 dark:bg-gray-700 dark:text-indigo-400' 
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {tab === 'info' ? 'Thông tin' : tab === 'password' ? 'Mật khẩu' : 'Bảo mật (2FA)'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* === TAB 1: INFO === */}
            {activeTab === 'info' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {profileMessage && <p className="text-green-600 text-center">{profileMessage}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input value={email} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border rounded-md dark:bg-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ tên</label>
                  <input 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                <button disabled={isSavingProfile} className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                  {isSavingProfile ? "Đang lưu..." : "Cập nhật hồ sơ"}
                </button>
              </form>
            )}

            {/* === TAB 2: PASSWORD === */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                {passwordMessage && <p className="text-green-600 text-center">{passwordMessage}</p>}
                {passwordError && <p className="text-red-600 text-center">{passwordError}</p>}
                
                {!otpSent ? (
                  <button type="button" onClick={handleSendOtp} disabled={isSendingOtp} className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    {isSendingOtp ? "Đang gửi..." : "Gửi mã OTP để đổi mật khẩu"}
                  </button>
                ) : (
                  <>
                    <input 
                      placeholder="Nhập mã OTP từ email"
                      value={otp} onChange={e => setOtp(e.target.value)}
                      className="block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <input 
                      type="password" placeholder="Mật khẩu mới"
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <input 
                      type="password" placeholder="Xác nhận mật khẩu"
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <button disabled={isSavingPassword} className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md">
                      {isSavingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* === TAB 3: SECURITY (MFA) === */}
            {activeTab === 'security' && (
              <div>
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Trạng thái 2FA</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{mfaEnabled ? "Tài khoản của bạn đang được bảo vệ." : "Chưa kích hoạt."}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {mfaEnabled ? 'Đã bật' : 'Chưa bật'}
                  </span>
                </div>

                {securityError && <p className="mb-4 text-red-600 text-center bg-red-50 p-2 rounded">{securityError}</p>}
                {securityMessage && <p className="mb-4 text-green-600 text-center bg-green-50 p-2 rounded">{securityMessage}</p>}

                {!mfaEnabled && !showMFASetup && (
                  <button onClick={handleEnableMFA} disabled={isEnrollingMFA} className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium shadow-sm">
                    {isEnrollingMFA ? "Đang khởi tạo..." : "Kích hoạt Google Authenticator"}
                  </button>
                )}

                {showMFASetup && (
                  <div className="bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 rounded-lg p-6 space-y-6">
                    <div className="text-center">
                      <h4 className="font-medium text-lg mb-2 text-gray-900 dark:text-white">1. Quét mã QR</h4>
                      <p className="text-sm text-gray-500 mb-4">Mở ứng dụng Google Authenticator và quét mã này:</p>
                      
                      {/* Hiển thị QR Code */}
                      {qrCode && (
                        <div className="inline-block p-2 bg-white rounded-lg border shadow-sm">
                          <img src={qrCode} alt="QR Code" className="w-48 h-48 object-contain" />
                        </div>
                      )}
                      
                      {/* Hiển thị mã Text nếu không quét được */}
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-1">Không quét được? Nhập mã này:</p>
                        <div className="flex items-center justify-center space-x-2">
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono select-all">
                            {mfaSecret}
                          </code>
                          <button onClick={copyToClipboard} type="button" className="text-xs text-indigo-600 hover:underline">
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 dark:border-gray-600">
                      <h4 className="font-medium text-lg mb-2 text-center text-gray-900 dark:text-white">2. Nhập mã xác nhận</h4>
                      <p className="text-sm text-gray-500 mb-4 text-center">Nhập mã 6 số từ ứng dụng để hoàn tất.</p>
                      
                      <input
                        type="text"
                        maxLength={6}
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000 000"
                        className="block w-full text-center text-2xl tracking-[0.5em] font-mono py-2 border-b-2 border-gray-300 focus:border-indigo-600 outline-none bg-transparent dark:text-white dark:border-gray-500 transition-colors"
                      />
                      
                      <div className="mt-6 flex space-x-3">
                         <button 
                          onClick={() => { setShowMFASetup(false); setVerifyCode(""); }}
                          className="flex-1 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-600 dark:text-white"
                        >
                          Hủy bỏ
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {mfaEnabled && (
                  <button onClick={handleDisableMFA} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100">
                    Tắt xác thực 2 yếu tố
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-6">
           <Link href="/" className="text-indigo-600 hover:underline text-sm">← Quay lại trang chủ</Link>
        </div>
      </div>
    </div>
  );
}