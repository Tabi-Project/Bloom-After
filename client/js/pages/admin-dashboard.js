

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
  draftData,
  rolesData,
} from "../data/admin.js";
import { renderFooter } from "../components/footer.js";
import api from "../api.js";

const ADMIN_USER_KEY = "adminUser";


const getStoredAdminUser = () => {
  try {
    const s = sessionStorage.getItem(ADMIN_USER_KEY);
    if (!s) return null;
    const p = JSON.parse(s);
    return p && typeof p === "object" ? p : null;
  } catch {
    return null;
  }
};

const formatNumber = (v) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);

const buildOverviewStats = ({ resources = {}, stories = {} } = {}) => [
  { id: "total-resources-card",     label: "Total Resources",        value: formatNumber(resources.total     ?? 0), meta: "Library size",        muted: true },
  { id: "published-resources-card", label: "Published Resources",    value: formatNumber(resources.published ?? 0), meta: "Live on Bloom After", muted: true },
  { id: "draft-resources-card",     label: "Draft Resources",        value: formatNumber(resources.drafts    ?? 0), meta: "Needs review",        muted: true },
  { id: "pending-stories-card",     label: "Items Pending Review",   value: formatNumber(stories.pending     ?? 0), meta: "Awaiting moderation", muted: true },
];

// Data fetching

const fetchOverviewStats = async () => {
  try {
    const res = await api.get("/api/v1/admin/stats");
    if (!res?.data) return { authorized: true, stats: statsData };
    return { authorized: true, stats: buildOverviewStats(res.data) };
  } catch (err) {
    if (err?.status === 401 || err?.status === 403) {
      window.location.assign("/client/pages/admin-login.html");
      return { authorized: false, stats: null };
    }
    return { authorized: true, stats: statsData };
  }
};

const fetchAllSubmissions = async () => {
  try {
    const storiesRes = await api.get("/api/v1/admin/stories");
    const stories = storiesRes?.data?.stories || [];

    if (!Array.isArray(stories)) return [];

    return stories
      .map((story) => ({
        ...story,
        type: "story",
        title:
          story.story_text?.slice(0, 80)
          || story.story?.replace(/<[^>]+>/g, " ").trim().slice(0, 80)
          || "Story submission",
        submittedBy:
          story.privacy === "named" && story.name
            ? story.name
            : "Anonymous",
        submittedAt: story.createdAt || story.submittedAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.submittedAt || b.createdAt || 0) -
          new Date(a.submittedAt || a.createdAt || 0),
      );
  } catch (err) {
    if (err?.status === 401 || err?.status === 403) {
      window.location.assign("/client/pages/admin-login.html");
      return [];
    }
    return [];
  }
};

// Auth 

const bindLogout = () => {
  document.querySelectorAll("[data-admin-logout]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Logging out...";
      try { await api.post("/api/v1/auth/logout"); } catch (_) {}
      finally {
        btn.textContent = orig;
        btn.disabled = false;
        sessionStorage.removeItem(ADMIN_USER_KEY);
        sessionStorage.removeItem("adminToken");
        window.location.assign("/client/pages/admin-login.html");
      }
    });
  });
};

const initProfileMenu = () => {
  const toggle = document.getElementById("topbar-profile-btn");
  const menu   = document.getElementById("topbar-user-menu");
  if (!toggle || !menu) return;

  const close = () => { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true");  toggle.setAttribute("aria-expanded", "false"); };
  const open  = () => { menu.classList.add("open");    menu.setAttribute("aria-hidden", "false"); toggle.setAttribute("aria-expanded", "true"); };

  toggle.addEventListener("click", (e) => { e.stopPropagation(); menu.classList.contains("open") ? close() : open(); });
  document.addEventListener("click", (e) => { if (menu.classList.contains("open") && !menu.contains(e.target) && !toggle.contains(e.target)) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
};

// Init

async function init() {
  const storedAdminUser = getStoredAdminUser();

  // Shell — render queue in loading state immediately
  document.getElementById("sidebar-root").innerHTML = renderAdminSidebar({
    ...adminConfig,
    activePage: "overview",
    totalPending: 0,
    currentRole: storedAdminUser?.isSuperAdmin ? "superadmin" : "moderator",
  });

  document.getElementById("topbar-root").innerHTML = renderAdminTopbar({
    name:  storedAdminUser?.name,
    email: storedAdminUser?.email,
  });

  document.getElementById("overview-root").innerHTML = renderOverviewSkeleton();

  document.getElementById("welcome-root").innerHTML = renderWelcomeSection({
    name: storedAdminUser?.name,
  });

  // Render with loading skeleton — no queue cards data needed
  document.getElementById("queues-content-root").innerHTML =
    renderQueuesAndContent([], draftData, [], true);

  document.getElementById("roles-root").innerHTML = renderRolesSection(rolesData);
  document.getElementById("footer-root").innerHTML = renderFooter();

  initAdminNavbar();
  bindLogout();
  initProfileMenu();

  // Fetch everything in parallel
  const [{ authorized, stats }, submissions] = await Promise.all([
    fetchOverviewStats(),
    fetchAllSubmissions(),
  ]);

  if (!authorized) return;

  // Update overview with real stats
  document.getElementById("overview-root").innerHTML =
    renderOverviewSection(stats || statsData);

  // Update sidebar pending badge
  const totalPending = submissions.filter((s) => s.status === "pending").length;
  document.getElementById("sidebar-root").innerHTML = renderAdminSidebar({
    ...adminConfig,
    activePage: "overview",
    totalPending,
    currentRole: storedAdminUser?.isSuperAdmin ? "superadmin" : "moderator",
  });
  initAdminNavbar(); // re-bind after re-render

  // Re-render queue with real data
  document.getElementById("queues-content-root").innerHTML =
    renderQueuesAndContent([], draftData, submissions, false);
}

init();