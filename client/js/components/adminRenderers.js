import { icons } from "./icons.js";

/* Overview */
function renderStatCard({ id, label, value, meta, muted = false }) {
  const metaHtml = meta
    ? muted
      ? `<div class="stat-meta muted">${meta}</div>`
      : `<div class="stat-meta">${icons.trendingUp} ${meta}</div>`
    : "";

  return `
    <div class="stat-card" id="${id}">
      <div class="stat-label">${label}</div>
      <div class="stat-value${value.length > 10 ? " long" : ""}">${value}</div>
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
    (_, index) => `
      <div class="stat-card skeleton" aria-hidden="true" data-skeleton-index="${index}">
        <div class="skeleton-line skeleton-label"></div>
        <div class="skeleton-line skeleton-value"></div>
        <div class="skeleton-line skeleton-meta"></div>
      </div>
    `,
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
  const safeName = String(name || "Admin")
    .replace(/[&<>"']/g, (char) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return map[char] || char;
    })
    .trim() || "Admin";
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

/* Moderation Queues + Content Management (side by side on desktop) */
function renderQueueCard({ id, title, subtitle, count }) {
  const badgeClass = count > 0 ? "count-warning" : "count-safe";
  const queueIconMap = {
    "clinic-queue": icons.queueClinic,
    "specialist-queue": icons.queueSpecialist,
    "stories-queue": icons.queueStories,
    "podcast-queue": icons.queuePodcast,
  };
  const icon = queueIconMap[id] || icons.queueClinic;
  return `
    <div class="queue-card" id="${id}">
      <div class="queue-left">
        <div class="queue-icon-box">${icon}</div>
        <div class="queue-copy">
          <p class="queue-title">${title}</p>
          <div class="queue-subtitle">${subtitle}</div>
        </div>
      </div>
      <div class="count-badge ${badgeClass}">${count}</div>
    </div>
  `;
}

function renderActionRow(icon, label, id) {
  return `
    <a href="#" class="action-row" id="${id}">
      <span class="action-row-icon">${icon}</span>
      <span class="action-row-label">${label}</span>
      <span class="action-row-chevron">${icons.chevronRight}</span>
    </a>
  `;
}

export function renderQueuesAndContent(queues = [], draft = {}) {
  const { title = "", description = "" } = draft;
  return `
    <div class="queues-content-grid">

      <!-- Moderation Queues -->
      <section id="queues-section">
        <div class="dashboard-section-header">
          <span class="section-icon">${icons.sectionQueues}</span>
          <h2 class="dashboard-section-title">Moderation Queues</h2>
        </div>
        <div class="queue-list">
          ${queues.map(renderQueueCard).join("")}
        </div>
      </section>

      <!-- Content Management -->
      <section id="content-section">
        <div class="dashboard-section-header">
          <span class="section-icon">${icons.sectionContent}</span>
          <h2 class="dashboard-section-title">Content Management</h2>
        </div>
        <div class="action-stack">
          ${renderActionRow(icons.contentCreate, "Create Resource Article", "create-resource-action")}
          ${renderActionRow(icons.contentDirectory, "Manage Directory Entries", "update-directory-action")}
          ${renderActionRow(icons.contentFeatured, "Update Featured Content", "featured-content-action")}

          ${
            title
              ? `
          <div class="editor-card" id="draft-editor-card">
            <div class="editor-top">
              <h3 class="editor-title">Edit Before Publishing</h3>
              <div class="status-chip">Draft open</div>
            </div>
            <div class="editor-field">${title}</div>
            <div class="editor-field soft">${description}</div>
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

/* Role Access */
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
