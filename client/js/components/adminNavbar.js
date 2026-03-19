import { icons } from "./icons.js";

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] || char;
  });

//  Chevron SVG 

const chevronDown = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;

//  Nav structure 
//
// Items with `children` render as an accordion group.
// `activePage` matches either the parent id OR a child id.

const navGroups = [
  {
    label: "MENU",
    items: [
      {
        id: "overview",
        icon: icons.adminOverview,
        label: "Overview",
        href: "admin-dashboard.html",
      },
      {
        // Accordion parent
        id: "moderation",
        icon: icons.adminQueues,
        label: "Moderation",
        badge: true,
        children: [
          {
            id: "moderation-stories",
            label: "Stories",
            href: "stories-moderation.html",
            badge: true, // shows pending count
          },
          {
            id: "moderation-clinics",
            label: "Clinics",
            href: "clinics-moderation.html",
          },
          {
            id: "specialists-onboarding",
            label: "Specialists Onboarding",
            href: "specialists-onboarding.html",
          },
  {
            id: "media-suggestions",
            label: "Media Suggestions",
            href: "media-suggestions.html",
          },
          {
            id: "moderation-other",
            label: "Other Requests",
            href: "requests-moderation.html",
          },
        ],
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

// Render sidebar 

export function renderAdminSidebar({
  activePage = "overview",
  totalPending = 0,
  currentRole = "Admin",
} = {}) {
  const logoSrc = "../assets/logo/favicon.png";

  // Determine if a moderation child is active so we keep the parent open
  const moderationChildIds = ["moderation-stories", "moderation-clinics", "moderation-other"];
  const moderationIsActive =
    activePage === "moderation" || moderationChildIds.includes(activePage);

  const groupsHtml = navGroups
    .map(
      (group) => `
    <div class="sidebar-group">
      <span class="sidebar-group-label">${group.label}</span>
      <ul class="sidebar-nav-list" role="list">
        ${group.items.map((item) => renderNavItem(item, activePage, totalPending, moderationIsActive)).join("")}
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

function renderNavItem(item, activePage, totalPending, moderationIsActive) {
  const isActive = activePage === item.id;

  // Accordion item (has children) 
  if (item.children) {
    const isOpen = moderationIsActive;
    const subItems = item.children
      .map((child) => {
        const childActive = activePage === child.id;
        const showBadge   = child.badge && child.id === "moderation-stories" && totalPending > 0;
        return `
          <li class="sidebar-subnav-item">
            <a
              href="${child.href}"
              class="sidebar-nav-item${childActive ? " active" : ""}"
              aria-current="${childActive ? "page" : "false"}"
            >
              <span class="sidebar-subnav-dot" aria-hidden="true"></span>
              <span>${child.label}</span>
              ${showBadge ? `<span class="sidebar-badge" aria-label="${totalPending} pending">${totalPending}</span>` : ""}
            </a>
          </li>
        `;
      })
      .join("");

    return `
      <li>
        <button
          class="sidebar-nav-item has-children${isOpen ? " active" : ""}"
          id="sidebar-moderation-toggle"
          aria-expanded="${isOpen}"
          aria-controls="sidebar-moderation-subnav"
          type="button"
        >
          <span class="sidebar-nav-icon">${item.icon}</span>
          <span>${item.label}</span>
          ${item.badge && totalPending > 0
            ? `<span class="sidebar-badge" aria-label="${totalPending} pending">${totalPending}</span>`
            : ""}
          <span class="sidebar-nav-chevron" aria-hidden="true">${chevronDown}</span>
        </button>
        <ul
          class="sidebar-subnav${isOpen ? " open" : ""}"
          id="sidebar-moderation-subnav"
          role="list"
        >
          ${subItems}
        </ul>
      </li>
    `;
  }

  // Regular item 
  return `
    <li>
      <a
        href="${item.href}"
        class="sidebar-nav-item${isActive ? " active" : ""}"
        aria-current="${isActive ? "page" : "false"}"
      >
        <span class="sidebar-nav-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${item.badge && totalPending > 0
          ? `<span class="sidebar-badge" aria-label="${totalPending} pending">${totalPending}</span>`
          : ""}
      </a>
    </li>
  `;
}

// Render topbar

export function renderAdminTopbar({ name = "Admin", email = "" } = {}) {
  const safeName  = escapeHtml(name  || "Admin");
  const safeEmail = escapeHtml(email || "");

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
        <div class="topbar-user-card" aria-label="Admin account">
          <div class="topbar-user-inline">
            <span class="topbar-user-email">${safeEmail}</span>
            <button class="topbar-logout" data-admin-logout type="button" aria-label="Log out">
              Logout
            </button>
          </div>
          <div class="topbar-user-menu-wrap">
            <button class="topbar-profile-btn" id="topbar-profile-btn" type="button" aria-label="Open profile menu" aria-expanded="false">
              ${icons.adminUser}
            </button>
            <div class="topbar-user-menu" id="topbar-user-menu" aria-hidden="true">
              <div class="menu-user-name">${safeName}</div>
              <div class="menu-user-email">${safeEmail}</div>
              <button class="menu-logout-btn" data-admin-logout type="button">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Init 

export function initAdminNavbar() {
  // Sidebar toggle (mobile)
  const toggle  = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("admin-sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (toggle && sidebar && overlay) {
    const openSidebar = () => {
      sidebar.classList.add("open");
      overlay.classList.add("visible");
      toggle.setAttribute("aria-expanded", "true");
      overlay.removeAttribute("aria-hidden");
    };

    const closeSidebar = () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("visible");
      toggle.setAttribute("aria-expanded", "false");
      overlay.setAttribute("aria-hidden", "true");
    };

    toggle.addEventListener("click", () =>
      sidebar.classList.contains("open") ? closeSidebar() : openSidebar()
    );
    overlay.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSidebar(); });
  }

  // Moderation accordion
  const modToggle = document.getElementById("sidebar-moderation-toggle");
  const modSubnav = document.getElementById("sidebar-moderation-subnav");

  if (modToggle && modSubnav) {
    modToggle.addEventListener("click", () => {
      const expanded = modToggle.getAttribute("aria-expanded") === "true";
      modToggle.setAttribute("aria-expanded", String(!expanded));
      modToggle.classList.toggle("active", !expanded);
      modSubnav.classList.toggle("open", !expanded);
    });
  }
}