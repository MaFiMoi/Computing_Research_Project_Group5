import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- CẤU HÌNH ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

// Sử dụng SERVICE_ROLE_KEY để đảm bảo API luôn có quyền đọc/ghi database
// (Bỏ qua RLS policy của bảng search_logs và các bảng khác)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// --- CÁC HÀM HELPER ---
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

// --- API HANDLER CHÍNH ---
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập thông tin" }, { status: 400 });
    }

    // Chuẩn hóa input (xóa khoảng trắng, dấu gạch ngang)
    const normalizedPrompt = prompt.replace(/[\s\-()]/g, '');
    
    let finalResultData: any = null;
    let isFromCache = false;

    // -----------------------------------------------------------
    // BƯỚC 1: KIỂM TRA CACHE (SEARCH LOGS)
    // -----------------------------------------------------------
    try {
      const { data: cachedData } = await supabase
        .from("search_logs")
        .select("result")
        .eq("query", normalizedPrompt)
        .single();

      if (cachedData && cachedData.result) {
        finalResultData = cachedData.result;
        isFromCache = true;
      }
    } catch (e) {
      // Bỏ qua lỗi cache miss
    }

    // -----------------------------------------------------------
    // BƯỚC 2: PHÂN TÍCH (NẾU KHÔNG CÓ CACHE)
    // -----------------------------------------------------------
    if (!finalResultData) {
      let technicalDetails = { carrier: "N/A", location: "N/A", lineType: "N/A" };
      let extraInfo = "Không có thông tin kỹ thuật bổ sung.";
      let isHighRiskPattern = false;
      let dbRecord = null;

      // 2.1. Tra cứu DB nhà mạng
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
          extraInfo = `SĐT VN - Nhà mạng: ${technicalDetails.carrier}.`;
        }
      } catch (e) {}

      // 2.2. Gọi API External (NumLookup / SafeBrowsing)
      if (isPhoneNumber(prompt) && !dbRecord) {
        const phoneData = await getPhoneInfo(prompt);
        if (phoneData) {
          technicalDetails = { carrier: phoneData.carrier, location: phoneData.country, lineType: phoneData.type };
          extraInfo = `Thông tin quốc tế: ${JSON.stringify(technicalDetails)}`;
        }
        isHighRiskPattern = isHighRiskPhonePattern(prompt);
      } else if (isUrl(prompt)) {
        const sb = await getSafeBrowsingInfo(prompt);
        if (sb) extraInfo = `Safe Browsing: ${sb.status}`;
      }

      // 2.3. Logic AI & Kết luận
      let scamRecord = null;
      try {
        const { data } = await supabase.from("confirmed_scams").select("*").eq("content", normalizedPrompt).single();
        scamRecord = data;
      } catch (e) {}

      if (scamRecord) {
        finalResultData = {
          riskLevel: "NGUY HIỂM",
          identityScore: 100,
          warning: "🚨 CẢNH BÁO: Đã nằm trong danh sách đen lừa đảo.",
          details: {
            identity: scamRecord.type || "Lừa đảo đã xác minh",
            callType: "Hoạt động độc hại",
            signs: ["Đã có báo cáo xác thực", scamRecord.description],
            carrier: technicalDetails.carrier,
            location: technicalDetails.location,
            lineType: technicalDetails.lineType,
            urgency: "Cao",
            financialRisk: "Có",
            category: "Lừa đảo"
          },
          recommendations: ["Chặn ngay lập tức", "Không giao dịch"]
        };
      } else if (isHighRiskPattern) {
        finalResultData = {
          riskLevel: "NGUY HIỂM",
          identityScore: 90,
          warning: "🔴 SĐT có dấu hiệu giả mạo/Rủi ro cao.",
          details: {
            identity: "Nghi ngờ giả mạo",
            callType: "Gọi điện/Spam",
            signs: ["Đầu số lạ/VoIP", "Số đẹp bất thường"],
            carrier: technicalDetails.carrier,
            location: technicalDetails.location,
            lineType: technicalDetails.lineType,
            urgency: "Cao",
            financialRisk: "Cao",
            category: "Giả mạo"
          },
          recommendations: ["Không nghe máy", "Không cung cấp thông tin"]
        };
      } else if (isPhoneNumber(prompt)) {
         finalResultData = {
          riskLevel: "AN TOÀN",
          identityScore: 15,
          warning: "✅ Chưa phát hiện rủi ro (Tham khảo).",
          details: {
            identity: "Số thuê bao thông thường",
            callType: "Liên lạc",
            signs: ["Thông tin nhà mạng hợp lệ"],
            carrier: technicalDetails.carrier,
            location: technicalDetails.location,
            lineType: technicalDetails.lineType,
            urgency: "Thấp",
            financialRisk: "Thấp",
            category: "An toàn"
          },
          recommendations: ["Cảnh giác nếu yêu cầu chuyển tiền"]
        };
      } else {
        // Fallback AI cho text/url
        const systemPrompt = `Phân tích rủi ro lừa đảo cho: "${prompt}". Info: ${extraInfo}. Output JSON only: { "riskLevel": "AN TOÀN"|"CẢNH BÁO"|"NGUY HIỂM", "identityScore": 0-100, "warning": "string", "details": { "signs": [] }, "recommendations": [] }`;
        try {
            const completion = await openai.chat.completions.create({
                model: "openai/gpt-oss-20b:free",
                messages: [{ role: "user", content: systemPrompt }],
                temperature: 0.3,
            });
            let content = completion.choices[0]?.message?.content || "{}";
            content = content.replace(/```json/g, "").replace(/```/g, "").trim();
            finalResultData = JSON.parse(content);
            // Merge tech details
            if(finalResultData.details) {
                finalResultData.details.carrier = technicalDetails.carrier;
                finalResultData.details.location = technicalDetails.location;
                finalResultData.details.lineType = technicalDetails.lineType;
            }
        } catch(e) {
             finalResultData = { riskLevel: "CẢNH BÁO", identityScore: 50, warning: "AI bận, cần tự kiểm tra.", details: { signs: [] }, recommendations: [] };
        }
      }

      // Lưu Cache
      try {
        await supabase.from("search_logs").insert({ query: normalizedPrompt, result: finalResultData, risk_level: finalResultData.riskLevel });
      } catch (e) {}
    }

    // -----------------------------------------------------------
    // BƯỚC 3: LẤY BÁO CÁO TỪ DATABASE QUA RPC FUNCTION
    // -----------------------------------------------------------
    // Đây là bước quan trọng nhất: Gọi SQL Function đã tạo
    const { data: userReports, error: rpcError } = await supabase
      .rpc('get_scam_reports', { input_phone: normalizedPrompt });

    if (rpcError) {
      console.error("Lỗi gọi RPC get_scam_reports:", rpcError);
    }
    
    // Đảm bảo userReports luôn là mảng
    const reports = userReports || [];

    // Gán vào kết quả trả về cho Frontend
    if (finalResultData) {
        finalResultData.userReports = reports;

        // Logic tự động nâng mức cảnh báo nếu cộng đồng tố cáo nhiều
        if (reports.length > 0) {
             // Thêm dấu hiệu vào danh sách signs
             const signMsg = `Có ${reports.length} lượt tố cáo từ cộng đồng`;
             if (!finalResultData.details.signs.includes(signMsg)) {
                  finalResultData.details.signs.unshift(signMsg);
             }

             // Nâng mức độ rủi ro nếu hệ thống AI đang báo AN TOÀN
             if (finalResultData.riskLevel === "AN TOÀN") {
                finalResultData.riskLevel = "CẢNH BÁO";
                finalResultData.warning = `⚠️ Cộng đồng có ${reports.length} cảnh báo về số này.`;
                finalResultData.identityScore = Math.max(finalResultData.identityScore, 70);
             } 
             // Nếu đã là CẢNH BÁO/NGUY HIỂM thì cộng thêm điểm
             else {
                finalResultData.identityScore = Math.min(finalResultData.identityScore + (reports.length * 5), 100);
             }
        }
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