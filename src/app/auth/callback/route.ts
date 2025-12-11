// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Lấy URL từ request
  const requestUrl = new URL(request.url);
  
  // Lấy 'code' xác thực từ query params
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    
    // Tạo một Supabase client phía server
    // (Lưu ý: Bạn cần cài @supabase/auth-helpers-nextjs)
    // npm install @supabase/auth-helpers-nextjs
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Trao đổi 'code' để lấy session (phiên làm việc)
    // Server sẽ tự động thiết lập cookie xác thực
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Sau khi thiết lập cookie, chuyển hướng về trang chủ
  return NextResponse.redirect(requestUrl.origin);
}