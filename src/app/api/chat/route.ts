import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// Cấu hình cho OpenRouter (hoặc OpenAI)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

// --- CÁC HÀM TIỆN ÍCH ---

/**
 * [MỚI] Kiểm tra xem chuỗi có phải là URL không
 */
const isUrl = (str: string): boolean => {
  // Regex này kiểm tra các định dạng như: http://google.com, https://google.com, google.com
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  return urlRegex.test(str);
};

/**
 * Kiểm tra SĐT đơn giản (chỉ cần là số và có độ dài phù hợp)
 */
const isPhoneNumber = (str: string): boolean => {
  const phoneRegex = /^[0-9\+]{10,15}$/;
  return phoneRegex.test(str.replace(/[\s\-()]/g, '')); // Xóa khoảng trắng, gạch nối
};

/**
 * [MỚI] Hàm lấy thông tin Google Safe Browsing
 */
async function getSafeBrowsingInfo(urlToCheck: string) {
  const apiKey = process.env.SAFE_BROWSING_API_KEY;
  if (!apiKey) {
    console.log("Thiếu SAFE_BROWSING_API_KEY, bỏ qua tra cứu URL.");
    return null;
  }

  const googleApiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  
  const payload = {
    client: {
      clientId: "my-scam-checker-app", // Thay bằng tên app của bạn
      clientVersion: "1.0.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "PHISHING", "UNWANTED_SOFTWARE"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntries: [
        { url: urlToCheck }
      ]
    }
  };

  try {
    const res = await fetch(googleApiUrl, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error(`Lỗi Google Safe Browsing: ${res.statusText}`);
      return null;
    }

    const data = await res.json();

    // Nếu API trả về "matches", tức là trang web này NGUY HIỂM
    if (data && data.matches && data.matches.length > 0) {
      return {
        status: "DANGEROUS",
        threat: data.matches[0].threatType, // Ví dụ: "PHISHING"
      };
    } else {
      // Nếu API trả về object rỗng {}, tức là AN TOÀN
      return {
        status: "SAFE",
        threat: "NONE",
      };
    }
  } catch (error) {
    console.error("Lỗi khi gọi Google Safe Browsing API:", error);
    return null;
  }
}

/**
 * Hàm lấy thông tin SĐT từ Numlookupapi
 */
async function getPhoneInfo(phoneNumber: string) {
  const apiKey = process.env.NUMLOOKUP_API_KEY;
  if (!apiKey) {
    console.log("Thiếu NUMLOOKUP_API_KEY, bỏ qua tra cứu SĐT.");
    return null;
  }

  try {
    const url = `https://api.numlookupapi.com/v1/validate/${phoneNumber}?apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Lỗi Numlookupapi: ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    if (data && data.valid === true) {
      return {
        country: data.country_name || "Không rõ",
        carrier: data.carrier || "Không rõ",
        type: data.line_type || "Không rõ",
      };
    }
    return null;
  } catch (error) {
    console.error("Lỗi khi gọi Numlookupapi:", error);
    return null;
  }
}

// --- API ROUTE HANDLER ---

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();
  let extraInfo = ""; // Thông tin bổ sung từ tra cứu

  // KIỂM TRA ĐẦU VÀO
  if (!prompt) {
     return NextResponse.json({ error: "Prompt không được để trống" }, { status: 400 });
  }

  // --- LOGIC TRA CỨU ---
  // Bước 1: Kiểm tra xem có phải SĐT không
  if (isPhoneNumber(prompt)) {
    const phoneInfo = await getPhoneInfo(prompt);
    if (phoneInfo) {
      extraInfo = ` (Thông tin tra cứu SĐT: Nhà mạng ${phoneInfo.carrier}, Loại SĐT ${phoneInfo.type}, Quốc gia ${phoneInfo.country}).`;
    }
  } 
  // Bước 2: Nếu không phải SĐT, kiểm tra xem có phải URL không
  else if (isUrl(prompt)) {
    const urlInfo = await getSafeBrowsingInfo(prompt);
    if (urlInfo) {
      if (urlInfo.status === "DANGEROUS") {
        extraInfo = ` (CẢNH BÁO TỪ GOOGLE: Trang web này được báo cáo là NGUY HIỂM, loại mối đe dọa: ${urlInfo.threat}).`;
      } else {
        extraInfo = ` (Thông tin tra cứu Google: Trang web này được xác định là AN TOÀN).`;
      }
    }
  }
  // Nếu không phải cả hai, extraInfo sẽ là chuỗi rỗng
  
  // --- GỌI AI PHÂN TÍCH ---

  // Tạo prompt cuối cùng cho AI (bao gồm thông tin tra cứu nếu có)
  const fullPrompt = `Hãy phân tích mục sau đây để xem nó có dấu hiệu lừa đảo hay không: "${prompt}"${extraInfo}. 
Vui lòng ưu tiên tra cứu thông tin trực tuyến về mục này. 
Nếu không tìm thấy báo cáo cụ thể (bao gồm cả thông tin tôi cung cấp trong ngoặc đơn), hãy phân tích các dấu hiệu chung dựa trên dữ liệu huấn luyện. 
Cung cấp câu trả lời ngắn gọn, đi thẳng vào vấn đề.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "minimax/minimax-m2:free", // Hoặc model bạn muốn
      messages: [{ role: "user", content: fullPrompt }],
    });

    return NextResponse.json({
      response: completion.choices[0]?.message?.content || "No response",
    });
  } catch (error) {
    // Xử lý lỗi nếu gọi API AI thất bại
    console.error("Lỗi khi gọi API AI:", error);
    const errorMessage = error instanceof Error ? error.message : "Không thể xử lý yêu cầu bởi AI.";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}