import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- ĐỊNH NGHĨA INTERFACE ---
interface UserReport {
  id: string;
  created_at: string;
  description: string | null;
  report_type: string;
  status: string; // Quan trọng: dùng để lọc confirmed
}

interface AIAnalysisResult {
  scamType: string;
  shortWarning: string;
  riskLevel: "AN TOÀN" | "CẢNH BÁO" | "NGUY HIỂM";
  explanation: string;
  recommendations: string[];
}

// --- CẤU HÌNH ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- HELPER FUNCTIONS ---
const isUrl = (str: string) => /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i.test(str);
const isPhoneNumber = (str: string) => /^[0-9\+]{10,15}$/.test(str.replace(/[\s\-()]/g, ''));

async function getPhoneInfo(phoneNumber: string) {
  const apiKey = process.env.NUMLOOKUP_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `https://api.numlookupapi.com/v1/validate/${phoneNumber}?apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.valid) {
      return {
        carrier: data.carrier || "Không xác định",
        country: data.country_name || "Không xác định",
        type: data.line_type || "Không xác định"
      };
    }
    return null;
  } catch (error) { return null; }
}

async function getSafeBrowsingInfo(urlToCheck: string) {
  const apiKey = process.env.SAFE_BROWSING_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: "scam-checker", clientVersion: "1.0.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntries: [{ url: urlToCheck }]
        }
      })
    });
    const data = await res.json();
    return (data.matches && data.matches.length > 0)
      ? { status: "DANGEROUS", threat: data.matches[0].threatType }
      : { status: "SAFE" };
  } catch (e) { return null; }
}

function isHighRiskPhonePattern(phone: string): boolean {
  const cleanedPhone = phone.replace(/[\s\-()]/g, '');
  if (cleanedPhone.startsWith('024') || cleanedPhone.startsWith('028')) return true;
  const specialPatterns = [
    /9{5,}/, /8{5,}/, /6{5,}/, /5678/, /6789/, /456/,
    /6868/, /8686/, /3838/, /110/, /113/, /114/, /115/,
    /1900\d{4}/, /1800\d{4}/,
  ];
  return specialPatterns.some(pattern => pattern.test(cleanedPhone));
}

// --- AI ANALYSIS FUNCTION ---
async function analyzeReportsWithAI(reports: UserReport[], inputQuery: string): Promise<AIAnalysisResult | null> {
  if (reports.length === 0) return null;

  // Ghép các nội dung tố cáo lại để AI đọc
  const descriptions = reports
    .map(r => `- "${r.description}"`)
    .filter(d => d.length > 5)
    .join("\n");

  if (!descriptions) return null;

  const systemPrompt = `Bạn là chuyên gia an ninh mạng. Nhiệm vụ: Phân tích các tố cáo của người dùng về số điện thoại/URL: "${inputQuery}".
  
  DỮ LIỆU TỐ CÁO (Đã được xác thực):
  ${descriptions}
  
  YÊU CẦU OUTPUT (JSON Only):
  1. scamType: Loại hình lừa đảo chính.
  2. shortWarning: Một câu cảnh báo ngắn gọn (max 10 từ).
  3. riskLevel: "AN TOÀN" | "CẢNH BÁO" | "NGUY HIỂM".
  4. explanation: Tóm tắt hành vi lừa đảo trong 1 câu.
  5. recommendations: 3 hành động cụ thể người dùng nên làm.

  Output JSON format:
  {
    "scamType": "string",
    "shortWarning": "string",
    "riskLevel": "AN TOÀN" | "CẢNH BÁO" | "NGUY HIỂM",
    "explanation": "string",
    "recommendations": ["string", "string", "string"]
  }`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as AIAnalysisResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
}

// --- API HANDLER ---
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập thông tin" }, { status: 400 });
    }

    const normalizedPrompt = prompt.replace(/[\s\-()]/g, '');
    let finalResultData: any = null;
    let isFromCache = false;

    // 1. CHECK CACHE (Search Logs)
    try {
      const { data: cachedData } = await supabase
        .from("search_logs")
        .select("result")
        .eq("query", normalizedPrompt)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cachedData && cachedData.result) {
        finalResultData = cachedData.result;
        isFromCache = true;
      }
    } catch (e) {}

    // 2. LẤY REPORT VÀ LỌC TRẠNG THÁI (Logic mới)
    const { data: rawUserReports } = await supabase
      .rpc('get_scam_reports', { input_phone: normalizedPrompt });
    
    // [UPDATE] Chỉ lấy các report có status là confirmed
    const reports = ((rawUserReports as UserReport[]) || []).filter(report => 
        report.status && report.status.toLowerCase() === 'confirmed'
    );

    // 3. XỬ LÝ LOGIC (Nếu không có cache hoặc có report xác thực mới)
    // Nếu có report xác thực (reports.length > 0) thì bắt buộc chạy lại phân tích đè lên cache cũ
    if (!isFromCache || reports.length > 0) { 
      
      let technicalDetails = { carrier: "N/A", location: "N/A", lineType: "N/A" };
      let isHighRiskPattern = false;
      let dbRecord = null;

      // 3.1 Lấy thông tin nhà mạng (Database)
      try {
        let { data } = await supabase.from("nhamang_thuebao").select("*").eq("dauso", normalizedPrompt).single();
        if (!data && normalizedPrompt.length >= 3) {
           const prefix = normalizedPrompt.substring(0, 3);
           const result = await supabase.from("nhamang_thuebao").select("*").eq("dauso", prefix).single();
           data = result.data;
        }
        if (data) {
          dbRecord = data;
          technicalDetails = { carrier: data.tennhamang || "VN", location: "VN", lineType: data.loaithuebao || "Di động" };
        }
      } catch (e) {}

      // 3.2 API ngoài (Phone/URL)
      if (isPhoneNumber(prompt) && !dbRecord) {
        const phoneData = await getPhoneInfo(prompt);
        if (phoneData) {
          technicalDetails = { carrier: phoneData.carrier, location: phoneData.country, lineType: phoneData.type };
        }
        isHighRiskPattern = isHighRiskPhonePattern(prompt);
      } else if (isUrl(prompt)) {
        const sb = await getSafeBrowsingInfo(prompt);
        if (sb && sb.status === "DANGEROUS") isHighRiskPattern = true;
      }

      // 3.3 Phân tích cơ bản (Base Analysis)
      let baseRiskLevel = isHighRiskPattern ? "NGUY HIỂM" : (isPhoneNumber(prompt) ? "AN TOÀN" : "CẢNH BÁO");
      let baseWarning = isHighRiskPattern ? "Số điện thoại có dấu hiệu rủi ro cao" : "Số thuê bao chưa có ghi nhận xấu";

      // 3.4 AI Analysis (Chỉ chạy khi có report ĐÃ XÁC THỰC)
      let aiAnalysis: AIAnalysisResult | null = null;
      if (reports.length > 0) {
        aiAnalysis = await analyzeReportsWithAI(reports, prompt);
      }

      // 3.5 Tổng hợp kết quả
      finalResultData = {
        riskLevel: aiAnalysis ? aiAnalysis.riskLevel : baseRiskLevel,
        
        identityScore: (aiAnalysis?.riskLevel === "NGUY HIỂM") ? 95 : (isHighRiskPattern ? 80 : 15),
        
        warning: aiAnalysis ? aiAnalysis.shortWarning : baseWarning,
        
        details: {
          identity: aiAnalysis ? aiAnalysis.scamType : (dbRecord ? "Số thuê bao xác thực" : "Chưa xác định"),
          callType: aiAnalysis ? "Báo cáo lừa đảo" : "Cuộc gọi thông thường",
          carrier: technicalDetails.carrier,
          location: technicalDetails.location,
          lineType: technicalDetails.lineType,
          
          signs: [
            ...(aiAnalysis ? [aiAnalysis.explanation] : []),
            `Nhà mạng: ${technicalDetails.carrier}`,
            reports.length > 0 ? `Đã có ${reports.length} xác thực tố cáo` : "Chưa có báo cáo xác thực"
          ],
          
          urgency: (aiAnalysis?.riskLevel === "NGUY HIỂM") ? "Cao" : "Thấp",
          financialRisk: (aiAnalysis?.riskLevel === "NGUY HIỂM") ? "Cao" : "Thấp",
        },
        
        recommendations: aiAnalysis ? aiAnalysis.recommendations : [
          "Cảnh giác nếu yêu cầu chuyển tiền",
          "Không cung cấp mã OTP",
          "Tra cứu kỹ trước khi giao dịch"
        ],
        
        // Chỉ trả về các report đã confirmed
        userReports: reports 
      };

      // Xử lý fallback: Có report xác thực nhưng AI lỗi
      if (!aiAnalysis && reports.length >= 2) {
        finalResultData.riskLevel = "NGUY HIỂM";
        finalResultData.warning = `Cảnh báo: Có ${reports.length} lượt tố cáo đã xác minh`;
      }

      // 4. LƯU LOG (Update cache)
      try {
        await supabase.from("search_logs").upsert({ 
            query: normalizedPrompt, 
            result: finalResultData, 
            risk_level: finalResultData.riskLevel 
        }, { onConflict: 'query' });
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      data: finalResultData,
      source: isFromCache ? "cache" : "live"
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}