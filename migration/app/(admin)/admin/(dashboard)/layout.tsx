"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopNav from "@/components/admin/AdminTopNav";
import { fetchAdminPendingCount } from "@/lib/api/admin-dashboard-api";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchAdminPendingCount()
      .then((count) => {
        if (!cancelled) setTotalPending(count);
      })
      .catch(() => {
        // Sidebar badge is non-critical — leave it at 0 on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} totalPending={totalPending} />
      
      {/* Mobile overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <div className="admin-main">
        <AdminTopNav onMenuClick={() => setIsSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
}
