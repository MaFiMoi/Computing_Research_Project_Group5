"use client";

import Link from "next/link";
// Thêm useCallback vào import
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Turnstile } from "@marsidev/react-turnstile";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  // === STATE QUẢN LÝ UI ===
  const [step, setStep] = useState<'LOGIN' | 'MFA'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // === STATE DỮ LIỆU ===
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  
  // === STATE MFA ===
  const [mfaCode, setMfaCode] = useState("");
  const [factorId, setFactorId] = useState("");

  // --- HÀM 1: Kiểm tra Role và Chuyển hướng (Dùng chung) ---
  // SỬA: Dùng useCallback để ổn định hàm này
  const checkRoleAndRedirect = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Không lấy được profile, chuyển về trang chủ:", error.message);
        router.push("/");
        return;
      }

      if (profile?.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh(); 
    } catch (err) {
      console.error(err);
      router.push("/");
    }
  }, [router, supabase]); // Dependencies của checkRoleAndRedirect

  // --- HÀM 2: Xử lý Đăng nhập (Bước 1: Captcha + Pass) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate mật khẩu: Chữ cái đầu viết hoa + ít nhất 8 ký tự
    const passwordRegex = /^[A-Z].{7,}$/;
    if (!passwordRegex.test(password)) {
        setError("Mật khẩu phải có ít nhất 8 ký tự và chữ cái đầu viết hoa.");
        return;
    }

    setIsLoading(true);

    if (!captchaToken) {
      setError("Vui lòng xác nhận bạn không phải là người máy.");
      setIsLoading(false);
      return;
    }

    try {
      const verifyRes = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      });
      
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setError("Captcha không hợp lệ. Vui lòng thử lại.");
        setIsLoading(false);
        setCaptchaToken(""); 
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setIsLoading(false);
        setCaptchaToken(""); 
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email hoặc mật khẩu không đúng.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Tài khoản chưa xác thực email.");
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (!data.user) {
        setError("Lỗi không xác định: Không tìm thấy user.");
        setIsLoading(false);
        return;
      }

      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (aalError) throw aalError;

      if (aalData && aalData.nextLevel === 'aal2') {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp.find(f => f.status === 'verified');

        if (totpFactor) {
          setFactorId(totpFactor.id);
          setStep('MFA'); 
          setIsLoading(false); 
          return;
        }
      }

      await checkRoleAndRedirect(data.user.id);

    } catch (err: any) {
      setError("Đã xảy ra lỗi hệ thống.");
      console.error(err);
      setIsLoading(false);
      setCaptchaToken("");
    }
  };

  // --- HÀM 3: Xử lý MFA (Bước 2: Verify code) ---
  // SỬA: Dùng useCallback để hàm này có thể đưa vào useEffect an toàn
  const verifyMfa = useCallback(async (code: string) => {
    setIsLoading(true);
    setError("");

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });
      if (challengeError) throw challengeError;

      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: code,
      });

      if (verifyError) throw verifyError;

      await checkRoleAndRedirect(verifyData.user.id);

    } catch (err: any) {
      setError("Mã xác thực không đúng.");
      setIsLoading(false);
      setMfaCode(""); 
    }
  }, [factorId, supabase, checkRoleAndRedirect]); // Dependencies của verifyMfa

  // --- EFFECT: Tự động submit khi đủ 6 số ---
  // SỬA: Đã thêm đầy đủ dependencies
  useEffect(() => {
    if (step === 'MFA' && mfaCode.length === 6) {
      verifyMfa(mfaCode);
    }
  }, [step, mfaCode, verifyMfa]);

  // --- HÀM 4: Đăng nhập Google ---
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
  };

  // ================= GIAO DIỆN =================

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {step === 'LOGIN' ? 'Đăng nhập' : 'Xác thực 2 bước'}
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          {step === 'LOGIN' ? 'Chào mừng bạn quay trở lại' : 'Nhập mã từ ứng dụng Google Authenticator'}
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* --- FORM 1: EMAIL & PASS --- */}
        {step === 'LOGIN' && (
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-center min-h-[65px]">
              <Turnstile
                siteKey={SITE_KEY}
                onSuccess={(token: string) => setCaptchaToken(token)}
                onError={() => setError("Không thể tải Captcha")}
                onExpire={() => setCaptchaToken("")}
              />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400 transition-colors"
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Hoặc tiếp tục với</span>
              </div>
            </div>

            <button
              type="button" onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Google
            </button>
          </form>
        )}

        {/* --- FORM 2: MFA INPUT --- */}
        {step === 'MFA' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-full">
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
            </div>

            <input
              type="text" maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))} // Chỉ nhận số
              autoFocus
              disabled={isLoading}
              placeholder="000 000"
              className="w-full text-center text-3xl tracking-[0.5em] py-2 border-b-2 border-gray-300 focus:border-indigo-600 dark:bg-transparent dark:text-white dark:border-gray-600 outline-none transition-colors font-mono"
            />
            
            {isLoading && <p className="text-center text-sm text-indigo-600 animate-pulse">Đang xác thực...</p>}

            <button
              onClick={() => {
                setStep('LOGIN');
                setMfaCode("");
                setPassword("");
                setCaptchaToken("");
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              ← Quay lại đăng nhập
            </button>
          </div>
        )}

        {/* Footer Link */}
        {step === 'LOGIN' && (
          <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Đăng ký ngay
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}