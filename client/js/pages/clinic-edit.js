/**
 * clinic-edit.js
 * Moderator review page for a single clinic submission.
 */

import { renderAdminSidebar, renderAdminTopbar, initAdminNavbar } from '../components/adminNavbar.js';
import { renderFooter } from '../components/footer.js';
import { renderSubmissionEdit, escHtml } from '../components/submissionEditRenderer.js';
import api from '../api.js';

const ADMIN_USER_KEY = 'adminUser';
const TYPE           = 'clinic';
const API_BASE       = '/api/v1/admin/clinics';
const BACK_URL       = 'moderation-list.html?type=clinic';

async function init() {
  const stored = (() => { try { return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY)) || {}; } catch { return {}; } })();

  document.getElementById('sidebar-root').innerHTML = renderAdminSidebar({ activePage: 'moderation-clinics', totalPending: 0, currentRole: stored.isSuperAdmin ? 'superadmin' : 'moderator' });
  document.getElementById('topbar-root').innerHTML  = renderAdminTopbar({ name: stored.name, email: stored.email });
  document.getElementById('footer-root').innerHTML  = renderFooter();
  initAdminNavbar();
  bindLogout();

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { showError('No submission ID provided.'); return; }

  renderSkeleton();
  const item = await fetchItem(id);
  if (!item) { showError('Submission not found or has been removed.'); return; }

  document.getElementById('submission-edit-root').innerHTML = renderSubmissionEdit(item, TYPE);
  document.title = `${item.title || 'Clinic'} — Bloom Admin`;
  bindActions(item);
}

async function fetchItem(id) {
  try {
    const res = await api.get(`${API_BASE}/${id}`);
    return res?.data?.item || res?.data || null;
  } catch (_) {
    // Mock fallback
    return { id, title: 'Grace Medical Centre', description: 'Excellent postpartum care in Lagos Island.', email: 'grace@example.com', location: 'Lagos, Nigeria', link: 'https://gracemedical.ng', image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=70', status: 'pending', submittedAt: new Date().toISOString() };
  }
}

function renderSkeleton() {
  document.getElementById('submission-edit-root').innerHTML = `
    <div class="story-edit-layout">
      <div class="story-edit-preview">
        <div class="skeleton-line" style="width:50%;height:32px;margin-bottom:12px"></div>
        <div class="skeleton-block" style="width:100%;height:240px;border-radius:12px;margin-bottom:20px"></div>
        <div class="skeleton-line"></div><div class="skeleton-line skeleton-line-medium"></div>
      </div>
      <div class="story-edit-panel">
        <div class="skeleton-line" style="width:60%;height:24px;margin-bottom:20px"></div>
        <div class="skeleton-block" style="width:100%;height:100px;border-radius:8px"></div>
      </div>
    </div>`;
}

function bindActions(item) {
  const id = item._id || item.id;

  document.getElementById('btn-approve')?.addEventListener('click', () => confirmAction(item, 'approved'));

  const btnReject = document.getElementById('btn-reject');
  if (btnReject) {
    btnReject.addEventListener('click', () => {
      const rf = document.getElementById('reject-message-field');
      if (rf.hidden) {
        rf.hidden = false;
        btnReject.textContent = 'Confirm Rejection';
        btnReject.classList.add('mod-btn-reject-confirm');
      } else {
        confirmAction(item, 'rejected');
      }
    });
  }

  document.getElementById('btn-revoke')?.addEventListener('click', () => confirmAction(item, 'removed'));
  document.getElementById('btn-delete-post')?.addEventListener('click', () => confirmAction(item, 'deleted'));

  document.getElementById('btn-save-note')?.addEventListener('click', () => saveNote(id));
}

async function confirmAction(item, status) {
  const id      = item._id || item.id;
  const note    = document.getElementById('mod-note')?.value.trim() || '';
  const email   = item.email || document.getElementById('notif-email')?.value.trim() || '';
  const message = document.getElementById('reject-message')?.value.trim() || '';
  const dest    = document.getElementById('publish-destination')?.value || '';
  const feedback = document.getElementById('mod-action-feedback');

  ['btn-approve', 'btn-reject', 'btn-revoke', 'btn-delete-post'].forEach((bid) => { const b = document.getElementById(bid); if (b) b.disabled = true; });

  try {
    await api.patch(`${API_BASE}/${id}`, { status, moderatorNote: note, notificationEmail: email || undefined, rejectionMessage: status === 'rejected' ? message || undefined : undefined, publishDestination: status === 'approved' && dest ? dest : undefined });

    const badge = document.getElementById('submission-status-badge');
    if (status !== 'deleted' && badge) { badge.textContent = status; badge.className = `mod-status-badge mod-status-${status}`; }

    document.getElementById('mod-action-buttons').innerHTML = `
      <p class="story-edit-already-actioned">
        Submission <strong>${status}</strong>.
        <a href="${BACK_URL}" class="mod-back-inline">Back to list</a>
      </p>`;

    const message = status === 'approved'
      ? 'Approved and queued for publishing.'
      : status === 'removed'
      ? 'Submission revoked and marked as removed. Revoke email sent if configured.'
      : status === 'deleted'
      ? 'Submission permanently deleted. Permanent delete email sent if configured.'
      : 'Rejected. Submitter will be notified if email provided.';

    showFeedback(feedback, message, status === 'approved' ? 'success' : status === 'deleted' ? 'error' : 'info');
  } catch (_) {
    ['btn-approve', 'btn-reject', 'btn-revoke', 'btn-delete-post'].forEach((bid) => { const b = document.getElementById(bid); if (b) b.disabled = false; });
    showFeedback(feedback, 'Something went wrong. Please try again.', 'error');
  }
}

async function saveNote(id) {
  const note = document.getElementById('mod-note')?.value.trim() || '';
  const btn  = document.getElementById('btn-save-note');
  const feedback = document.getElementById('mod-action-feedback');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  try {
    await api.patch(`${API_BASE}/${id}`, { moderatorNote: note });
    showFeedback(feedback, 'Note saved.', 'success');
  } catch (_) {
    showFeedback(feedback, 'Failed to save note.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save note'; }
  }
}

function showFeedback(el, message, type) {
  if (!el) return;
  el.hidden = false; el.textContent = message;
  el.className = `mod-action-feedback mod-feedback-${type}`;
  setTimeout(() => { el.hidden = true; }, 5000);
}

function showError(message) {
  document.getElementById('submission-edit-root').hidden = true;
  const err = document.getElementById('submission-edit-error');
  err.hidden = false;
  err.querySelector('.mod-error-message').textContent = message;
}

function bindLogout() {
  document.querySelectorAll('[data-admin-logout]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await api.post('/api/v1/auth/logout'); } catch (_) {}
      sessionStorage.removeItem(ADMIN_USER_KEY);
      window.location.assign('/client/pages/admin-login.html');
    });
  });
}

init();