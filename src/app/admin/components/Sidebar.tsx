"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Phone, FileText, Activity, Globe, Users, BarChart } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin', icon: Home, label: 'Tổng quan', exact: true },
    { href: '/admin/phone-numbers', icon: Phone, label: 'Số điện thoại' },
    { href: '/admin/reports', icon: FileText, label: 'Báo cáo' },
    { href: '/admin/ai-logs', icon: Activity, label: 'AI Logs' },
    { href: '/admin/web-sources', icon: Globe, label: 'Nguồn web' },
    { href: '/admin/users', icon: Users, label: 'Người dùng' },
    { href: '/admin/statistics', icon: BarChart, label: 'Thống kê' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-xl z-50">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Phone size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">ScamCheck</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">admin@scamcheck.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}