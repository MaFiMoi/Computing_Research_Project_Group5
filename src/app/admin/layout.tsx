import type { Metadata } from "next";
import Sidebar from "./components/Sidebar";
import "./admin.css";

export const metadata: Metadata = {  // ✅ Thêm ": Metadata"
  title: 'Admin Dashboard - ScamCheck',
  description: 'Quản lý hệ thống check số điện thoại lừa đảo',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}