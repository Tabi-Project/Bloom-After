import { icons } from "./icons.js";

const navGroups = [
  {
    label: "MENU",
    items: [
      {
        id: "overview",
        icon: icons.adminOverview,
        label: "Overview",
        href: "#overview-section",
      },
      {
        id: "moderation-queues",
        icon: icons.adminQueues,
        label: "Moderation Queues",
        href: "#queues-section",
        badge: true,
      },
      {
        id: "content-management",
        icon: icons.adminContent,
        label: "Content Management",
        href: "#content-section",
      },
      {
        id: "user-access",
        icon: icons.adminUserAccess,
        label: "User Access",
        href: "#roles-section",
      },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        id: "settings",
        icon: icons.adminSettings,
        label: "Settings",
        href: "settings.html",
      },
    ],
  },
];

export function renderAdminSidebar({
  activePage = "overview",
  totalPending = 0,
  currentRole = "Admin",
} = {}) {
  const logoSrc = "../assets/logo/BLOOM LIGHT primary.png";

  const groupsHtml = navGroups
    .map(
      (group) => `
    <div class="sidebar-group">
      <span class="sidebar-group-label">${group.label}</span>
      <ul class="sidebar-nav-list" role="list">
        ${group.items
          .map(
            (item) => `
          <li>
            <a href="${item.href}"
               class="sidebar-nav-item${activePage === item.id ? " active" : ""}"
               aria-current="${activePage === item.id ? "page" : "false"}"
            >
              <span class="sidebar-nav-icon">${item.icon}</span>
              <span>${item.label}</span>
              ${
                item.badge && totalPending > 0
                  ? `<span class="sidebar-badge" aria-label="${totalPending} pending">${totalPending}</span>`
                  : ""
              }
            </a>
          </li>
        `,
          )
          .join("")}
      </ul>
    </div>
  `,
    )
    .join("");

  return `
    <aside class="admin-sidebar" id="admin-sidebar" aria-label="Admin navigation">
      <div class="sidebar-header">
        <a href="admin-dashboard.html" class="sidebar-logo-link" aria-label="Bloom Admin home">
          <img src="${logoSrc}" alt="Bloom After logo" class="sidebar-logo-img" />
        </a>
        <div class="sidebar-identity">
          <span class="sidebar-app-name">Bloom Admin</span>
          <span class="sidebar-role-pill">${currentRole}</span>
        </div>
      </div>

      <nav class="sidebar-nav" aria-label="Admin menu">
        ${groupsHtml}
      </nav>

      <div class="sidebar-footer">
        <a href="index.html" class="sidebar-logout">
          <span class="sidebar-nav-icon">${icons.adminLogout}</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>

    <div class="sidebar-overlay" id="sidebar-overlay" aria-hidden="true"></div>
  `;
}

export function renderAdminTopbar() {
  return `
    <div class="admin-topbar" id="admin-topbar">
      <div class="topbar-left">
        <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar" aria-expanded="false">
          ${icons.adminMenu}
        </button>
        <div class="topbar-search-wrap">
          <span class="topbar-search-icon">${icons.adminSearch}</span>
          <input
            type="search"
            class="topbar-search"
            placeholder="Search clinics, resources, users..."
            aria-label="Search admin"
            autocomplete="off"
          />
        </div>
      </div>
      <div class="topbar-right">
        <button class="topbar-icon-btn" aria-label="Notifications">
          ${icons.adminBell}
        </button>
        <div class="topbar-avatar" aria-hidden="true">
          ${icons.adminUser}
        </div>
      </div>
    </div>
  `;
}

export function initAdminNavbar() {
  const toggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("admin-sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (!toggle || !sidebar || !overlay) return;

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("visible");
    toggle.setAttribute("aria-expanded", "true");
    overlay.removeAttribute("aria-hidden");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
    toggle.setAttribute("aria-expanded", "false");
    overlay.setAttribute("aria-hidden", "true");
  }

  toggle.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });
}
