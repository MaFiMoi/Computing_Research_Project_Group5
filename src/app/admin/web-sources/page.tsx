"use client";

import React, { useState, useEffect } from "react";
import { Globe, Plus, Power, Settings } from "lucide-react";

export default function WebSourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    source_name: '',
    source_url: '',
    crawl_frequency: 'daily',
    priority: 3
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/admin/web-sources');
      const data = await res.json();
      
      if (data.success) {
        setSources(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/admin/web-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('✅ Đã thêm nguồn mới!');
        setShowForm(false);
        setFormData({
          source_name: '',
          source_url: '',
          crawl_frequency: 'daily',
          priority: 3
        });
        fetchSources();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Có lỗi xảy ra!');
    }
  };

  const toggleSource = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/web-sources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          is_active: !currentStatus 
        })
      });

      if (res.ok) {
        fetchSources();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải nguồn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Globe className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý Nguồn Web</h1>
              <p className="text-gray-600 mt-1">Cấu hình các website mà AI sẽ crawl dữ liệu</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{showForm ? 'Đóng form' : 'Thêm nguồn mới'}</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Add Source Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Thêm nguồn web mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên nguồn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.source_name}
                  onChange={(e) => setFormData({...formData, source_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Forum Lừa Đảo Việt Nam"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.source_url}
                  onChange={(e) => setFormData({...formData, source_url: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tần suất crawl
                  </label>
                  <select
                    value={formData.crawl_frequency}
                    onChange={(e) => setFormData({...formData, crawl_frequency: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="hourly">Mỗi giờ</option>
                    <option value="daily">Mỗi ngày</option>
                    <option value="weekly">Mỗi tuần</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức ưu tiên (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                ✓ Thêm nguồn
              </button>
            </form>
          </div>
        )}

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources.map((source) => (
            <div 
              key={source.id} 
              className={`bg-white rounded-xl shadow-sm border transition hover:shadow-md ${
                source.is_active ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">
                      {source.source_name}
                    </h3>
                    <p className="text-sm text-gray-600 break-all">{source.source_url}</p>
                  </div>
                  <button
                    onClick={() => toggleSource(source.id, source.is_active)}
                    className={`ml-2 p-2 rounded-lg transition ${
                      source.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={source.is_active ? 'Tắt nguồn' : 'Bật nguồn'}
                  >
                    <Power size={18} />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    source.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {source.is_active ? '● Đang hoạt động' : '○ Tạm dừng'}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium">Tần suất</p>
                    <p className="text-sm font-semibold text-blue-700 capitalize">
                      {source.crawl_frequency}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium">Ưu tiên</p>
                    <p className="text-sm font-semibold text-purple-700">
                      {source.priority}/5
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium">Tổng crawl</p>
                    <p className="text-sm font-semibold text-green-700">
                      {source.total_crawls || 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 font-medium">Số tìm thấy</p>
                    <p className="text-sm font-semibold text-orange-700">
                      {source.total_numbers_found || 0}
                    </p>
                  </div>
                </div>

                {/* Last Crawl */}
                {source.last_crawl && (
                  <p className="text-xs text-gray-500">
                    Crawl lần cuối: {new Date(source.last_crawl).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {sources.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Globe className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">Chưa có nguồn web nào</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Thêm nguồn đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}