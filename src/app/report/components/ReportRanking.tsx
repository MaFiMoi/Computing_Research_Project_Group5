"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";

// Định nghĩa kiểu dữ liệu cho top reporters
interface TopReporter {
  username: string;
  report_count: number;
}

// Hàm trợ giúp để ẩn danh tên user
const anonymize = (name: string | undefined): string => {
  if (!name) return "-";
  if (name.length <= 3) return `${name.substring(0, 1)}***`;
  return `${name.substring(0, 2)}***${name.slice(-1)}`;
};

export default function ReportRanking() {
  const supabase = createClient();

  // States để lưu dữ liệu
  const [topReporters, setTopReporters] = useState<TopReporter[]>([]);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hàm để lấy tất cả dữ liệu
    const fetchData = async () => {
      setIsLoading(true);
      
      // 1. Lấy Top 3 Reporters (gọi hàm RPC đã tạo)
      const { data: reportersData, error: reportersError } = await supabase.rpc(
        "get_top_reporters"
      );
      if (reportersData) {
        setTopReporters(reportersData);
      }

      // 2. Đếm số report 'confirmed'
      // (Giả sử bạn dùng status 'confirmed')
      const { count: confirmed, error: confirmedError } = await supabase
        .from("userreports")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed"); // <-- SỬA LẠI NẾU TÊN STATUS KHÁC
      
      if (confirmed !== null) {
        setConfirmedCount(confirmed);
      }

      // 3. Đếm số report 'pending'
      const { count: pending, error: pendingError } = await supabase
        .from("userreports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      if (pending !== null) {
        setPendingCount(pending);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  // Lấy ra 3 người top đầu (hoặc undefined nếu không có)
  const [first, second, third] = topReporters;

  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-600 mt-10 mb-4 uppercase">
        🏆 Bảng Xếp Hạng Reporter
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-600 text-white p-6 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-semibold">🥇 Top 1</h3>
          <p className="text-2xl font-bold mt-2">
            {isLoading ? "..." : anonymize(first?.username)}
          </p>
        </div>
        <div className="bg-indigo-500 text-white p-6 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-semibold">🥈 Top 2</h3>
          <p className="text-2xl font-bold mt-2">
            {isLoading ? "..." : anonymize(second?.username)}
          </p>
        </div>
        <div className="bg-indigo-400 text-white p-6 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-semibold">🥉 Top 3</h3>
          <p className="text-2xl font-bold mt-2">
            {isLoading ? "..." : anonymize(third?.username)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-center">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Báo cáo đã xác nhận
          </h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {isLoading ? "..." : confirmedCount.toLocaleString("en-US")}
          </p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Đang chờ duyệt
          </h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {isLoading ? "..." : pendingCount.toLocaleString("en-US")}
          </p>
        </div>
      </div>
    </div>
  );
}