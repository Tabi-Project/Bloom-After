"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <Link href="/admin/dashboard" className="sidebar-logo-link" onClick={() => setIsOpen(false)}>
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: 'var(--color-primary)' }}>P</div>
        </Link>
        <div className="sidebar-identity">
          <span className="sidebar-app-name">PPD Admin</span>
          <span className="sidebar-role-pill">Super Admin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-group">
          <ul className="sidebar-nav-list">
            <li>
              <Link 
                href="/admin/dashboard" 
                className={`sidebar-nav-item ${pathname === "/admin/dashboard" ? "active" : ""}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="sidebar-nav-icon material-symbols-outlined">dashboard</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                href="#" 
                className={`sidebar-nav-item`}
                onClick={() => setIsOpen(false)}
              >
                <span className="sidebar-nav-icon material-symbols-outlined">group</span>
                <span>Team Management</span>
              </Link>
            </li>
            <li>
              <Link 
                href="#" 
                className={`sidebar-nav-item`}
                onClick={() => setIsOpen(false)}
              >
                <span className="sidebar-nav-icon material-symbols-outlined">verified_user</span>
                <span>Role Permissions</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/dashboard/settings" 
                className={`sidebar-nav-item ${pathname.includes("settings") ? "active" : ""}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="sidebar-nav-icon material-symbols-outlined">settings</span>
                <span>General Settings</span>
              </Link>
            </li>
            <li>
              <Link 
                href="#" 
                className={`sidebar-nav-item`}
                onClick={() => setIsOpen(false)}
              >
                <span className="sidebar-nav-icon material-symbols-outlined">history</span>
                <span>Audit Logs</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout">
          <span className="sidebar-nav-icon material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
