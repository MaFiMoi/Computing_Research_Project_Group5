"use client";

// 1. Import thêm useCallback
import React, { useState, useEffect, useCallback } from "react";
import Card from "./components/Card";
import Table from "./components/Table";
import { SimpleBarChart, SimplePieChart } from "./components/Charts";
import { Phone, AlertTriangle, Users, Activity, TrendingUp, Clock, FileText, CheckSquare, ShieldCheck } from "lucide-react";
// 2. Import Supabase client
import { createClient } from "@/lib/supabaseClient"; 

export default function AdminDashboard() {
  // 3. Khởi tạo client
  const supabase = createClient();
  
  // 4. Khởi tạo State cho tất cả dữ liệu động
  const [stats, setStats] = useState<any>(null);
  const [phoneReports, setPhoneReports] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]); // State cho PieChart
  const [loading, setLoading] = useState(true);

  // 5. SỬA LỖI (VÀNG): Bọc fetchData bằng useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi cả 4 hàm cùng lúc để tăng tốc
      let [statsRes, dailyRes, reportsRes, pieRes] = await Promise.all([
        supabase.rpc("get_admin_dashboard_stats").single(),
        supabase.rpc("get_daily_stats_chart"),
        supabase.rpc("get_recent_reports"),
        supabase.rpc("get_report_type_distribution")
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (statsRes.error) throw statsRes.error;

      if (dailyRes.data) setDailyStats(dailyRes.data);
      if (dailyRes.error) throw dailyRes.error;

      if (reportsRes.data) setPhoneReports(reportsRes.data);
      if (reportsRes.error) throw reportsRes.error;
      
      if (pieRes.data) setPieData(pieRes.data);
      if (pieRes.error) throw pieRes.error;

    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]); // Thêm 'supabase' làm phụ thuộc

  // 6. Cập nhật useEffect
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Thêm 'fetchData' vào mảng phụ thuộc

  // 7. Cập nhật Columns (cột) cho bảng
  const columns = [
    { 
      key: 'report_value', 
      label: 'Đối tượng Báo cáo',
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    { 
      key: 'report_type', 
      label: 'Loại hình',
      render: (value: string) => (
        <span className="font-semibold">{value || 'N/A'}</span>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: string) => {
        const colorMap: any = {
          pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          confirmed: 'bg-green-100 text-green-700 border-green-200',
          rejected: 'bg-red-100 text-red-700 border-red-200',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorMap[value] || 'bg-gray-100 text-gray-700'}`}>
            {value?.toUpperCase() || 'UNKNOWN'}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Ngày báo cáo',
      render: (value: string) => (
        <span className="text-gray-600">
          {new Date(value).toLocaleString('vi-VN')}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // 8. Cập nhật JSX với dữ liệu động
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Tổng quan</h1>
            <p className="text-gray-600 mt-1 flex items-center">
              <Clock size={16} className="mr-1" />
              Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}
            </p>
          </div>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <Activity size={18} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Stats Cards - Cập nhật theo SQL mới */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            title="Tổng số check"
            value={stats?.total_checks || 0}
            icon={<Phone className="text-blue-600" size={28} />}
            trend=""
          />
          <Card
            title="Lừa đảo đã xác nhận"
            value={stats?.confirmed_scams || 0}
            icon={<ShieldCheck className="text-red-600" size={28} />}
            trend=""
          />
          <Card
            title="User hoạt động (7 ngày)"
            value={stats?.active_users_week || 0}
            icon={<Users className="text-green-600" size={28} />}
            trend=""
          />
          <Card
            title="Check hôm nay"
            value={stats?.checks_today || 0}
            icon={<TrendingUp className="text-purple-600" size={28} />}
            trend=""
          />
        </div>

        {/* Charts - Cập nhật dùng data động */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Hoạt động 7 ngày qua</h3>
            <SimpleBarChart 
              data={dailyStats} // Dùng data động
              dataKey1="total_checks"
              dataKey2="total_reports"
              label1="Lượt Check"
              label2="Báo Cáo Mới"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Phân bố loại hình báo cáo</h3>
            <SimplePieChart data={pieData} /> {/* Dùng data động */}
          </div>
        </div>

        {/* Recent Phone Numbers Table */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Báo cáo gần đây</h2>
            <a 
              href="/admin/reports" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Xem tất cả →
            </a>
          </div>
          <Table columns={columns} data={phoneReports} loading={loading} />
        </div>

        {/* Quick Actions - Cập nhật dùng data động */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a 
            href="/admin/reports" 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FileText className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Báo cáo chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.pending_reports || 0}</p>
              </div>
            </div>
          </a>

          <a 
            href="/admin/users" 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Users hoạt động</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.active_users_week || 0}</p>
              </div>
            </div>
          </a>

          <a 
            href="/admin/reports?status=confirmed" 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <ShieldCheck className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Lừa đảo đã xác nhận</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.confirmed_scams || 0}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}