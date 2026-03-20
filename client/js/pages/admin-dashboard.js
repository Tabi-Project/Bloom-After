/**
 * admin-dashboard.js
 * Fetches submissions across all content types (stories, clinics,
 * specialists, media, requests) for the unified moderation queue.
 */

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

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  {
    id:    "total-resources-card",
    label: "Total Resources",
    value: formatNumber(resources.total     ?? 0),
    meta:  "Library size",
    muted: true,
  },
  {
    id:    "published-resources-card",
    label: "Published Resources",
    value: formatNumber(resources.published ?? 0),
    meta:  "Live on Bloom After",
    muted: true,
  },
  {
    id:    "draft-resources-card",
    label: "Draft Resources",
    value: formatNumber(resources.drafts    ?? 0),
    meta:  "Needs review",
    muted: true,
  },
  {
    id:    "pending-stories-card",
    label: "Items Pending Review",
    value: formatNumber(stories.pending     ?? 0),
    meta:  "Awaiting moderation",
    muted: true,
  },
];

// ── Data fetching ─────────────────────────────────────────────────────────────

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

/**
 * fetchAllSubmissions
 * Hits all five moderation endpoints in parallel.
 * Tags each item with its `type` so the unified queue can
 * colour-code and route Review buttons correctly.
 * Falls back gracefully — if any individual endpoint 401/403s
 * the whole page redirects to login; other errors are silenced
 * so a missing endpoint doesn't break the whole queue.
 */
const fetchAllSubmissions = async () => {
  // Helper: extract an array from any common API response shape
  const extract = (res) => {
    const d = res?.data;
    if (Array.isArray(d))          return d;
    if (Array.isArray(d?.items))   return d.items;
    if (Array.isArray(d?.data))    return d.data;
    if (Array.isArray(d?.stories)) return d.stories;
    return [];
  };

  // Normalise a raw item into the shape the queue table expects
  const normalise = (item, type) => {
    const id = item._id || item.id;

    // Build a display title that works for every content type
    const title =
      item.title ||
      item.name  ||
      (item.story
        ? item.story.replace(/<[^>]+>/g, " ").trim().slice(0, 80)
        : "") ||
      item.story_text?.slice(0, 80) ||
      "Untitled";

    const submittedBy =
      item.submittedBy ||
      item.submitterName ||
      (item.privacy === "named" && item.name ? item.name : null) ||
      (type === "story" ? "Anonymous" : null);

    return {
      ...item,
      id,
      type,
      title,
      submittedBy,
      submittedAt: item.submittedAt || item.createdAt,
      status:      item.status || "pending",
    };
  };

  try {
    // Fire all five endpoints simultaneously
    const [
      storiesRes,
      clinicsRes,
      specialistsRes,
      mediaRes,
      requestsRes,
    ] = await Promise.allSettled([
      api.get("/api/v1/admin/stories"),
      api.get("/api/v1/admin/clinics"),
      api.get("/api/v1/admin/specialists"),
      api.get("/api/v1/admin/media"),
      api.get("/api/v1/admin/requests"),
    ]);

    // Check for auth failure on any request
    for (const result of [storiesRes, clinicsRes, specialistsRes, mediaRes, requestsRes]) {
      if (result.status === "rejected") {
        const status = result.reason?.status;
        if (status === 401 || status === 403) {
          window.location.assign("/client/pages/admin-login.html");
          return [];
        }
      }
    }

    // Extract and tag each set
    const stories     = storiesRes.status     === "fulfilled" ? extract(storiesRes.value).map((i)     => normalise(i, "story"))      : [];
    const clinics     = clinicsRes.status     === "fulfilled" ? extract(clinicsRes.value).map((i)     => normalise(i, "clinic"))     : [];
    const specialists = specialistsRes.status === "fulfilled" ? extract(specialistsRes.value).map((i) => normalise(i, "specialist")) : [];
    const media       = mediaRes.status       === "fulfilled" ? extract(mediaRes.value).map((i)       => normalise(i, "media"))      : [];
    const requests    = requestsRes.status    === "fulfilled" ? extract(requestsRes.value).map((i)    => normalise(i, "request"))    : [];

    const all = [...stories, ...clinics, ...specialists, ...media, ...requests];

    // Sort newest first
    return all.sort(
      (a, b) =>
        new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
    );

  } catch (err) {
    // Catch-all for unexpected errors — don't break the dashboard
    if (err?.status === 401 || err?.status === 403) {
      window.location.assign("/client/pages/admin-login.html");
    }
    return [];
  }
};

// ── Auth ──────────────────────────────────────────────────────────────────────

const bindLogout = () => {
  document.querySelectorAll("[data-admin-logout]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orig    = btn.textContent;
      btn.disabled  = true;
      btn.textContent = "Logging out...";
      try { await api.post("/api/v1/auth/logout"); } catch (_) {}
      finally {
        btn.textContent = orig;
        btn.disabled    = false;
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

  const close = () => {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.contains("open") ? close() : open();
  });
  document.addEventListener("click", (e) => {
    if (menu.classList.contains("open") && !menu.contains(e.target) && !toggle.contains(e.target)) {
      close();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
};

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  const storedAdminUser = getStoredAdminUser();

  // ── Render shell immediately with skeletons ──────────────────────────────
  document.getElementById("sidebar-root").innerHTML = renderAdminSidebar({
    ...adminConfig,
    activePage:   "overview",
    totalPending: 0,
    currentRole:  storedAdminUser?.isSuperAdmin ? "superadmin" : "moderator",
  });

  document.getElementById("topbar-root").innerHTML = renderAdminTopbar({
    name:  storedAdminUser?.name,
    email: storedAdminUser?.email,
  });

  document.getElementById("overview-root").innerHTML = renderOverviewSkeleton();

  document.getElementById("welcome-root").innerHTML = renderWelcomeSection({
    name: storedAdminUser?.name,
  });

  // Queue renders with loading skeleton while we fetch
  document.getElementById("queues-content-root").innerHTML =
    renderQueuesAndContent([], draftData, [], true);

  document.getElementById("roles-root").innerHTML   = renderRolesSection(rolesData);
  document.getElementById("footer-root").innerHTML  = renderFooter();

  initAdminNavbar();
  bindLogout();
  initProfileMenu();

  // ── Parallel data fetch ───────────────────────────────────────────────────
  const [{ authorized, stats }, submissions] = await Promise.all([
    fetchOverviewStats(),
    fetchAllSubmissions(),
  ]);

  if (!authorized) return;

  // Update overview stats
  document.getElementById("overview-root").innerHTML =
    renderOverviewSection(stats || statsData);

  // Update sidebar pending badge with real total across all types
  const totalPending = submissions.filter((s) => s.status === "pending").length;
  document.getElementById("sidebar-root").innerHTML = renderAdminSidebar({
    ...adminConfig,
    activePage:   "overview",
    totalPending,
    currentRole:  storedAdminUser?.isSuperAdmin ? "superadmin" : "moderator",
  });
  initAdminNavbar(); // re-bind after sidebar re-render

  // Render queue with real data
  document.getElementById("queues-content-root").innerHTML =
    renderQueuesAndContent([], draftData, submissions, false);
}

init();