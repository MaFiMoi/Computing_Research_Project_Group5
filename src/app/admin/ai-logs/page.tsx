"use client";

import React, { useState, useEffect } from "react";
import { Activity, CheckCircle, XCircle, Clock, Globe } from "lucide-react";

export default function AILogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/ai-logs');
      const data = await res.json();
      
      if (data.success) {
        setLogs(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center space-x-3">
          <Activity className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Log Hoạt động AI</h1>
            <p className="text-gray-600 mt-1">Theo dõi quá trình crawl dữ liệu từ các nguồn</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Activity className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Tổng crawls</p>
                <p className="text-2xl font-bold text-gray-800">{logs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Thành công</p>
                <p className="text-2xl font-bold text-green-600">
                  {logs.filter(l => l.status === 'success').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Thất bại</p>
                <p className="text-2xl font-bold text-red-600">
                  {logs.filter(l => l.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Globe className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Số tìm thấy</p>
                <p className="text-2xl font-bold text-purple-600">
                  {logs.reduce((sum, log) => sum + (log.numbers_found || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={`bg-white p-6 rounded-xl shadow-sm border transition hover:shadow-md ${
                log.status === 'success' 
                  ? 'border-green-100' 
                  : log.status === 'failed'
                  ? 'border-red-100'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Status Indicator */}
                  <div className={`mt-1 w-3 h-3 rounded-full ${
                    log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>

                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">{log.source_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{log.source_url}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium">Tìm thấy</p>
                        <p className="text-lg font-bold text-blue-700">{log.numbers_found || 0}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-medium">Thêm mới</p>
                        <p className="text-lg font-bold text-green-700">{log.numbers_added || 0}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-purple-600 font-medium">Cập nhật</p>
                        <p className="text-lg font-bold text-purple-700">{log.numbers_updated || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-medium">Thời gian</p>
                        <p className="text-lg font-bold text-gray-700">{log.crawl_duration || 0}s</p>
                      </div>
                    </div>

                    {/* Error Message */}
                    {log.error_message && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700 font-medium">
                          <XCircle size={16} className="inline mr-1" />
                          Lỗi: {log.error_message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-right">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Clock size={14} className="mr-1" />
                    {new Date(log.started_at).toLocaleString('vi-VN')}
                  </p>
                  {log.completed_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Hoàn thành: {new Date(log.completed_at).toLocaleTimeString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Activity className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">Chưa có log hoạt động</p>
          </div>
        )}
      </div>
    </div>
  );
}