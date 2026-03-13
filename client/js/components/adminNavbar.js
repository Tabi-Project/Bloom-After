const navIcons = {
  overview: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>`,
  queues: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>`,
  content: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>`,
  userAccess: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
    <polyline points="16 11 18 13 22 9"/>
  </svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`,
  logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>`,
  menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>`,
  bell: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>`,
  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>`,
};

const navGroups = [
  {
    label: "MENU",
    items: [
      {
        id: "overview",
        icon: navIcons.overview,
        label: "Overview",
        href: "#overview-section",
      },
      {
        id: "moderation-queues",
        icon: navIcons.queues,
        label: "Moderation Queues",
        href: "#queues-section",
        badge: true,
      },
      {
        id: "content-management",
        icon: navIcons.content,
        label: "Content Management",
        href: "#content-section",
      },
      {
        id: "user-access",
        icon: navIcons.userAccess,
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
        icon: navIcons.settings,
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
          <span class="sidebar-nav-icon">${navIcons.logout}</span>
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
          ${navIcons.menu}
        </button>
        <div class="topbar-search-wrap">
          <span class="topbar-search-icon">${navIcons.search}</span>
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
          ${navIcons.bell}
        </button>
        <div class="topbar-avatar" aria-hidden="true">
          ${navIcons.user}
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
