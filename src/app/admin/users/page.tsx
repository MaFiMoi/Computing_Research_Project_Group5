"use client";

import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import { Users as UsersIcon, UserCheck, UserX, TrendingUp } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (value: number) => (
        <span className="font-mono text-gray-600">#{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Tên',
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium text-gray-800">{value}</p>
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <UsersIcon className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm"></p>
                    <p className="text-gray-500 text-sm">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <UserX className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Tạm khóa</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => !u.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Trung bình check</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.length > 0 
                    ? Math.round(users.reduce((sum, u) => sum + (u.total_checks || 0), 0) / users.length)
                    : 0}
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