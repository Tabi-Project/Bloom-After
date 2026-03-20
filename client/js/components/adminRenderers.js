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

const fmtLastActive = (value) => {
  if (!value) return 'Pending';
  if (typeof value === 'string' && Number.isNaN(Date.parse(value))) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Pending';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return fmtDate(date);
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

function roleClass(role = "") {
  const normalized = String(role).toLowerCase();
  if (normalized.includes("super")) return "settings-role-super";
  if (normalized.includes("moderator")) return "settings-role-moderator";
  return "settings-role-editor";
}

function renderMemberRow(member) {
  const pending = String(member.status || '').toLowerCase() === 'pending';
  return `
    <li class="settings-member-row">
      <div class="settings-member-left">
        <span class="settings-member-avatar">${escHtml(member.initials || "AD")}</span>
        <div class="settings-member-meta">
          <span class="settings-member-name">${escHtml(member.name || "Admin User")}</span>
          <span class="settings-member-email">${escHtml(member.email || "")}</span>
        </div>
      </div>
      <div class="settings-member-right">
        <span class="settings-role-pill ${roleClass(member.role)}">${escHtml(member.role || "Content Editor")}</span>
        <span class="settings-member-last-active">${escHtml(fmtLastActive(member.lastActive))}</span>
        ${pending ? `<button type="button" class="settings-resend-btn" data-resend-invite-id="${escHtml(member.id || '')}">Resend Email</button>` : ''}
      </div>
    </li>
  `;
}

function renderCapabilityRow(capability) {
  const cell = (allowed) =>
    allowed
      ? `<span class="settings-perm-check" aria-label="Allowed">${icons.trustCheck}</span>`
      : `<span class="settings-perm-dash" aria-label="Not allowed">—</span>`;

  return `
    <tr>
      <td class="settings-perm-capability">${escHtml(capability.capability || "")}</td>
      <td>${cell(Boolean(capability.superAdmin))}</td>
      <td>${cell(Boolean(capability.contentEditor))}</td>
      <td>${cell(Boolean(capability.moderator))}</td>
    </tr>
  `;
}

function renderSwitchRow(id, label, hint, checked = false) {
  return `
    <label class="settings-switch-row" for="${id}">
      <span class="settings-switch-copy">
        <span class="settings-switch-label">${escHtml(label)}</span>
        <span class="settings-switch-hint">${escHtml(hint)}</span>
      </span>
      <span class="settings-switch-control">
        <input type="checkbox" id="${id}" ${checked ? "checked" : ""} />
        <span class="settings-switch-slider" aria-hidden="true"></span>
      </span>
    </label>
  `;
}

export function renderSettingsSection(settings = {}) {
  const members = Array.isArray(settings.members) ? settings.members : [];
  const activeMembers = members.filter((member) => member.status === "active");
  const pendingMembers = members.filter((member) => member.status === "pending");
  const inviteRoles = Array.isArray(settings.inviteRoles) ? settings.inviteRoles : [];
  const capabilities = Array.isArray(settings.capabilities) ? settings.capabilities : [];
  const appIdentity = settings.appIdentity || {};
  const securityProtocol = settings.securityProtocol || {};

  return `
    <section id="settings-section" class="settings-section">
      <div class="dashboard-section-header">
        <span class="section-icon">${icons.adminSettings}</span>
        <h2 class="dashboard-section-title">Settings</h2>
      </div>

      <div class="settings-block">
        <h3 class="settings-block-title">Team &amp; Admins</h3>
        <p class="settings-block-subtitle">Manage your organization's members, invite new contributors, and control access levels.</p>

        <div class="settings-notice" role="status" aria-live="polite">
          <span class="settings-notice-icon">${icons.trustCheck}</span>
          <div>
            <div class="settings-notice-title">Security Protocol: Temporary Passwords</div>
            <div class="settings-notice-copy">Invited members will receive a secure temporary password via email valid for 24 hours.</div>
          </div>
        </div>

        <div class="settings-team-grid">
          <div class="settings-card settings-invite-card">
            <h4 class="settings-card-title">Invite Member</h4>
            <form id="settings-invite-form" class="settings-invite-form" novalidate>
            <label class="settings-field-wrap">
              <span class="settings-field-label">Email Address</span>
              <input id="settings-invite-email" name="email" type="email" class="settings-input" placeholder="colleague@ppd-targets.com" required />
            </label>
            <label class="settings-field-wrap">
              <span class="settings-field-label">Assigned Role</span>
              <select id="settings-invite-role" name="role" class="settings-select" required>
                ${inviteRoles
                  .map((role) => `<option>${escHtml(role)}</option>`)
                  .join("")}
              </select>
            </label>
            <button type="submit" class="settings-send-btn" id="settings-send-invite-btn">Send Invite</button>
            <p id="settings-invite-status" class="settings-invite-status" aria-live="polite"></p>
            </form>
          </div>

          <div class="settings-card settings-members-card">
            <div class="settings-member-tabs" role="tablist" aria-label="Team members tabs">
              <button
                class="settings-tab active"
                id="settings-tab-active"
                type="button"
                role="tab"
                aria-selected="true"
                aria-controls="settings-panel-active"
              >
                Active Members (${activeMembers.length})
              </button>
              <button
                class="settings-tab"
                id="settings-tab-pending"
                type="button"
                role="tab"
                aria-selected="false"
                aria-controls="settings-panel-pending"
              >
                Pending Invites (${pendingMembers.length})
              </button>
            </div>

            <ul
              class="settings-member-list"
              id="settings-panel-active"
              role="tabpanel"
              aria-labelledby="settings-tab-active"
            >
              ${activeMembers.map(renderMemberRow).join("")}
            </ul>

            <ul
              class="settings-member-list is-hidden"
              id="settings-panel-pending"
              role="tabpanel"
              aria-labelledby="settings-tab-pending"
            >
              ${pendingMembers.length ? pendingMembers.map(renderMemberRow).join("") : `
                <li class="settings-empty-state">No pending invites right now.</li>
              `}
            </ul>
          </div>
        </div>
      </div>

      <div class="settings-block">
        <h3 class="settings-block-title">Roles &amp; Permissions</h3>
        <p class="settings-block-subtitle">Define granular access control for each user role.</p>
        <div class="settings-table-wrap">
          <table class="settings-perm-table" aria-label="Roles and permissions table">
            <thead>
              <tr>
                <th>Capabilities</th>
                <th>Super Admin</th>
                <th>Content Editor</th>
                <th>Moderator</th>
              </tr>
            </thead>
            <tbody>
              ${capabilities.map(renderCapabilityRow).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="settings-block">
        <h3 class="settings-block-title">General Settings</h3>
        <p class="settings-block-subtitle">Configure your environment's global preferences and core identity.</p>

        <div class="settings-general-grid">
          <div class="settings-card">
            <h4 class="settings-card-title">App Identity</h4>
            <label class="settings-field-wrap">
              <span class="settings-field-label">Application Name</span>
              <input type="text" class="settings-input" value="${escHtml(appIdentity.applicationName || "")}" />
            </label>
            <label class="settings-field-wrap">
              <span class="settings-field-label">System Email</span>
              <input type="email" class="settings-input" value="${escHtml(appIdentity.systemEmail || "")}" />
            </label>

            <div class="settings-inline-fields">
              <label class="settings-field-wrap">
                <span class="settings-field-label">Timezone</span>
                <select class="settings-select">
                  <option>${escHtml(appIdentity.timezone || "UTC")}</option>
                </select>
              </label>

              <label class="settings-field-wrap">
                <span class="settings-field-label">Date Format</span>
                <select class="settings-select">
                  <option>${escHtml(appIdentity.dateFormat || "DD/MM/YYYY")}</option>
                </select>
              </label>
            </div>
          </div>

          <div class="settings-card">
            <h4 class="settings-card-title">Security Protocol</h4>
            ${renderSwitchRow(
              "security-two-factor",
              "Two-Factor Authentication",
              "Require 2FA for all Super Admin roles.",
              Boolean(securityProtocol.twoFactorAuthentication),
            )}
            ${renderSwitchRow(
              "security-auto-logout",
              "Auto-logout Inactivity",
              "Logout users after 30 minutes of inactivity.",
              Boolean(securityProtocol.autoLogoutInactivity),
            )}
            ${renderSwitchRow(
              "security-password-reset",
              "Enforce Password Reset",
              "Force all users to change passwords every 90 days.",
              Boolean(securityProtocol.forcePasswordReset),
            )}
          </div>
        </div>
      </div>
    </section>
  `;
}