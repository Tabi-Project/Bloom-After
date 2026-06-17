"use client";

import React from "react";

interface AdminTopNavProps {
  onMenuClick: () => void;
}

export default function AdminTopNav({ onMenuClick }: AdminTopNavProps) {
  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" onClick={onMenuClick}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="text-slate-900 font-bold text-lg hidden md:block" style={{fontFamily: 'var(--font-heading)'}}>
          PPD Targets Admin
        </span>
        <div className="topbar-search-wrap">
          <span className="topbar-search-icon material-symbols-outlined">search</span>
          <input type="text" className="topbar-search" placeholder="Search settings, members, or roles..." />
        </div>
      </div>
      
      <div className="topbar-right">
        <button className="topbar-icon-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="topbar-icon-btn">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <button className="topbar-icon-btn">
          <span className="material-symbols-outlined">apps</span>
        </button>
        
        <div className="topbar-user-card">
          <div className="topbar-user-inline">
            <span className="topbar-user-email">admin@botanical.io</span>
            <button className="topbar-logout">Save Changes</button>
          </div>
          <div className="topbar-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
