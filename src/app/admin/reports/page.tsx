"use client";

import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/admin/reports' 
        : `/api/admin/reports?status=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setReports(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleAction = async (reportId: number, status: string) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reportId, 
          status,
          adminId: 1
        })
      });

      if (res.ok) {
        alert(`Đã ${status === 'verified' ? 'xác nhận' : 'từ chối'} báo cáo!`);
        fetchReports();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const columns = [
    { 
      key: 'phone_number', 
      label: 'Số điện thoại',
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    { 
      key: 'report_type', 
      label: 'Loại',
      render: (value: string) => (
        <span className="capitalize">{value}</span>
      )
    },
    { 
      key: 'description', 
      label: 'Mô tả',
      render: (value: string) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block">
          {value}
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
          verified: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã xác nhận', icon: CheckCircle },
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
      render: (value: number, row: any) => (
        row.status === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(value, 'verified')}
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
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Báo cáo
            </h1>
        <p className="text-gray-600 mt-1">Xem và xử lý các báo cáo từ người dùng</p>
      </div>

      <div className="p-8">
        {/* Filters */}
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
                onClick={() => setFilter('verified')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'verified'
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

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 text-sm font-medium">Chờ xử lý</p>
                <p className="text-3xl font-bold text-yellow-800 mt-2">
                  {reports.filter(r => r.status === 'pending').length}
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
                  {reports.filter(r => r.status === 'verified').length}
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
                  {reports.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <Table columns={columns} data={reports} loading={loading} />
      </div>
    </div>
  );
}