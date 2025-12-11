// src/app/reset-password/page.tsx
"use client";

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();

    // Dùng state để quản lý email, otp và mật khẩu
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Dùng state để quản lý giao diện (bước 1 hay bước 2)
    const [step, setStep] = useState(1); // 1: Nhập Email, 2: Nhập OTP & Mật khẩu mới

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Xử lý Bước 1: Gửi yêu cầu OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Gọi hàm của Supabase để gửi email
        // Email này sẽ chứa OTP (theo template bạn đã sửa)
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: '', // Không cần redirect, vì chúng ta tự xử lý
        });

        setLoading(false);
        if (resetError) {
            setError('Lỗi: ' + resetError.message);
        } else {
            setMessage('Đã gửi OTP vào email của bạn. Vui lòng kiểm tra.');
            setStep(2); // Chuyển sang bước 2
        }
    };

    // Xử lý Bước 2: Xác thực OTP và Đặt mật khẩu mới
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp!');
            setLoading(false);
            return;
        }

        // 1. Dùng OTP để xác thực người dùng
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
            email: email,
            token: otp,
            type: 'recovery', // Rất quan trọng, phải là 'recovery'
        });

        if (verifyError) {
            setError('OTP không hợp lệ hoặc đã hết hạn. ' + verifyError.message);
            setLoading(false);
            return;
        }

        // 2. Nếu OTP đúng, Supabase đã tự động đăng nhập người dùng (tạm thời)
        // Giờ ta có thể gọi hàm `updateUser` để đặt mật khẩu mới
        const { error: updateError } = await supabase.auth.updateUser({
            password: password
        });

        setLoading(false);
        if (updateError) {
            setError('Lỗi khi cập nhật mật khẩu: ' + updateError.message);
        } else {
            setMessage('Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
    };

    return (
        <main style={{ padding: '2rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>Quên mật khẩu</h1>

            {/* Hiển thị thông báo Lỗi hoặc Thành công */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            {/* GIAI ĐOẠN 1: NHẬP EMAIL */}
            {step === 1 && (
                <form onSubmit={handleSendOtp} style={{ width: '300px' }}>
                    <p>Nhập email của bạn để nhận mã OTP.</p>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? 'Đang gửi...' : 'Gửi OTP'}
                    </button>
                </form>
            )}

            {/* GIAI ĐOẠN 2: NHẬP OTP VÀ MẬT KHẨU MỚI */}
            {step === 2 && (
                <form onSubmit={handleResetPassword} style={{ width: '300px' }}>
                    <p>Vui lòng kiểm tra email (bao gồm cả spam) để lấy mã OTP.</p>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Mã OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? 'Đang xử lý...' : 'Xác nhận và Đổi mật khẩu'}
                    </button>
                </form>
            )}
        </main>
        // Bạn có thể thêm Header/Footer của mình ở đây
    );
}

// Thêm một vài style cơ bản để form dễ nhìn
const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box' as 'border-box' // Cần thiết cho TypeScript
};

const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};