"use client";

import { useState } from "react";
import { 
  Shield, AlertTriangle, CheckCircle, Loader2, Info, 
  Globe, Smartphone, Signal, Clock, DollarSign, Tag, 
  X, MessageSquare, User, ThumbsDown 
} from 'lucide-react'; 

// --- CẤU HÌNH NGƯỜI DÙNG GIẢ LẬP (ĐỂ TEST) ---
const CURRENT_USER = {
  isLoggedIn: true, 
  name: "Dev Nguyen",
  avatar: null 
};

const Container = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className || ''}`}>
    {children}
  </div>
);

// --- INTERFACES ---
interface UserReport {
  id: number;
  user: string;
  date: string;
  content: string;
  tags: string[];
}

interface AssessmentResult {
  riskLevel: "AN TOÀN" | "CẢNH BÁO" | "NGUY HIỂM";
  identityScore: number;
  warning: string;
  details: {
    identity: string;
    callType: string;
    category: string;
    urgency: string;
    financialRisk: string;
    signs: string[];
    carrier?: string;
    location?: string;
    lineType?: string;
  };
  recommendations: string[];
  userReports?: UserReport[];
}

export const Hero = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState('');
  
  // State quản lý Modal
  const [showReportModal, setShowReportModal] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true); 
    setError(''); 
    setResult(null); 
    setShowReportModal(false);
    
    try {
      const res = await fetch('/api/check-scam', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'Có lỗi xảy ra.');
      }
    } catch (err: any) { 
        setError(err.message || 'Lỗi kết nối.'); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const getTheme = (level: string) => {
    switch (level) {
      case 'AN TOÀN': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', bar: 'bg-green-500', icon: <CheckCircle className="w-6 h-6 text-green-600" /> };
      case 'NGUY HIỂM': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', bar: 'bg-red-500', icon: <Shield className="w-6 h-6 text-red-600" /> };
      default: return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', bar: 'bg-yellow-500', icon: <AlertTriangle className="w-6 h-6 text-yellow-600" /> };
    }
  };

  return (
    <>
      <Container className="flex flex-wrap pt-20 pb-10">
        <div className="flex w-full flex-col items-center justify-center">

           <div className="max-w-4xl w-full mb-12 text-center px-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white mb-6">Scam Checker ⭐</h1>
            <p className="text-xl md:text-2xl leading-relaxed text-gray-600 dark:text-gray-300 mb-10">Enter a phone number or website for AI-powered scam detection.</p>
            <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4 sm:flex-row relative max-w-3xl mx-auto">
              <input type="text" placeholder="Nhập SĐT, nội dung..." className="flex-grow px-6 py-5 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-lg transition-all" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isLoading} />
              <button type="submit" className="px-10 py-5 text-xl font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-70 shadow-lg hover:shadow-xl transition-all flex items-center justify-center min-w-[160px]" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : 'Kiểm tra'}
              </button>
            </form>
            {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">{error}</div>}

            {/* --- KẾT QUẢ HIỂN THỊ --- */}
            {result && !isLoading && !error && (
              <div className="mt-8 w-full rounded-2xl border shadow-xl overflow-hidden bg-white animate-in fade-in slide-in-from-top-4 duration-500 text-left">
                
                {/* Header */}
                <div className={`p-5 flex items-start gap-4 border-b ${getTheme(result.riskLevel).bg} ${getTheme(result.riskLevel).border}`}>
                  <div className="bg-white p-2 rounded-full shadow-sm flex-shrink-0">{getTheme(result.riskLevel).icon}</div>
                  <div>
                    <h3 className={`text-xl font-bold ${getTheme(result.riskLevel).text}`}>KẾT QUẢ: {result.riskLevel}</h3>
                    <p className="text-gray-700 mt-1 font-medium text-sm">{result.warning}</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Thanh điểm số */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase mb-2">
                      <span>Thang điểm rủi ro</span>
                      <span>{result.identityScore}/100</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ease-out ${getTheme(result.riskLevel).bar}`} style={{ width: `${result.identityScore}%` }} />
                    </div>
                  </div>

                  {/* INFO GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex flex-col items-center text-center">
                        <Clock className="w-5 h-5 text-orange-600 mb-1" />
                        <span className="text-[10px] uppercase font-bold text-gray-500">Độ khẩn cấp</span>
                        <span className="font-bold text-orange-800 text-sm">{result.details.urgency || "Không rõ"}</span>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex flex-col items-center text-center">
                        <DollarSign className="w-5 h-5 text-emerald-600 mb-1" />
                        <span className="text-[10px] uppercase font-bold text-gray-500">Rủi ro tiền bạc</span>
                        <span className="font-bold text-emerald-800 text-sm">{result.details.financialRisk || "Không"}</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col items-center text-center col-span-2 md:col-span-1">
                        <Tag className="w-5 h-5 text-blue-600 mb-1" />
                        <span className="text-[10px] uppercase font-bold text-gray-500">Phân loại</span>
                        <span className="font-bold text-blue-800 text-sm">{result.details.category || "Khác"}</span>
                    </div>
                  </div>

                  {/* TECH INFO */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-gray-700 mb-3 text-xs uppercase flex items-center gap-2">
                        <Signal className="w-4 h-4" /> Thông tin kỹ thuật
                    </h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                        <div>
                            <span className="block text-gray-400 text-xs">Nhà mạng</span>
                            <span className="font-semibold text-gray-800">{result.details.carrier !== "N/A" ? result.details.carrier : "Không rõ"}</span>
                        </div>
                        <div>
                            <span className="block text-gray-400 text-xs">Quốc gia</span>
                            <span className="font-semibold text-gray-800">{result.details.location !== "N/A" ? result.details.location : "Không rõ"}</span>
                        </div>
                        <div className="col-span-2 border-t border-slate-200 pt-2 mt-1">
                            <span className="block text-gray-400 text-xs">Loại thuê bao (Line Type)</span>
                            <span className={`font-bold ${result.details.lineType?.includes('VoIP') ? 'text-red-600' : 'text-gray-800'}`}>
                                {result.details.lineType !== "N/A" ? result.details.lineType : "Không rõ"}
                                {result.details.lineType?.includes('VoIP') && " (Cảnh báo: Sim ảo)"}
                            </span>
                        </div>
                    </div>
                  </div>

                  {/* --- KHỐI DẤU HIỆU CỤ THỂ --- */}
                  <div>
                    {result.details.signs.length > 0 && (
                        <>
                          <h4 className="flex items-center gap-2 font-bold text-gray-700 mb-3 text-sm">
                            <Info className="w-4 h-4" /> DẤU HIỆU CỤ THỂ
                          </h4>
                          <ul className="space-y-2 mb-4">
                            {result.details.signs.map((sign, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                <span className="block w-1.5 h-1.5 mt-1.5 bg-red-400 rounded-full flex-shrink-0" />
                                {sign}
                              </li>
                            ))}
                          </ul>
                        </>
                    )}

                    {/* --- NÚT XEM BÁO CÁO (LUÔN HIỆN) --- */}
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="w-full py-3 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center justify-center gap-2 group shadow-sm"
                    >
                      <MessageSquare className="w-5 h-5" />
                      {result.userReports && result.userReports.length > 0 
                        ? `Xem ${result.userReports.length} cảnh báo từ cộng đồng` 
                        : `Xem báo cáo từ cộng đồng (0)`}
                      <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </div>

                  {/* Khuyến nghị */}
                  {result.recommendations.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-2">
                        {result.recommendations.map((rec, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-white">
                            {rec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </Container>
      
      {/* --- MODAL POPUP HIỂN THỊ BÁO CÁO --- */}
      {showReportModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowReportModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Báo cáo vi phạm
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Danh sách tố cáo liên quan đến <span className="font-semibold text-indigo-600">{prompt}</span>
                </p>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-0 overflow-y-auto custom-scrollbar">
              {(!result.userReports || result.userReports.length === 0) ? (
                <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-gray-500 font-medium">Chưa có báo cáo nào từ cộng đồng.</p>
                  <p className="text-sm text-gray-400">Hãy là người đầu tiên báo cáo nếu bạn thấy nghi ngờ.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {result.userReports.map((report) => (
                    <div key={report.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                      {/* HEADER CỦA MỖI REPORT */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-gray-900">{report.user}</span>
                            <span className="block text-xs text-gray-400">{report.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                          <ThumbsDown className="w-3 h-3" /> Tố cáo
                        </div>
                      </div>
                      
                      {/* NỘI DUNG REPORT */}
                      <p className="text-gray-700 text-sm leading-relaxed mb-3 mt-3">
                        {report.content}
                      </p>

                      {/* TAGS */}
                      {report.tags && report.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {report.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl text-center">
              <p className="text-xs text-gray-500">
                Thông tin được tổng hợp từ cộng đồng và chỉ mang tính chất tham khảo.
              </p>
            </div>
          </div>
        </div>
      )}

      <Container>
        <div className="flex flex-col justify-center mt-20">
          <div className="text-xl text-center text-gray-700 dark:text-white">
            Trusted by <span className="text-indigo-600">5+</span>{" "}
            customers in Vietnam
          </div>

          <div className="flex flex-wrap justify-center gap-5 mt-10 md:justify-around">
            <div className="text-gray-400 dark:text-gray-400">
              <MicrosoftLogo />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

function MicrosoftLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="31" fill="none" viewBox="0 0 150 31">
       <path fill="currentColor" d="M150 14.514v-2.647h-3.295V7.75l-.11.034-3.095.945-.061.019v3.118h-4.884V10.13c0-.81.181-1.428.538-1.841.355-.408.863-.615 1.51-.615.465 0 .947.11 1.431.325l.122.054V5.265l-.057-.021c-.452-.162-1.068-.244-1.83-.244-.96 0-1.834.209-2.596.622a4.428 4.428 0 00-1.78 1.757c-.419.751-.631 1.618-.631 2.578v1.91h-2.294v2.647h2.294v11.153h3.293V14.514h4.884v7.088c0 2.919 1.38 4.398 4.1 4.398a6.78 6.78 0 001.4-.155c.488-.105.822-.21 1.018-.322l.043-.026v-2.672l-.134.089c-.204.13-.428.227-.662.288a2.514 2.514 0 01-.65.11c-.638 0-1.11-.171-1.402-.51-.296-.34-.446-.938-.446-1.773v-6.515H150zm-24.387 8.799c-1.195 0-2.137-.396-2.801-1.175-.669-.783-1.007-1.9-1.007-3.317 0-1.464.338-2.61 1.007-3.406.664-.791 1.598-1.193 2.775-1.193 1.142 0 2.05.383 2.702 1.14.654.762.986 1.898.986 3.379 0 1.498-.312 2.65-.928 3.42-.612.764-1.531 1.152-2.734 1.152zm.147-11.779c-2.28 0-4.092.667-5.383 1.982-1.291 1.315-1.945 3.136-1.945 5.41 0 2.161.638 3.9 1.898 5.165 1.26 1.267 2.975 1.908 5.096 1.908 2.21 0 3.986-.676 5.277-2.009 1.29-1.332 1.945-3.135 1.945-5.356 0-2.195-.614-3.946-1.825-5.204-1.211-1.258-2.915-1.896-5.063-1.896zm-12.638 0c-1.551 0-2.834.396-3.815 1.177-.986.785-1.486 1.815-1.486 3.062 0 .647.108 1.223.32 1.711.214.49.545.921.985 1.283.436.359 1.11.735 2.001 1.117.75.308 1.31.569 1.665.774.347.201.594.404.733.6.135.193.204.457.204.783 0 .927-.696 1.378-2.128 1.378-.53 0-1.136-.11-1.8-.329a6.76 6.76 0 01-1.844-.932l-.136-.098v3.164l.05.023c.466.215 1.053.396 1.746.538a9.428 9.428 0 001.864.215c1.684 0 3.04-.398 4.028-1.183.996-.79 1.5-1.845 1.5-3.135 0-.93-.271-1.728-.807-2.37-.531-.639-1.454-1.225-2.74-1.743-1.026-.41-1.683-.751-1.954-1.013-.261-.253-.394-.61-.394-1.063 0-.401.164-.723.5-.983.339-.262.81-.395 1.401-.395.55 0 1.11.087 1.669.256.517.15 1.008.378 1.457.674l.134.092v-3.001l-.051-.022c-.378-.162-.875-.3-1.48-.412a9.053 9.053 0 00-1.622-.168zM99.236 23.313c-1.195 0-2.138-.396-2.802-1.175-.668-.783-1.006-1.899-1.006-3.317 0-1.464.338-2.61 1.007-3.406.664-.791 1.597-1.193 2.774-1.193 1.142 0 2.05.383 2.702 1.14.655.762.987 1.898.987 3.379 0 1.498-.313 2.65-.929 3.42-.611.764-1.53 1.152-2.733 1.152zm.147-11.779c-2.281 0-4.093.667-5.384 1.982-1.29 1.315-1.945 3.136-1.945 5.41 0 2.162.64 3.9 1.9 5.165C95.213 25.358 96.927 26 99.048 26c2.21 0 3.986-.676 5.277-2.009 1.29-1.332 1.945-3.135 1.945-5.356 0-2.195-.614-3.946-1.825-5.204-1.212-1.258-2.916-1.896-5.063-1.896l.001-.001zm-12.328 2.723v-2.39h-3.253v13.8h3.253v-7.06c0-1.2.273-2.186.811-2.93.531-.737 1.24-1.11 2.104-1.11.293 0 .622.049.978.144.353.095.608.198.759.306l.136.099v-3.273l-.052-.022c-.303-.129-.732-.194-1.274-.194-.818 0-1.55.263-2.176.779-.55.453-.947 1.075-1.251 1.85h-.035v.001zm-9.079-2.723c-1.492 0-2.823.32-3.955.95a6.4 6.4 0 00-2.61 2.676c-.594 1.143-.896 2.478-.896 3.966 0 1.304.293 2.5.871 3.555a6.114 6.114 0 002.435 2.456c1.035.573 2.231.863 3.556.863 1.546 0 2.866-.309 3.924-.917l.043-.024v-2.974l-.137.1a6.12 6.12 0 01-1.591.826c-.575.2-1.1.302-1.56.302-1.276 0-2.3-.399-3.044-1.185-.746-.786-1.123-1.891-1.123-3.281 0-1.4.394-2.533 1.17-3.369.775-.833 1.802-1.256 3.052-1.256 1.069 0 2.11.361 3.096 1.075l.137.098v-3.133l-.044-.025c-.371-.207-.877-.378-1.505-.508a9.005 9.005 0 00-1.819-.195zm-9.701.333h-3.253v13.8h3.253v-13.8zm-1.593-5.879c-.536 0-1.003.182-1.386.542a1.786 1.786 0 00-.581 1.354c0 .529.193.975.575 1.327.379.351.847.529 1.392.529a2.01 2.01 0 001.398-.528 1.729 1.729 0 00.582-1.328c0-.518-.19-.969-.566-1.339-.375-.37-.851-.557-1.414-.557zm-8.117 4.86v14.819h3.32V6.41H57.29l-5.84 14.302L45.782 6.41H41v19.256h3.12v-14.82h.107l5.985 14.82h2.354l5.892-14.818h.107z" />
       <path fill="currentColor" fillRule="evenodd" d="M15 14H0V0h15v14zm17 0H17V0h15v14zM15 31H0V17h15v14zm17 0H17V17h15v14z" clipRule="evenodd" />
    </svg>
  );
}