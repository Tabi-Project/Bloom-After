/**
 * admin-dashboard.js
 * - Overview cards reflect real published/draft/archived/pending counts
 * - Draft card only renders if a real draft with a title exists (fetched from API)
 * - "Continue editing" carries the draft title into the editor via URL param
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

const fmt = (v) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v ?? 0);

// ── Overview stats ────────────────────────────────────────────────────────────
//
// Builds the four stat cards from whatever the /admin/stats endpoint returns.
// Expected shape: { resources: { total, published, drafts }, submissions: { pending } }
// Falls back to zeros if keys are missing.

function buildOverviewStats(data = {}) {
  const resources   = data.resources   || {};
  const submissions = data.submissions || data.moderation || {};

  return [
    {
      id:    "total-resources-card",
      label: "Total Resources",
      value: fmt((resources.total ?? 0)),
      meta:  "All content across every type",
      muted: true,
    },
    {
      id:    "published-resources-card",
      label: "Published",
      value: fmt(resources.published ?? 0),
      meta:  "Live on Bloom After",
      muted: true,
    },
    {
      id:    "draft-resources-card",
      label: "Drafts",
      value: fmt(resources.drafts ?? 0),
      meta:  "Unpublished — in progress",
      muted: true,
    },
    {
      id:    "pending-stories-card",
      label: "Pending Moderation",
      value: fmt(submissions.pending ?? 0),
      meta:  "Submissions awaiting review",
      muted: true,
    },
  ];
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchOverviewStats() {
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
}

/**
 * fetchLatestDraft
 * Fetches the most recently updated draft content item.
 * Returns null if there are none or if the endpoint is not yet live.
 * Only returns an item that has at least a non-empty title.
 */
async function fetchLatestDraft() {
  try {
    const res = await api.get("/api/v1/admin/content?status=draft&sort=updatedAt&limit=1");
    const items =
      res?.data?.items ||
      res?.data?.data  ||
      (Array.isArray(res?.data) ? res.data : []);

    const draft = items[0] || null;
    // Only surface a draft that has at minimum a title
    if (draft && draft.title && draft.title.trim()) return draft;
    return null;
  } catch (_) {
    // Endpoint not live yet — return null so the card simply doesn't show
    return null;
  }
}

/**
 * fetchAllSubmissions
 * Hits all five moderation endpoints simultaneously.
 */
async function fetchAllSubmissions() {
  const extract = (res) => {
    const d = res?.data;
    if (Array.isArray(d))          return d;
    if (Array.isArray(d?.items))   return d.items;
    if (Array.isArray(d?.data))    return d.data;
    if (Array.isArray(d?.stories)) return d.stories;
    return [];
  };

  const normalise = (item, type) => {
    const id = item._id || item.id;
    const title =
      item.title ||
      item.name  ||
      (item.story ? item.story.replace(/<[^>]+>/g, " ").trim().slice(0, 80) : "") ||
      item.story_text?.slice(0, 80) ||
      "Untitled";
    const submittedBy =
      item.submittedBy ||
      item.submitterName ||
      (item.privacy === "named" && item.name ? item.name : null) ||
      (type === "story" ? "Anonymous" : null);
    return {
      ...item, id, type, title, submittedBy,
      submittedAt: item.submittedAt || item.createdAt,
      status:      item.status || "pending",
    };
  };

  try {
    const [storiesRes, clinicsRes, specialistsRes, mediaRes, requestsRes] =
      await Promise.allSettled([
        api.get("/api/v1/admin/stories"),
        api.get("/api/v1/admin/clinics"),
        api.get("/api/v1/admin/specialists"),
        api.get("/api/v1/admin/media"),
        api.get("/api/v1/admin/requests"),
      ]);

    // Auth failure on any request → redirect
    for (const r of [storiesRes, clinicsRes, specialistsRes, mediaRes, requestsRes]) {
      if (r.status === "rejected" && (r.reason?.status === 401 || r.reason?.status === 403)) {
        window.location.assign("/client/pages/admin-login.html");
        return [];
      }
    }

    const tag = (res, type) =>
      res.status === "fulfilled" ? extract(res.value).map((i) => normalise(i, type)) : [];

    return [
      ...tag(storiesRes,     "story"),
      ...tag(clinicsRes,     "clinic"),
      ...tag(specialistsRes, "specialist"),
      ...tag(mediaRes,       "media"),
      ...tag(requestsRes,    "request"),
    ].sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

  } catch (err) {
    if (err?.status === 401 || err?.status === 403) {
      window.location.assign("/client/pages/admin-login.html");
    }
    return [];
  }
}

// ── Draft card binding ────────────────────────────────────────────────────────
//
// "Send to review" PATCHes the right endpoint then replaces the card.
// Only called after renderQueuesAndContent has injected the card into the DOM.

function bindDraftCard() {
  const btn = document.getElementById("send-review-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const draftId   = btn.dataset.draftId;
    const draftType = btn.dataset.draftType || "resource";

    if (!draftId) {
      window.location.assign(`content-editor.html?type=${encodeURIComponent(draftType)}`);
      return;
    }

    const orig      = btn.textContent;
    btn.disabled    = true;
    btn.textContent = "Sending…";

    const endpointMap = {
      resource:     `/api/v1/admin/resources/${draftId}`,
      ngo:          `/api/v1/admin/ngos/${draftId}`,
      clinic:       `/api/v1/admin/clinics/${draftId}`,
      specialist:   `/api/v1/admin/specialists/${draftId}`,
      intervention: `/api/v1/admin/interventions/${draftId}`,
    };

    const showSentState = () => {
      const card = document.getElementById("draft-editor-card");
      if (card) {
        card.innerHTML = `
          <div class="editor-top">
            <h3 class="editor-title">Sent for review</h3>
            <div class="status-chip">In review</div>
          </div>
          <div class="editor-field soft">
            Your draft has been sent to the review queue.
            <a href="content-management.html"
               style="color:var(--color-primary);font-weight:600;margin-left:4px;">
              View in Content Management →
            </a>
          </div>
        `;
      }
    };

    try {
      await api.patch(endpointMap[draftType] || endpointMap.resource, { status: "review" });
      showSentState();
    } catch (_) {
      const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      if (isLocal) {
        showSentState();
      } else {
        btn.disabled    = false;
        btn.textContent = orig;
      }
    }
  });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

const bindLogout = () => {
  document.querySelectorAll("[data-admin-logout]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orig      = btn.textContent;
      btn.disabled    = true;
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

  const close = () => { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true");  toggle.setAttribute("aria-expanded", "false"); };
  const open  = () => { menu.classList.add("open");    menu.setAttribute("aria-hidden", "false"); toggle.setAttribute("aria-expanded", "true"); };

  toggle.addEventListener("click", (e) => { e.stopPropagation(); menu.classList.contains("open") ? close() : open(); });
  document.addEventListener("click", (e) => {
    if (menu.classList.contains("open") && !menu.contains(e.target) && !toggle.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
};

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  const storedAdminUser = getStoredAdminUser();

  // ── Shell with skeletons ─────────────────────────────────────────────────
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

  document.getElementById("overview-root").innerHTML    = renderOverviewSkeleton();
  document.getElementById("welcome-root").innerHTML     = renderWelcomeSection({ name: storedAdminUser?.name });
  document.getElementById("queues-content-root").innerHTML = renderQueuesAndContent([], null, [], true);
  document.getElementById("roles-root").innerHTML       = renderRolesSection(rolesData);
  document.getElementById("footer-root").innerHTML      = renderFooter();

  initAdminNavbar();
  bindLogout();
  initProfileMenu();

  // ── Parallel fetch — stats + submissions + latest draft ─────────────────
  const [{ authorized, stats }, submissions, latestDraft] = await Promise.all([
    fetchOverviewStats(),
    fetchAllSubmissions(),
    fetchLatestDraft(),
  ]);

  if (!authorized) return;

  // Real overview cards
  document.getElementById("overview-root").innerHTML =
    renderOverviewSection(stats || statsData);

  // Real pending badge on sidebar
  const totalPending = submissions.filter((s) => s.status === "pending").length;
  document.getElementById("sidebar-root").innerHTML = renderAdminSidebar({
    ...adminConfig,
    activePage:   "overview",
    totalPending,
    currentRole:  storedAdminUser?.isSuperAdmin ? "superadmin" : "moderator",
  });
  initAdminNavbar();

  // Queue + content section — pass latestDraft (may be null — card hidden if so)
  document.getElementById("queues-content-root").innerHTML =
    renderQueuesAndContent([], latestDraft, submissions, false);

  // Wire draft card buttons (only present if latestDraft exists)
  bindDraftCard();
}

init();