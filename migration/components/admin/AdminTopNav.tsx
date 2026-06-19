"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminUser, logoutAdmin } from "@/lib/admin-session";

interface AdminTopNavProps {
  onMenuClick: () => void;
}

export default function AdminTopNav({ onMenuClick }: AdminTopNavProps) {
  const router = useRouter();
  const [account, setAccount] = useState<{ name: string; email: string }>({
    name: "Admin",
    email: "",
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);
  const { name, email } = account;

  // sessionStorage is client-only; read it after mount to avoid an SSR
  // hydration mismatch (the server has no access to it).
  useEffect(() => {
    const user = getAdminUser();
    if (user?.name || user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing client-only sessionStorage into state after mount
      setAccount({ name: user.name || "Admin", email: user.email || "" });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace("/admin/login");
  };

  return (
    <header className="admin-topbar" id="admin-topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" onClick={onMenuClick} aria-label="Toggle sidebar">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="topbar-search-wrap">
          <span className="topbar-search-icon material-symbols-outlined">search</span>
          <input
            type="search"
            className="topbar-search"
            placeholder="Search clinics, resources, users..."
            aria-label="Search admin"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="topbar-user-card" aria-label="Admin account">
          <div className="topbar-user-inline">
            <span className="topbar-user-email">{email}</span>
            <button className="topbar-logout" type="button" aria-label="Log out" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className="topbar-user-menu-wrap" ref={menuWrapRef}>
            <button
              className="topbar-profile-btn"
              type="button"
              aria-label="Open profile menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="material-symbols-outlined">person</span>
            </button>
            <div className={`topbar-user-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
              <div className="menu-user-name">{name}</div>
              <div className="menu-user-email">{email}</div>
              <button className="menu-logout-btn" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
