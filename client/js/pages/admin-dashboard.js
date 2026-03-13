import {
  renderAdminSidebar,
  renderAdminTopbar,
  initAdminNavbar,
} from "../components/adminNavbar.js";
import {
  renderOverviewSection,
  renderQueuesAndContent,
  renderRolesSection,
  renderWelcomeSection,
  renderOverviewSkeleton,
} from "../components/adminRenderers.js";
import {
  adminConfig,
  statsData,
  queuesData,
  draftData,
  rolesData,
} from "../data/admin.js";
import { renderFooter } from "../components/footer.js";
import api from "../api.js";

const ADMIN_USER_STORAGE_KEY = "adminUser";

const getStoredAdminUser = () => {
  try {
    const stored = sessionStorage.getItem(ADMIN_USER_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    console.warn("Unable to read admin user from storage.", error);
    return null;
  }
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

const buildOverviewStats = ({ resources = {}, stories = {} } = {}) => {
  const totalResources = Number.isFinite(resources.total) ? resources.total : 0;
  const publishedCount = Number.isFinite(resources.published)
    ? resources.published
    : 0;
  const draftCount = Number.isFinite(resources.drafts) ? resources.drafts : 0;
  const pendingStories = Number.isFinite(stories.pending) ? stories.pending : 0;

  return [
    {
      id: "total-resources-card",
      label: "Total Resources",
      value: formatNumber(totalResources),
      meta: "Library size",
      muted: true,
    },
    {
      id: "published-resources-card",
      label: "Published Resources",
      value: formatNumber(publishedCount),
      meta: "Live on Bloom After",
      muted: true,
    },
    {
      id: "draft-resources-card",
      label: "Draft Resources",
      value: formatNumber(draftCount),
      meta: "Needs review",
      muted: true,
    },
    {
      id: "pending-stories-card",
      label: "Stories Pending Review",
      value: formatNumber(pendingStories),
      meta: "Awaiting moderation",
      muted: true,
    },
  ];
};

const fetchOverviewStats = async () => {
  try {
    const response = await api.get("/api/v1/admin/stats");
    if (!response?.data) return { authorized: true, stats: statsData };
    return { authorized: true, stats: buildOverviewStats(response.data) };
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      window.location.assign("/client/pages/admin-login.html");
      return { authorized: false, stats: null };
    }
    return { authorized: true, stats: statsData };
  }
};

const bindLogout = () => {
  const logoutButtons = Array.from(document.querySelectorAll("[data-admin-logout]"));
  if (!logoutButtons.length) return;

  logoutButtons.forEach((logoutButton) => {
    logoutButton.addEventListener("click", async () => {
      const originalLabel = logoutButton.textContent;
      logoutButton.disabled = true;
      logoutButton.textContent = "Logging out...";
    try {
      await api.post("/api/v1/auth/logout");
    } catch (error) {
      // Intentionally ignore logout network errors.
    } finally {
      logoutButton.textContent = originalLabel;
      logoutButton.disabled = false;
      sessionStorage.removeItem(ADMIN_USER_STORAGE_KEY);
      sessionStorage.removeItem("adminToken");
      window.location.assign("/client/pages/admin-login.html");
    }
    });
  });
};

const initProfileMenu = () => {
  const toggle = document.getElementById("topbar-profile-btn");
  const menu = document.getElementById("topbar-user-menu");

  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    menu.classList.contains("open") ? closeMenu() : openMenu();
  });

  document.addEventListener("click", (event) => {
    if (!menu.classList.contains("open")) return;
    if (menu.contains(event.target) || toggle.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
};

async function init() {
  const totalPending = queuesData.reduce((sum, q) => sum + q.count, 0);
  const storedAdminUser = getStoredAdminUser();


  document.getElementById("sidebar-root").innerHTML = renderAdminSidebar({
    ...adminConfig,
    totalPending,
    currentRole: storedAdminUser?.isSuperAdmin ? "superadmin" : "moderator"
  });
  document.getElementById("topbar-root").innerHTML = renderAdminTopbar({
    name: storedAdminUser?.name,
    email: storedAdminUser?.email,
  });
  document.getElementById("overview-root").innerHTML =
    renderOverviewSkeleton();
  document.getElementById("welcome-root").innerHTML = renderWelcomeSection({
    name: storedAdminUser?.name,
  });
  document.getElementById("queues-content-root").innerHTML =
    renderQueuesAndContent(queuesData, draftData);
  document.getElementById("roles-root").innerHTML =
    renderRolesSection(rolesData);
  document.getElementById("footer-root").innerHTML = renderFooter();

  initAdminNavbar();
  bindLogout();
  initProfileMenu();

  const { authorized, stats } = await fetchOverviewStats();
  if (!authorized) return;
  document.getElementById("overview-root").innerHTML =
    renderOverviewSection(stats || statsData);
}

init();
