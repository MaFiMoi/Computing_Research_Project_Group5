"use client";

// 1. Import thêm useCallback
import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import { CheckCircle, XCircle, Clock } from "lucide-react";
// 2. Import Supabase client
import { createClient } from "@/lib/supabaseClient";

export default function ReportsPage() {
  // 3. Khởi tạo client
  const supabase = createClient();
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  // 4. Khai báo kiểu (khuyến khích)
interface ReportStats {
  pending_count?: number;
  confirmed_count?: number;
  rejected_count?: number;
}

const [stats, setStats] = useState<ReportStats>({
  pending_count: 0,
  confirmed_count: 0,
  rejected_count: 0,
});

const fetchStats = useCallback(async () => {
  try {
    const { data, error } = await supabase
      .rpc("get_report_counts_by_status")
      .single();

    if (error) throw error;

    if (data && typeof data === 'object') {
      const statsData = data as ReportStats;
      setStats({
        pending_count: Number(statsData.pending_count ?? 0),
        confirmed_count: Number(statsData.confirmed_count ?? 0),
        rejected_count: Number(statsData.rejected_count ?? 0),
      });
    } else {
      setStats({ pending_count: 0, confirmed_count: 0, rejected_count: 0 });
    }
  } catch (error: any) {
    console.error("Error fetching stats:", error.message);
  }
}, [supabase]);
  // 6. SỬA LỖI (VÀNG): Bọc 'fetchReports' bằng useCallback
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_admin_reports_list", {
        status_filter: filter,
      });

      if (error) throw error;
      if (data) {
        setReports(data);
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, filter]); // Thêm 'supabase' và 'filter' làm phụ thuộc

// 7. Cập nhật useEffects
  useEffect(() => {
    fetchStats();
  }, [fetchStats]); // Thêm 'fetchStats' vào mảng phụ thuộc

  useEffect(() => {
    fetchReports();
  }, [fetchReports]); // Thêm 'fetchReports' vào mảng phụ thuộc

  // 8. Hàm handleAction (Giữ nguyên)
  const handleAction = async (reportId: string, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminNote = `Processed by ${user?.email || 'Admin'} on ${new Date().toISOString()}`;

      console.log("Đang update ID:", reportId); // Debug Log 1

      // SỬA ĐOẠN NÀY:
      const { data, error } = await supabase
        .from("userreports") // Kiểm tra kỹ tên bảng này
        .update({ 
          status: status,
          admin_notes: adminNote 
        })
        .eq("id", reportId)
        .select();

      // 1. Kiểm tra lỗi cú pháp/kết nối
      if (error) {
        console.error("Lỗi Supabase:", error);
        alert(`Lỗi Supabase: ${error.message}`);
        return;
      }

      // 2. Kiểm tra xem có dòng nào được update không (Check RLS)
      if (!data || data.length === 0) {
        console.error("Update thất bại. Có thể do RLS hoặc sai ID.");
        alert("Lỗi: Không thể cập nhật. Vui lòng kiểm tra quyền (RLS) trên Supabase.");
        return;
      }

      // Nếu thành công
      alert(`Đã ${status === 'confirmed' ? 'xác nhận' : 'từ chối'} báo cáo!`);
      
      // Load lại dữ liệu ngay lập tức
      await fetchReports();
      await fetchStats();

    } catch (error: any) {
      console.error('Error updating report:', error.message);
      alert(`Có lỗi xảy ra: ${error.message}`);
    }
  };

  // 9. Cột (Columns) (Giữ nguyên - đã đúng)
  const columns = [
    { 
      key: 'phone_number', 
      label: 'Đối tượng báo cáo',
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    { 
      key: 'report_type', 
      label: 'Loại',
      render: (value: string) => (
        <span className="capitalize">{value || 'Không rõ'}</span>
      )
    },
    { 
      key: 'description', 
      label: 'Mô tả',
      render: (value: string) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block">
          {value || 'Không có mô tả'}
        </span>
      )
    },
    { 
      key: 'reporter_name', 
      label: 'Người báo cáo',
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value || 'Ẩn danh'}</p>
          <p className="text-xs text-gray-500">{row.reporter_email}</p>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Thời gian',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: string) => {
        const statusMap: any = {
          confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã xác nhận', icon: CheckCircle },
          rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã từ chối', icon: XCircle },
          pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xử lý', icon: Clock }
        };
        const status = statusMap[value] || statusMap.pending;
        const Icon = status.icon;
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${status.bg} ${status.text}`}>
            <Icon size={14} />
            {status.label}
          </span>
        );
      }
    },
    {
      key: 'id',
      label: 'Hành động',
      render: (value: string, row: any) => (
        row.status === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(value, 'confirmed')}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
            >
              ✓ Xác nhận
            </button>
            <button
              onClick={() => handleAction(value, 'rejected')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
            >
              ✗ Từ chối
            </button>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Đã xử lý</span>
        )
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Báo cáo</h1>
        <p className="text-gray-600 mt-1">Xem và xử lý các báo cáo từ người dùng</p>
      </div>

      <div className="p-8">
        {/* Filters (Đã đúng) */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chờ xử lý
              </button>
              <button
                onClick={() => setFilter('confirmed')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'confirmed' 
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã xác nhận
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã từ chối
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary (Đã đúng) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 text-sm font-medium">Chờ xử lý</p>
                <p className="text-3xl font-bold text-yellow-800 mt-2">
                  {stats.pending_count}
                </p>
              </div>
              <Clock className="text-yellow-600" size={32} />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Đã xác nhận</p>
                <p className="text-3xl font-bold text-green-800 mt-2">
                  {stats.confirmed_count}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-medium">Đã từ chối</p>
                <p className="text-3xl font-bold text-red-800 mt-2">
                  {stats.rejected_count}
                </p>
              </div>
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>
        </div>

        {/* Reports Table (Đã đúng) */}
        <Table columns={columns} data={reports} loading={loading} />
      </div>
    </div>
  );
}