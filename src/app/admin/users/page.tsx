"use client";

// 1. Import thêm 'useCallback' và 'useMemo'
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Table from "../components/Table";
import { Users as UsersIcon, UserCheck, UserX, TrendingUp } from "lucide-react";
// 2. Import Supabase client
import { createClient } from "@/lib/supabaseClient";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Khởi tạo Supabase client
  const supabase = createClient();

  // 4. SỬA LỖI (VÀNG): Bọc 'fetchUsers' bằng 'useCallback'
  const fetchUsers = useCallback(async () => {
    setLoading(true); // Chuyển setLoading lên đầu
    try {
      // Gọi hàm RPC đã tạo
      const { data, error } = await supabase.rpc("get_admin_user_list");

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setUsers(data);
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      setLoading(false);
    }
  }, [supabase]); // Thêm 'supabase' làm phụ thuộc

  // 5. Cập nhật useEffect
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Thêm 'fetchUsers' vào mảng phụ thuộc

  // 6. TỐI ƯU: Tính toán các chỉ số thống kê bằng useMemo
  const stats = useMemo(() => {
    if (loading || users.length === 0) {
      return {
        total: 0,
        active: 0,
        suspended: 0,
        avgChecks: 0
      };
    }

    const total = users.length;
    const active = users.filter(u => u.is_active).length;
    const suspended = total - active;
    const totalChecks = users.reduce((sum, u) => sum + (u.total_checks || 0), 0);
    const avgChecks = total > 0 ? Math.round(totalChecks / total) : 0;

    return { total, active, suspended, avgChecks };
  }, [users, loading]); // Phụ thuộc vào 'users' và 'loading'


  const columns = [
    {
      key: 'id',
      label: 'ID Người dùng',
      render: (value: string) => (
        <span className="font-mono text-xs text-gray-500">
          {value.substring(0, 8)}...
        </span>
      )
    },
    {
      key: 'name',
      label: 'Tên',
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium text-gray-800">{value || '(Chưa có tên)'}</p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      )
    },
    {
      key: 'total_checks',
      label: 'Số lần check',
      render: (value: number) => (
        <span className="font-semibold text-blue-600">{value || 0}</span>
      )
    },
    {
      key: 'total_reports',
      label: 'Số báo cáo',
      render: (value: number) => (
        <span className="font-semibold text-orange-600">{value || 0}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Ngày tham gia',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      key: 'last_login',
      label: 'Đăng nhập cuối',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có'}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Trạng thái',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {value ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      )
    }
  ];

  // Phần JSX đã sửa lỗi
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center space-x-3">
          <UsersIcon className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý Người dùng</h1>
            <p className="text-gray-600 mt-1">Xem và quản lý thông tin người dùng hệ thống</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Card: Tổng người dùng */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <UsersIcon className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : stats.total}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Đang hoạt động */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : stats.active}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Tạm khóa */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <UserX className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Tạm khóa</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? '...' : stats.suspended}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Trung bình check */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Trung bình check</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : stats.avgChecks}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <Table columns={columns} data={users} loading={loading} />
      </div>
    </div>
  );
}