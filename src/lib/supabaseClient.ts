// file: lib/supabaseClient.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Hàm này sẽ tạo một client mới mỗi khi được gọi
// Điều này là cần thiết cho Client Components trong App Router
export const createClient = () => createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});