import { adminIcons, queueIcons, contentIcons } from '../data/admin.js';

/* Overview */
function renderStatCard({ id, label, value, meta, muted = false }) {
  const metaHtml = meta
    ? muted
      ? `<div class="stat-meta muted">${meta}</div>`
      : `<div class="stat-meta">${adminIcons.trendingUp} ${meta}</div>`
    : '';

  return `
    <div class="stat-card" id="${id}">
      <div class="stat-label">${label}</div>
      <div class="stat-value${value.length > 10 ? ' long' : ''}">${value}</div>
      ${metaHtml}
    </div>
  `;
}

export function renderOverviewSection(stats = []) {
  return `
    <section id="overview-section">
      <div class="dashboard-section-header">
        <span class="section-icon">${adminIcons.overview}</span>
        <h2 class="dashboard-section-title">Overview</h2>
      </div>
      <div class="stats-grid">
        ${stats.map(renderStatCard).join('')}
      </div>
    </section>
  `;
}

/* ── Moderation Queues + Content Management (side by side on desktop) ── */
function renderQueueCard({ id, title, subtitle, count }) {
  const badgeClass = count > 0 ? 'count-warning' : 'count-safe';
  const icon = queueIcons[id] || queueIcons['clinic-queue'];
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
      <span class="action-row-chevron">${adminIcons.chevronRight}</span>
    </a>
  `;
}

export function renderQueuesAndContent(queues = [], draft = {}) {
  const { title = '', description = '' } = draft;
  return `
    <div class="queues-content-grid">

      <!-- Moderation Queues -->
      <section id="queues-section">
        <div class="dashboard-section-header">
          <span class="section-icon">${adminIcons.queues}</span>
          <h2 class="dashboard-section-title">Moderation Queues</h2>
        </div>
        <div class="queue-list">
          ${queues.map(renderQueueCard).join('')}
        </div>
      </section>

      <!-- Content Management -->
      <section id="content-section">
        <div class="dashboard-section-header">
          <span class="section-icon">${adminIcons.content}</span>
          <h2 class="dashboard-section-title">Content Management</h2>
        </div>
        <div class="action-stack">
          ${renderActionRow(contentIcons.create,    'Create Resource Article',   'create-resource-action')}
          ${renderActionRow(contentIcons.directory, 'Manage Directory Entries',  'update-directory-action')}
          ${renderActionRow(contentIcons.featured,  'Update Featured Content',   'featured-content-action')}

          ${title ? `
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
          ` : ''}
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
        <span class="section-icon">${adminIcons.roles}</span>
        <h2 class="dashboard-section-title">User Access</h2>
      </div>
      <div class="role-grid">
        ${roles.map(renderRoleCard).join('')}
      </div>
    </section>
  `;
}