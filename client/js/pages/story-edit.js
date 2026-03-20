/**
 * story-edit.js
 * Admin moderator view for a single story submission.
 * Loads the story, renders it for review, lets the moderator
 * add notes, then approve or reject with email notification.
 */

import {
  renderAdminSidebar,
  renderAdminTopbar,
  initAdminNavbar,
} from "../components/adminNavbar.js";
import { renderFooter } from "../components/footer.js";
import api from "../api.js";
import { MOCK_STORIES } from "../data/stories.js";
import { toRichTextHtml } from "../richText.js";

// ── Constants ──────────────────────────────────────────────────────────────────

const ADMIN_USER_KEY = "adminUser";

// ── Boot ───────────────────────────────────────────────────────────────────────

async function init() {
  console.debug('[StoryModeration][Detail] init story-edit page');
  const stored = (() => {
    try { return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY)) || {}; }
    catch { return {}; }
  })();

  // Render shell
  document.getElementById("sidebar-root").innerHTML = renderAdminSidebar({
    activePage: "moderation-stories",
    totalPending: 0,
    currentRole: stored.isSuperAdmin ? "superadmin" : "moderator",
  });
  document.getElementById("topbar-root").innerHTML = renderAdminTopbar({
    name: stored.name,
    email: stored.email,
  });
  document.getElementById("footer-root").innerHTML = renderFooter();

  initAdminNavbar();
  bindLogout();

  // Load story
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) { showError("No story ID provided."); return; }

  renderSkeleton();
  const story = await fetchStory(id);

  if (!story) { showError("Story not found or has been removed."); return; }

  renderStoryEdit(story);
  bindActions(story);
}

// ── Data ───────────────────────────────────────────────────────────────────────

async function fetchStory(id) {
  try {
    console.debug('[StoryModeration][Detail] fetching story', { id });
    const res = await api.get(`/api/v1/admin/stories/${id}`);
    if (res?.data?.story) {
      console.debug('[StoryModeration][Detail] fetch success', { id: res.data.story._id || id });
      return res.data.story;
    }
    if (res?.data) {
      console.debug('[StoryModeration][Detail] fetch success (direct data)', { id });
      return res.data;
    }
  } catch (_) { /* fall through */ }

  // Mock fallback
  const mock = MOCK_STORIES.find((s) => s._id === id || s.id === id);
  if (!mock) return null;
  return {
    ...mock,
    status: mock.status || "pending",
    submittedAt: mock.createdAt || new Date().toISOString(),
    email: mock.email || null,
    moderatorNote: mock.moderatorNote || "",
  };
}

// ── Render ─────────────────────────────────────────────────────────────────────

function renderStoryEdit(story) {
  const root    = document.getElementById("story-edit-root");
  const id      = story._id || story.id;
  const name    = story.privacy === "named" && story.name ? story.name : "Anonymous";
  const date    = story.submittedAt
    ? new Date(story.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const tagsHtml = (story.what_helped || [])
    .map((t) => `<span class="review-tag">${escHtml(t)}</span>`)
    .join("");

  const storyHtml = toRichTextHtml(story.story || "");

  const statusClass = `mod-status-${escHtml(story.status || "pending")}`;

  root.innerHTML = `
    <div class="story-edit-layout">

      <!-- Left: story preview -->
      <div class="story-edit-preview">
        <div class="story-edit-preview-header">
          <div>
            <h1 class="story-edit-name">${escHtml(name)}'s Story</h1>
            <div class="story-edit-meta">
              ${story.location ? `<span>${escHtml(story.location)}</span>` : ""}
              ${date ? `<span>${date}</span>` : ""}
            </div>
          </div>
          <span class="mod-status-badge ${statusClass}" id="story-status-badge">${escHtml(story.status || "pending")}</span>
        </div>

        ${story.image_url ? `
          <figure class="story-edit-image-wrap">
            <img src="${escHtml(story.image_url)}" alt="Story image" class="story-edit-image" />
          </figure>
        ` : ""}

        ${tagsHtml ? `
          <div class="review-tags story-edit-tags">${tagsHtml}</div>
        ` : ""}

        <div class="story-edit-body mod-rich-text">${storyHtml}</div>

        <!-- Submitter meta -->
        <div class="story-edit-submitter-card">
          <h3 class="story-edit-section-label">Submission Details</h3>
          <dl class="story-edit-dl">
            <div>
              <dt>Identity</dt>
              <dd>${story.privacy === "anonymous" ? "Anonymous" : escHtml(story.name || "Not provided")}</dd>
            </div>
            <div>
              <dt>Consent</dt>
              <dd>${story.consent ? "Consented to moderation" : "No consent recorded"}</dd>
            </div>
            ${story.email ? `
              <div>
                <dt>Notification email</dt>
                <dd><a href="mailto:${escHtml(story.email)}" class="mod-email-link">${escHtml(story.email)}</a></dd>
              </div>
            ` : ""}
          </dl>
        </div>
      </div>

      <!-- Right: moderator actions -->
      <aside class="story-edit-panel" aria-label="Moderation actions">

        <h2 class="story-edit-panel-title">Moderation</h2>

        <!-- Notes -->
        <div class="story-edit-field">
          <label for="mod-note" class="story-edit-label">
            Moderator note
            <span class="story-edit-label-hint">Internal only — not sent to submitter</span>
          </label>
          <textarea
            id="mod-note"
            class="story-edit-textarea"
            rows="4"
            placeholder="Add a note visible only to the moderation team…"
          >${escHtml(story.moderatorNote || "")}</textarea>
        </div>

        <!-- Notification email (if not provided by submitter) -->
        ${!story.email ? `
          <div class="story-edit-field" id="notif-email-field">
            <label for="notif-email" class="story-edit-label">
              Notification email
              <span class="story-edit-label-hint">Optional — if you have a contact email for this submitter</span>
            </label>
            <input
              type="email"
              id="notif-email"
              class="story-edit-input"
              placeholder="submitter@email.com"
              autocomplete="off"
            />
          </div>
        ` : ""}

        <!-- Rejection message (shown when reject chosen) -->
        <div class="story-edit-field" id="reject-message-field" hidden>
          <label for="reject-message" class="story-edit-label">
            Message to submitter
            <span class="story-edit-label-hint">Sent by email if an address is available</span>
          </label>
          <textarea
            id="reject-message"
            class="story-edit-textarea"
            rows="4"
            placeholder="Thank you for sharing your story. Unfortunately, we're unable to publish it at this time because…"
          ></textarea>
        </div>

        <!-- Email preview -->
        <div class="story-edit-email-preview" id="email-preview" hidden>
          <div class="email-preview-label">Email preview</div>
          <div class="email-preview-body" id="email-preview-body"></div>
        </div>

        <!-- Action feedback -->
        <div id="mod-action-feedback" class="mod-action-feedback" hidden role="alert"></div>

        <!-- CTA buttons -->
        <div class="story-edit-actions" id="mod-action-buttons">
          ${story.status !== "approved" ? `
            <button class="btn btn-primary mod-btn-approve" id="btn-approve" data-id="${escHtml(id)}" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Approve &amp; Publish
            </button>
          ` : ""}
          ${story.status !== "rejected" ? `
            <button class="btn mod-btn-reject" id="btn-reject" data-id="${escHtml(id)}" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Reject
            </button>
          ` : ""}
          <button class="btn mod-btn-save-note" id="btn-save-note" data-id="${escHtml(id)}" type="button">
            Save note
          </button>
        </div>

        ${story.status !== "pending" ? `
          <p class="story-edit-already-actioned">
            This story has already been <strong>${escHtml(story.status)}</strong>.
            You can still update the moderator note.
          </p>
        ` : ""}
      </aside>

    </div>
  `;

  document.title = `${name}'s Story — Bloom Admin`;
}

function renderSkeleton() {
  document.getElementById("story-edit-root").innerHTML = `
    <div class="story-edit-layout">
      <div class="story-edit-preview">
        <div class="skeleton-line" style="width:50%;height:32px;margin-bottom:12px"></div>
        <div class="skeleton-line" style="width:30%;margin-bottom:24px"></div>
        <div class="skeleton-block" style="width:100%;height:280px;border-radius:12px;margin-bottom:20px"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-line-medium"></div>
        <div class="skeleton-line skeleton-line-full"></div>
        <div class="skeleton-line skeleton-line-medium"></div>
      </div>
      <div class="story-edit-panel">
        <div class="skeleton-line" style="width:60%;height:24px;margin-bottom:20px"></div>
        <div class="skeleton-block" style="width:100%;height:120px;border-radius:8px;margin-bottom:12px"></div>
        <div class="skeleton-line" style="width:80%;height:40px;border-radius:6px"></div>
      </div>
    </div>
  `;
}

// ── Action binding ─────────────────────────────────────────────────────────────

function bindActions(story) {
  // Reject button shows message textarea + email preview
  const btnReject = document.getElementById("btn-reject");
  if (btnReject) {
    btnReject.addEventListener("click", () => {
      const rejectField = document.getElementById("reject-message-field");
      const isShowing   = !rejectField.hidden;
      if (isShowing) {
        // Second click = confirm reject
        confirmAction(story, "rejected");
      } else {
        rejectField.hidden = false;
        btnReject.textContent = "Confirm Rejection";
        btnReject.classList.add("mod-btn-reject-confirm");
        updateEmailPreview(story, "rejected");
      }
    });
  }

  // Reject message → update email preview live
  const rejectMsg = document.getElementById("reject-message");
  if (rejectMsg) {
    rejectMsg.addEventListener("input", () => updateEmailPreview(story, "rejected"));
  }

  // Approve
  const btnApprove = document.getElementById("btn-approve");
  if (btnApprove) {
    btnApprove.addEventListener("click", () => confirmAction(story, "approved"));
  }

  // Save note
  const btnNote = document.getElementById("btn-save-note");
  if (btnNote) {
    btnNote.addEventListener("click", () => saveNote(story));
  }
}

async function confirmAction(story, status) {
  const id         = story._id || story.id;
  const note       = document.getElementById("mod-note")?.value.trim() || "";
  const email      = story.email || document.getElementById("notif-email")?.value.trim() || "";
  const message    = document.getElementById("reject-message")?.value.trim() || "";
  const feedback   = document.getElementById("mod-action-feedback");
  const btnApprove = document.getElementById("btn-approve");
  const btnReject  = document.getElementById("btn-reject");

  // Disable buttons during request
  [btnApprove, btnReject].forEach((b) => { if (b) b.disabled = true; });

  try {
    console.debug('[StoryModeration][Detail] moderation request', {
      id,
      status,
      hasNotificationEmail: Boolean(email),
      hasRejectionMessage: Boolean(message),
    });
    const result = await api.patch(`/api/v1/admin/stories/${id}`, {
      status,
      moderatorNote: note,
      notificationEmail: email || undefined,
      rejectionMessage: status === "rejected" ? message || undefined : undefined,
    });

    const emailNotification = result?.data?.emailNotification;
    console.debug('[StoryModeration][Detail] moderation success', {
      id,
      status,
      emailNotification,
    });

    // Update badge
    const badge = document.getElementById("story-status-badge");
    if (badge) {
      badge.textContent = status;
      badge.className = `mod-status-badge mod-status-${status}`;
    }

    // Hide action buttons (already actioned)
    const actionBtns = document.getElementById("mod-action-buttons");
    if (actionBtns) actionBtns.innerHTML = `
      <p class="story-edit-already-actioned">
        Story has been <strong>${status}</strong>.
        <a href="stories-moderation.html" class="mod-back-inline">Back to list</a>
      </p>
    `;

    const baseMessage = status === "approved"
      ? "Story approved and published successfully."
      : "Story rejected.";

    const emailMessage = (() => {
      if (!emailNotification?.attempted) return "";
      if (emailNotification.sent) return " Notification email sent.";
      if (emailNotification.skipped && emailNotification.reason === "no-recipient") {
        return " Email skipped: no notification email provided.";
      }
      if (emailNotification.skipped && emailNotification.reason === "service-unconfigured") {
        return " Email skipped: Resend is not configured.";
      }
      if (emailNotification.reason === "send-failed") {
        return " Email failed to send.";
      }
      return "";
    })();

    showFeedback(
      feedback,
      `${baseMessage}${emailMessage}`,
      status === "approved" ? "success" : "info",
    );

  } catch (err) {
    console.error('[StoryModeration][Detail] moderation failed', {
      id,
      status,
      message: err?.message,
      statusCode: err?.status,
      data: err?.data,
    });
    [btnApprove, btnReject].forEach((b) => { if (b) b.disabled = false; });
    showFeedback(feedback, "Something went wrong. Please try again.", "error");
  }
}

async function saveNote(story) {
  const id   = story._id || story.id;
  const note = document.getElementById("mod-note")?.value.trim() || "";
  const btn  = document.getElementById("btn-save-note");
  const feedback = document.getElementById("mod-action-feedback");

  if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }

  try {
    console.debug('[StoryModeration][Detail] save note request', { id, noteLength: note.length });
    await api.patch(`/api/v1/admin/stories/${id}`, { moderatorNote: note });
    console.debug('[StoryModeration][Detail] save note success', { id });
    showFeedback(feedback, "Note saved.", "success");
  } catch (err) {
    console.error('[StoryModeration][Detail] save note failed', {
      id,
      message: err?.message,
      status: err?.status,
      data: err?.data,
    });
    showFeedback(feedback, "Failed to save note.", "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Save note"; }
  }
}

// ── Email preview ──────────────────────────────────────────────────────────────

function updateEmailPreview(story, status) {
  const preview     = document.getElementById("email-preview");
  const previewBody = document.getElementById("email-preview-body");
  const message     = document.getElementById("reject-message")?.value.trim() || "";
  const name        = story.privacy === "named" && story.name ? story.name : "there";

  preview.hidden = false;

  if (status === "rejected") {
    previewBody.innerHTML = `
      <p>Hi ${escHtml(name)},</p>
      <p>Thank you for sharing your story with the Bloom After community.</p>
      ${message
        ? `<p>${escHtml(message)}</p>`
        : `<p>After careful review, we're unable to publish your submission at this time.</p>`
      }
      <p>We appreciate your courage in sharing, and we encourage you to reach out if you have any questions.</p>
      <p>— The Bloom After Team</p>
    `;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function showFeedback(el, message, type = "success") {
  if (!el) return;
  el.hidden = false;
  el.textContent = message;
  el.className = `mod-action-feedback mod-feedback-${type}`;
  setTimeout(() => { el.hidden = true; }, 5000);
}

function showError(message) {
  document.getElementById("story-edit-root").hidden = true;
  const err = document.getElementById("story-edit-error");
  err.hidden = false;
  err.querySelector(".mod-error-message").textContent = message;
}

function bindLogout() {
  document.querySelectorAll("[data-admin-logout]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try { await api.post("/api/v1/auth/logout"); } catch (_) {}
      sessionStorage.removeItem(ADMIN_USER_KEY);
      sessionStorage.removeItem("adminToken");
      window.location.assign("/client/pages/admin-login.html");
    });
  });
}

function escHtml(v = "") {
  return String(v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

init();