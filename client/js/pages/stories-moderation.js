/**
 * stories-moderation.js
 * Admin page: list all story submissions with status filtering,
 * search, pagination and quick-action buttons.
 */

import {
  renderAdminSidebar,
  renderAdminTopbar,
  initAdminNavbar,
} from "../components/adminNavbar.js";
import { renderFooter } from "../components/footer.js";
import api from "../api.js";

// constants

const PAGE_SIZE = 15;
const ADMIN_USER_KEY = "adminUser";

// ── State 

let allStories = [];
let filtered   = [];
let currentStatus = "";
let currentQuery  = "";
let currentPage   = 1;

// ── DOM refs (set after render) 

const getEl = (id) => document.getElementById(id);

// ── Boot 

async function init() {
  const stored = (() => {
    try { return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY)) || {}; }
    catch { return {}; }
  })();

  // Render shell
  getEl("sidebar-root").innerHTML = renderAdminSidebar({
    activePage: "moderation-stories",
    totalPending: 0,
    currentRole: stored.isSuperAdmin ? "superadmin" : "moderator",
  });
  getEl("topbar-root").innerHTML = renderAdminTopbar({
    name: stored.name,
    email: stored.email,
  });
  getEl("footer-root").innerHTML = renderFooter();

  initAdminNavbar();
  bindLogout();

  // Load stories
  renderListSkeleton();
  allStories = await fetchStories();
  if (!allStories) return;
  applyFilters();
  bindControls();
}

// ── Data 

async function fetchStories() {
  try {
    const res = await api.get("/api/v1/admin/stories");
    if (res?.data?.stories) {
      return res.data.stories;
    }
    if (Array.isArray(res?.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    console.error('[StoryModeration][List] fetch failed', {
      message: err?.message,
      status: err?.status,
      data: err?.data,
    });
    if (err?.status === 401 || err?.status === 403) {
      window.location.assign("/admin/login");
      return null;
    }
    return [];
  }
}

// ── Filtering & pagination 

function applyFilters() {
  const q = currentQuery.toLowerCase().trim();
  filtered = allStories.filter((s) => {
    const textSource = String(s.story_text || s.story || "")
      .replace(/<[^>]+>/g, " ")
      .toLowerCase();
    const matchStatus = !currentStatus || s.status === currentStatus;
    const matchQuery  = !q || [
      s.name || "", s.location || "", textSource,
    ].some((f) => f.toLowerCase().includes(q));
    return matchStatus && matchQuery;
  });

  // Sort: newest first
  filtered.sort((a, b) => new Date(b.createdAt || b.submittedAt || 0) - new Date(a.createdAt || a.submittedAt || 0));

  currentPage = 1;
  renderList();
  renderStats();
  renderPagination();
}

// ── Rendering ──────────────────────────────────────────────────────────────────

function renderStats() {
  const counts = { pending: 0, approved: 0, rejected: 0 };
  allStories.forEach((s) => { if (counts[s.status] !== undefined) counts[s.status]++; });

  getEl("mod-header-stats").innerHTML = `
    <span class="mod-stat-pill mod-stat-pending">${counts.pending} pending</span>
    <span class="mod-stat-pill mod-stat-approved">${counts.approved} approved</span>
    <span class="mod-stat-pill mod-stat-rejected">${counts.rejected} rejected</span>
  `;
}

function renderList() {
  const list    = getEl("stories-list");
  const empty   = getEl("stories-empty");
  const start   = (currentPage - 1) * PAGE_SIZE;
  const page    = filtered.slice(start, start + PAGE_SIZE);

  if (!page.length) {
    list.innerHTML = "";
    empty.hidden = false;
    empty.textContent = currentQuery || currentStatus
      ? "No stories match your search or filter."
      : "No stories submitted yet.";
    return;
  }

  empty.hidden = true;
  list.innerHTML = page.map(renderStoryRow).join("");
}

function renderStoryRow(story) {
  const id       = story._id || story.id;
  const name     = story.privacy === "named" && story.name ? story.name : "Anonymous";
  const plain = String(story.story_text || story.story || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const excerpt  = plain.slice(0, 120).trim() + (plain.length > 120 ? "…" : "");
  const location = story.location ? `<span class="mod-row-location">${escHtml(story.location)}</span>` : "";
  const dateValue = story.createdAt || story.submittedAt;
  const date     = dateValue
    ? new Date(dateValue).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const tags     = (story.what_helped || [])
    .slice(0, 2)
    .map((t) => `<span class="mod-row-tag">${escHtml(t)}</span>`)
    .join("");
  const imgHtml  = story.image_url
    ? `<img src="${escHtml(story.image_url)}" alt="" class="mod-row-thumb" loading="lazy" />`
    : `<div class="mod-row-thumb mod-row-thumb-placeholder" aria-hidden="true"></div>`;

  return `
    <article class="mod-story-row" data-id="${escHtml(id)}" data-status="${escHtml(story.status)}">
      ${imgHtml}
      <div class="mod-row-body">
        <div class="mod-row-top">
          <div class="mod-row-meta">
            <span class="mod-row-name">${escHtml(name)}</span>
            ${location}
            ${date ? `<span class="mod-row-date">${date}</span>` : ""}
          </div>
          <span class="mod-status-badge mod-status-${escHtml(story.status)}">${escHtml(story.status)}</span>
        </div>
        ${tags ? `<div class="mod-row-tags">${tags}</div>` : ""}
        <p class="mod-row-excerpt">${escHtml(excerpt)}</p>
      </div>
      <div class="mod-row-actions">
        <a href="/admin/story/edit?id=${escHtml(id)}" class="mod-action-btn mod-action-review" aria-label="Review story by ${escHtml(name)}">
          Review
        </a>
        ${story.status === "pending" ? `
          <button class="mod-action-btn mod-action-approve" data-action="approve" data-id="${escHtml(id)}" aria-label="Quick approve story by ${escHtml(name)}">
            Approve
          </button>
          <button class="mod-action-btn mod-action-reject" data-action="reject" data-id="${escHtml(id)}" aria-label="Quick reject story by ${escHtml(name)}">
            Reject
          </button>
        ` : ""}
      </div>
    </article>
  `;
}

function renderListSkeleton() {
  getEl("stories-list").innerHTML = Array.from({ length: 6 }).map(() => `
    <div class="mod-story-row mod-row-skeleton" aria-hidden="true">
      <div class="mod-row-thumb skeleton-block"></div>
      <div class="mod-row-body">
        <div class="skeleton-line" style="width:40%;margin-bottom:8px"></div>
        <div class="skeleton-line" style="width:80%"></div>
        <div class="skeleton-line" style="width:65%"></div>
      </div>
    </div>
  `).join("");
}

function renderPagination() {
  const wrap      = getEl("mod-pagination");
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (totalPages <= 1) { wrap.innerHTML = ""; return; }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  wrap.innerHTML = `
    <nav class="pagination" aria-label="Story list pagination">
      <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""} aria-label="Previous page">
        ← Prev
      </button>
      <div class="pagination-pages">
        ${pages.map((p) => `
          <button class="pagination-page ${p === currentPage ? "pagination-page-active" : ""}" data-page="${p}" aria-label="Page ${p}" ${p === currentPage ? 'aria-current="page"' : ""}>
            ${p}
          </button>
        `).join("")}
      </div>
      <button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""} aria-label="Next page">
        Next →
      </button>
    </nav>
  `;
}

// event bindings

function bindControls() {
  // Status tabs
  document.querySelectorAll(".mod-filter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mod-filter-tab").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      currentStatus = btn.dataset.status;
      applyFilters();
    });
  });

  // Search
  let searchTimer;
  getEl("mod-search").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentQuery = e.target.value;
      applyFilters();
    }, 250);
  });

  // List delegation — quick approve / reject + pagination
  getEl("stories-list").addEventListener("click", handleListClick);
  getEl("mod-pagination").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");
    if (!btn || btn.disabled) return;
    currentPage = parseInt(btn.dataset.page, 10);
    renderList();
    renderPagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

async function handleListClick(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const { action, id } = btn.dataset;
  if (!action || !id) return;

  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = "…";

  try {
    const nextStatus = action === "approve" ? "approved" : "rejected";
    await api.patch(`/api/v1/admin/stories/${id}`, { status: nextStatus });
    // Update local state
    const story = allStories.find((s) => (s._id || s.id) === id);
    if (story) story.status = nextStatus;
    applyFilters();
  } catch (err) {
    console.error('[StoryModeration][List] quick action failed', {
      id,
      action,
      message: err?.message,
      status: err?.status,
      data: err?.data,
    });
    if (err?.status === 401 || err?.status === 403) {
      window.location.assign("/admin/login");
      return;
    }
    btn.disabled = false;
    btn.textContent = original;
  }
}

function bindLogout() {
  document.querySelectorAll("[data-admin-logout]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try { await api.post("/api/v1/auth/logout"); } catch (_) {}
      sessionStorage.removeItem(ADMIN_USER_KEY);
      sessionStorage.removeItem("adminToken");
      window.location.assign("/admin/login");
    });
  });
}

// utilities

function escHtml(v = "") {
  return String(v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

init();