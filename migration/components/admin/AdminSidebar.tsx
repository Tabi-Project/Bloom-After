"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminUser, logoutAdmin } from "@/lib/admin-session";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  id: string;
  icon: string;
  label: string;
  href?: string;
  children?: NavChild[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Mirrors the original client/js/components/adminNavbar.js information architecture.
const navGroups: NavGroup[] = [
  {
    label: "MENU",
    items: [
      { id: "overview", icon: "dashboard", label: "Overview", href: "/admin/dashboard" },
      {
        id: "moderation",
        icon: "gavel",
        label: "Moderation",
        children: [
          { label: "Stories", href: "/admin/moderation/stories" },
          { label: "Clinics", href: "/admin/moderation?type=clinic" },
          { label: "Specialists Onboarding", href: "/admin/moderation?type=specialist" },
          { label: "Media Suggestions", href: "/admin/moderation?type=media" },
          { label: "Other Requests", href: "/admin/moderation?type=request" },
        ],
      },
      { id: "content", icon: "article", label: "Content Management", href: "/admin/content-manager" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { id: "settings", icon: "settings", label: "General Settings", href: "/admin/dashboard/settings" },
    ],
  },
];

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState("Admin");
  const [moderationOpen, setModerationOpen] = useState(pathname.includes("/admin/moderation"));

  // sessionStorage is client-only; read it after mount to avoid an SSR
  // hydration mismatch (the server has no access to it).
  useEffect(() => {
    const user = getAdminUser();
    const resolved = user?.role
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
      : user?.isSuperAdmin
        ? "Super Admin"
        : null;
    if (resolved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing client-only sessionStorage into state after mount
      setRole(resolved);
    }
  }, []);

  const closeMobile = () => setIsOpen(false);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace("/admin/login");
  };

  const isItemActive = (href?: string) =>
    Boolean(href) && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`} aria-label="Admin navigation">
      <div className="sidebar-header">
        <Link href="/admin/dashboard" className="sidebar-logo-link" aria-label="Bloom Admin home" onClick={closeMobile}>
          <Image
            src="/assets/logo/favicon.png"
            alt="Bloom After logo"
            className="sidebar-logo-img"
            width={40}
            height={40}
          />
        </Link>
        <div className="sidebar-identity">
          <span className="sidebar-app-name">Bloom Admin</span>
          <span className="sidebar-role-pill">{role}</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Admin menu">
        {navGroups.map((group) => (
          <div className="sidebar-group" key={group.label}>
            <span className="sidebar-group-label">{group.label}</span>
            <ul className="sidebar-nav-list" role="list">
              {group.items.map((item) => {
                if (item.children) {
                  const groupActive =
                    moderationOpen || pathname.includes("/admin/moderation");
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`sidebar-nav-item has-children ${groupActive ? "active" : ""}`}
                        aria-expanded={moderationOpen}
                        aria-controls={`subnav-${item.id}`}
                        onClick={() => setModerationOpen((open) => !open)}
                      >
                        <span className="sidebar-nav-icon material-symbols-outlined">{item.icon}</span>
                        <span>{item.label}</span>
                        <span className="sidebar-nav-chevron material-symbols-outlined" aria-hidden="true">
                          expand_more
                        </span>
                      </button>
                      <ul
                        id={`subnav-${item.id}`}
                        className={`sidebar-subnav ${moderationOpen ? "open" : ""}`}
                        role="list"
                      >
                        {item.children.map((child) => {
                          const childActive = pathname === child.href.split("?")[0];
                          return (
                            <li className="sidebar-subnav-item" key={child.href}>
                              <Link
                                href={child.href}
                                className={`sidebar-nav-item ${childActive ? "active" : ""}`}
                                aria-current={childActive ? "page" : undefined}
                                onClick={closeMobile}
                              >
                                <span className="sidebar-subnav-dot" aria-hidden="true"></span>
                                <span>{child.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                }

                const active = isItemActive(item.href);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href ?? "#"}
                      className={`sidebar-nav-item ${active ? "active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      onClick={closeMobile}
                    >
                      <span className="sidebar-nav-icon material-symbols-outlined">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" type="button" aria-label="Log out" onClick={handleLogout}>
          <span className="sidebar-nav-icon material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
