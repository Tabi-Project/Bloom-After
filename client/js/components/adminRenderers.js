import { icons } from "./icons.js";

// Helpers 

const escHtml = (v = "") =>
  String(v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Content type config 
// reviewBase  → full list page  (footer jump links)
// editPage    → individual review page (row Review buttons)

const TYPE_CONFIG = {
  story:      { label: "Story",      reviewBase: "stories-moderation.html",       editPage: "story-edit.html",      badgeClass: "mod-type-story"      },
  ngo:        { label: "NGO",        reviewBase: "ngos-moderation.html",          editPage: "ngo-edit.html", badgeClass: "mod-type-ngo"        },
  suggestion: { label: "Suggestion", reviewBase: "suggestions-moderation.html",   editPage: "suggestions-moderation.html", badgeClass: "mod-type-suggestion" },
  clinic:     { label: "Clinic",     reviewBase: "moderation-list.html?type=clinic", editPage: "clinic-edit.html",     badgeClass: "mod-type-clinic"     },
  specialist: { label: "Specialist", reviewBase: "moderation-list.html?type=specialist", editPage: "specialist-edit.html", badgeClass: "mod-type-specialist" },
  media:      { label: "Media",      reviewBase: "moderation-list.html?type=media", editPage: "media-edit.html",      badgeClass: "mod-type-media"      },
  request:    { label: "Request",    reviewBase: "moderation-list.html?type=request", editPage: "moderation-list.html?type=request", badgeClass: "mod-type-request"    },
};

function getTypeConfig(type = "") {
  return TYPE_CONFIG[type.toLowerCase()] || TYPE_CONFIG.request;
}

// Overview

function renderStatCard({ id, label, value, meta, muted = false }) {
  const metaHtml = meta
    ? muted
      ? `<div class="stat-meta muted">${meta}</div>`
      : `<div class="stat-meta">${icons.trendingUp} ${meta}</div>`
    : "";

  return `
    <div class="stat-card" id="${id}">
      <div class="stat-label">${label}</div>
      <div class="stat-value${String(value).length > 10 ? " long" : ""}">${value}</div>
      ${metaHtml}
    </div>
  `;
}

export function renderOverviewSection(stats = []) {
  return `
    <section id="overview-section">
      <div class="dashboard-section-header">
        <span class="section-icon">${icons.sectionOverview}</span>
        <h2 class="dashboard-section-title">Overview</h2>
      </div>
      <div class="stats-grid">
        ${stats.map(renderStatCard).join("")}
      </div>
    </section>
  `;
}

export function renderOverviewSkeleton(count = 4) {
  const cards = Array.from({ length: count }).map(
    (_, i) => `
      <div class="stat-card skeleton" aria-hidden="true" data-skeleton-index="${i}">
        <div class="skeleton-line skeleton-label"></div>
        <div class="skeleton-line skeleton-value"></div>
        <div class="skeleton-line skeleton-meta"></div>
      </div>
    `
  );

  return `
    <section id="overview-section" aria-busy="true">
      <div class="dashboard-section-header">
        <span class="section-icon">${icons.sectionOverview}</span>
        <h2 class="dashboard-section-title">Overview</h2>
      </div>
      <div class="stats-grid">
        ${cards.join("")}
      </div>
    </section>
  `;
}

export function renderWelcomeSection({ name = "Admin" } = {}) {
  const safeName = escHtml(String(name || "Admin").trim() || "Admin");
  return `
    <section id="welcome-section">
      <div class="welcome-card">
        <div class="welcome-text">
          <p class="welcome-eyebrow">Admin Dashboard</p>
          <h3 class="welcome-title">Welcome, ${safeName}</h3>
          <p class="welcome-subtitle">Manage content, reviews, and approvals from one place.</p>
        </div>
      </div>
    </section>
  `;
}

// Unified Moderation Queue
// 4 columns: Type · Title + date stacked · Status · Action

function renderModerationQueueRows(submissions) {
  if (!submissions.length) {
    return `
      <tr>
        <td colspan="4" class="stories-table-empty">
          No pending submissions. You're all caught up 🌿
        </td>
      </tr>
    `;
  }

  return submissions
    .slice(0, 8)
    .map((item) => {
      const id     = item._id || item.id;
      const cfg    = getTypeConfig(item.type);
      const title  =
        item.title ||
        (item.story
          ? item.story.slice(0, 55) + (item.story.length > 55 ? "…" : "")
          : "") ||
        item.name ||
        "Untitled";
      const date   = fmtDate(item.submittedAt || item.createdAt);
      const status = item.status || "pending";

      // Row Review button always goes to the type-specific edit page
      const reviewBase = cfg.editPage || cfg.reviewBase || "moderation-list.html";
      const reviewUrl = `${reviewBase}${reviewBase.includes("?") ? "&" : "?"}id=${escHtml(id)}`;

      return `
        <tr class="stories-table-row">
          <td class="stories-td">
            <span class="mod-type-badge ${cfg.badgeClass}">${cfg.label}</span>
          </td>
          <td class="stories-td stories-td-title">
            <span class="mod-queue-title">${escHtml(title)}</span>
            ${date ? `<span class="mod-queue-date">${date}</span>` : ""}
          </td>
          <td class="stories-td">
            <span class="mod-status-badge mod-status-${escHtml(status)}">${escHtml(status)}</span>
          </td>
          <td class="stories-td stories-td-action">
            <a href="${reviewUrl}" class="stories-review-btn">Review</a>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderModerationQueueSkeleton() {
  return Array.from({ length: 5 })
    .map(
      () => `
      <tr class="stories-table-row" aria-hidden="true">
        <td class="stories-td"><div class="skeleton-line" style="width:56px;border-radius:999px"></div></td>
        <td class="stories-td">
          <div class="skeleton-line" style="width:160px;margin-bottom:5px"></div>
          <div class="skeleton-line" style="width:72px"></div>
        </td>
        <td class="stories-td"><div class="skeleton-line" style="width:60px;border-radius:999px"></div></td>
        <td class="stories-td"></td>
      </tr>
    `
    )
    .join("");
}

export function renderModerationQueue(
  submissions = [],
  totalPending = 0,
  loading = false
) {
  const rowsHtml = loading
    ? renderModerationQueueSkeleton()
    : renderModerationQueueRows(submissions.slice(0, 4));

  const badgeHtml =
    totalPending > 0
      ? `<span class="dash-stories-badge">${totalPending} pending</span>`
      : "";

  // Footer jump links — use reviewBase (list pages)
  const typeLinks = Object.entries(TYPE_CONFIG)
  .filter(([, cfg]) => Boolean(cfg.reviewBase))
  .map(([, cfg]) => {
    const plural = cfg.label === "Story" ? "Stories" : `${cfg.label}s`;
    return `<a href="${cfg.reviewBase}" class="mod-queue-type-link">${plural}</a>`;
  })
  .join("");

  return `
    <div class="dash-stories-widget" id="moderation-queue-widget">
      <div class="dash-stories-widget-header">
        <h3 class="dash-stories-widget-title">
          Moderation Queue
          ${badgeHtml}
        </h3>
        <a href="stories-moderation.html" class="dash-stories-view-all">View All →</a>
      </div>

      <div class="stories-table-wrap">
        <table class="stories-table" aria-label="Recent moderation submissions">
          <thead>
            <tr class="stories-thead-row">
              <th class="stories-th">Type</th>
              <th class="stories-th">Title / Excerpt</th>
              <th class="stories-th">Status</th>
              <th class="stories-th stories-th-right">Action</th>
            </tr>
          </thead>
          <tbody aria-live="polite">
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div class="mod-queue-footer">
        <span class="mod-queue-footer-label">Jump to:</span>
        ${typeLinks}
      </div>
    </div>
  `;
}

// Content Management + Queue combined render

function renderActionRow(icon, label, id) {
  return `
    <a href="#" class="action-row" id="${id}">
      <span class="action-row-icon">${icon}</span>
      <span class="action-row-label">${label}</span>
      <span class="action-row-chevron">${icons.chevronRight}</span>
    </a>
  `;
}

export function renderQueuesAndContent(
  _queues = [],
  draft = {},
  submissions = [],
  queueLoading = false
) {
  const { title = "", description = "" } = draft;
  const totalPending = submissions.filter((s) => s.status === "pending").length;

  return `
    <div class="queues-content-grid">

      <!-- Left: unified moderation queue -->
      <div class="queues-left-col" id="queues-section">
        ${renderModerationQueue(submissions, totalPending, queueLoading)}
      </div>

      <!-- Right: content management -->
      <section id="content-section">
        <div class="dashboard-section-header">
          <span class="section-icon">${icons.sectionContent}</span>
          <h2 class="dashboard-section-title">Content Management</h2>
        </div>
        <div class="action-stack">
          ${renderActionRow(icons.contentCreate,    "Create Resource Article",    "create-resource-action"  )}
          ${renderActionRow(icons.contentDirectory, "Manage Directory Entries",   "update-directory-action" )}
          ${renderActionRow(icons.contentFeatured,  "Update Featured Content",    "featured-content-action" )}

          ${
            title
              ? `
            <div class="editor-card" id="draft-editor-card">
              <div class="editor-top">
                <h3 class="editor-title">Edit Before Publishing</h3>
                <div class="status-chip">Draft open</div>
              </div>
              <div class="editor-field">${escHtml(title)}</div>
              <div class="editor-field soft">${escHtml(description)}</div>
              <div class="editor-actions">
                <button class="mini-btn primary" id="continue-editing-btn">Continue editing</button>
                <button class="mini-btn secondary" id="send-review-btn">Send to review</button>
              </div>
            </div>
          `
              : ""
          }
        </div>
      </section>

    </div>
  `;
}

// Role Access

function renderRoleCard({ id, name, desc }) {
  return `
    <div class="role-card" id="${id}">
      <div class="role-name">${name}</div>
      <div class="role-desc">${desc}</div>
    </div>
  `;
}

export function renderRolesSection(roles = []) {
  return `
    <section id="roles-section">
      <div class="dashboard-section-header">
        <span class="section-icon">${icons.sectionRoles}</span>
        <h2 class="dashboard-section-title">User Access</h2>
      </div>
      <div class="role-grid">
        ${roles.map(renderRoleCard).join("")}
      </div>
    </section>
  `;
}