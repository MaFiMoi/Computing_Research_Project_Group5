// app/api/verify-turnstile/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { token } = body;
  const secretKey = process.env.TURNSTILE_SECRET_KEY; // Lấy từ .env

  if (!token) {
    return NextResponse.json({ success: false, message: 'Thiếu Token CAPTCHA' }, { status: 400 });
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey!);
    formData.append('response', token);

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const result = await fetch(url, {
      body: formData,
      method: 'POST',
    });

    const outcome = await result.json();

    if (outcome.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Xác thực CAPTCHA thất bại' }, { status: 400 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}