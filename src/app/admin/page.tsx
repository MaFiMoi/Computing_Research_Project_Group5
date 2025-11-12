"use client";

import React, { useState, useEffect } from "react";
import Card from "./components/Card";
import Table from "./components/Table";
import { SimpleBarChart, SimplePieChart } from "./components/Charts";
import { Phone, AlertTriangle, Users, Activity, TrendingUp, Clock ,FileText, Globe } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch thống kê tổng quan
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      
      if (statsData.success) {
        setStats(statsData.data.overview);
        setDailyStats(statsData.data.daily);
      }

      // Fetch danh sách số điện thoại gần đây
      const phonesRes = await fetch('/api/admin/phone-numbers?limit=10');
      const phonesData = await phonesRes.json();
      
      if (phonesData.success) {
        setPhoneNumbers(phonesData.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Dữ liệu cho biểu đồ
  const chartData = [
    { day: 'T2', checks: 420, scams: 89 },
    { day: 'T3', checks: 380, scams: 76 },
    { day: 'T4', checks: 510, scams: 102 },
    { day: 'T5', checks: 440, scams: 88 },
    { day: 'T6', checks: 590, scams: 118 },
    { day: 'T7', checks: 680, scams: 136 },
    { day: 'CN', checks: 720, scams: 144 }
  ];

  const pieData = [
    { name: 'Critical', value: 35 },
    { name: 'High', value: 25 },
    { name: 'Medium', value: 20 },
    { name: 'Low', value: 15 },
    { name: 'Safe', value: 5 }
  ];

  // Columns cho bảng
  const columns = [
    { 
      key: 'phone_number', 
      label: 'Số điện thoại',
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    { 
      key: 'total_reports', 
      label: 'Số báo cáo',
      render: (value: number) => (
        <span className="font-semibold">{value}</span>
      )
    },
    {
      key: 'risk_level',
      label: 'Mức độ rủi ro',
      render: (value: string) => {
        const colorMap: any = {
          critical: 'bg-red-100 text-red-700 border-red-200',
          high: 'bg-orange-100 text-orange-700 border-orange-200',
          medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          low: 'bg-blue-100 text-blue-700 border-blue-200',
          safe: 'bg-green-100 text-green-700 border-green-200'
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorMap[value] || 'bg-gray-100 text-gray-700'}`}>
            {value?.toUpperCase() || 'UNKNOWN'}
          </span>
        );
      }
    },
    {
      key: 'is_scam',
      label: 'Trạng thái',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          value 
            ? 'bg-red-100 text-red-700 border-red-200' 
            : 'bg-green-100 text-green-700 border-green-200'
        }`}>
          {value ? 'LỪA ĐẢO' : 'AN TOÀN'}
        </span>
      )
    },
    {
      key: 'check_count',
      label: 'Lượt check',
      render: (value: number) => (
        <span className="text-gray-600">{value || 0}</span>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            title="Tổng số check"
            value={stats?.total_checks || 0}
            icon={<Phone className="text-blue-600" size={28} />}
            trend="12% so với tuần trước"
            trendUp={true}
          />
          <Card
            title="Số lừa đảo"
            value={stats?.total_scam_numbers || 0}
            icon={<AlertTriangle className="text-red-600" size={28} />}
            trend="8% so với tuần trước"
            trendUp={false}
          />
          <Card
            title="Người dùng hoạt động"
            value={stats?.active_users_week || 0}
            icon={<Users className="text-green-600" size={28} />}
            trend="5% so với tuần trước"
            trendUp={true}
          />
          <Card
            title="Check hôm nay"
            value={stats?.checks_today || 0}
            icon={<TrendingUp className="text-purple-600" size={28} />}
            trend="20% so với hôm qua"
            trendUp={true}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Lượt check theo tuần</h3>
            <SimpleBarChart 
              data={chartData}
              dataKey1="checks"
              dataKey2="scams"
              label1="Tổng check"
              label2="Phát hiện lừa đảo"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Phân bố mức độ rủi ro</h3>
            <SimplePieChart data={pieData} />
          </div>
        </div>

        {/* Recent Phone Numbers Table */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Số điện thoại được check gần đây</h2>
            <a 
              href="/admin/phone-numbers" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Xem tất cả →
            </a>
          </div>
          <Table columns={columns} data={phoneNumbers} loading={false} />
        </div>

        {/* Quick Actions */}
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
                <p className="text-2xl font-bold text-gray-800">12</p>
              </div>
            </div>
          </a>

          <a 
            href="/admin/ai-logs" 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">AI crawl hôm nay</p>
                <p className="text-2xl font-bold text-gray-800">8</p>
              </div>
            </div>
          </a>

          <a 
            href="/admin/web-sources" 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Globe className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Nguồn đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-800">5/12</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}