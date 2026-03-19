/**
 * specialist-edit.js
 * Moderator review page for a single specialist submission.
 * Copy of clinic-edit.js with specialist-specific config.
 */

import { renderAdminSidebar, renderAdminTopbar, initAdminNavbar } from '../components/adminNavbar.js';
import { renderFooter } from '../components/footer.js';
import { renderSubmissionEdit } from '../components/submissionEditRenderer.js';
import api from '../api.js';

const ADMIN_USER_KEY = 'adminUser';
const TYPE           = 'specialist';
const API_BASE       = '/api/v1/admin/specialists';
const BACK_URL       = 'moderation-list.html?type=specialist';

async function init() {
  const stored = (() => { try { return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY)) || {}; } catch { return {}; } })();

  document.getElementById('sidebar-root').innerHTML = renderAdminSidebar({ activePage: 'specialists-onboarding', totalPending: 0, currentRole: stored.isSuperAdmin ? 'superadmin' : 'moderator' });
  document.getElementById('topbar-root').innerHTML  = renderAdminTopbar({ name: stored.name, email: stored.email });
  document.getElementById('footer-root').innerHTML  = renderFooter();
  initAdminNavbar();
  bindLogout();

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { showError('No submission ID provided.'); return; }

  renderSkeleton();
  const item = await fetchItem(id);
  if (!item) { showError('Submission not found.'); return; }

  document.getElementById('submission-edit-root').innerHTML = renderSubmissionEdit(item, TYPE);
  document.title = `${item.title || 'Specialist'} — Bloom Admin`;
  bindActions(item);
}

async function fetchItem(id) {
  try {
    const res = await api.get(`${API_BASE}/${id}`);
    return res?.data?.item || res?.data || null;
  } catch (_) {
    return { id, title: 'Dr. Funmi Adeyemi', description: 'Perinatal psychiatrist with 12 years experience. Available in-person and virtually.', email: 'funmi@example.com', speciality: 'Perinatal Psychiatry', location: 'Lagos, Nigeria', image_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=70', status: 'pending', submittedAt: new Date().toISOString() };
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
  document.getElementById('btn-approve')?.addEventListener('click', () => confirmAction(item, 'approved'));
  const btnReject = document.getElementById('btn-reject');
  if (btnReject) {
    btnReject.addEventListener('click', () => {
      const rf = document.getElementById('reject-message-field');
      if (rf.hidden) { rf.hidden = false; btnReject.textContent = 'Confirm Rejection'; btnReject.classList.add('mod-btn-reject-confirm'); }
      else confirmAction(item, 'rejected');
    });
  }
  document.getElementById('btn-save-note')?.addEventListener('click', () => saveNote(item._id || item.id));
}

async function confirmAction(item, status) {
  const id = item._id || item.id;
  const note = document.getElementById('mod-note')?.value.trim() || '';
  const email = item.email || document.getElementById('notif-email')?.value.trim() || '';
  const message = document.getElementById('reject-message')?.value.trim() || '';
  const dest = document.getElementById('publish-destination')?.value || '';
  const feedback = document.getElementById('mod-action-feedback');
  ['btn-approve','btn-reject'].forEach((bid) => { const b = document.getElementById(bid); if (b) b.disabled = true; });
  try {
    await api.patch(`${API_BASE}/${id}`, { status, moderatorNote: note, notificationEmail: email || undefined, rejectionMessage: status === 'rejected' ? message || undefined : undefined, publishDestination: status === 'approved' && dest ? dest : undefined });
    const badge = document.getElementById('submission-status-badge');
    if (badge) { badge.textContent = status; badge.className = `mod-status-badge mod-status-${status}`; }
    document.getElementById('mod-action-buttons').innerHTML = `<p class="story-edit-already-actioned">Submission <strong>${status}</strong>. <a href="${BACK_URL}" class="mod-back-inline">Back to list</a></p>`;
    showFeedback(feedback, status === 'approved' ? 'Approved and queued for publishing.' : 'Rejected.', status === 'approved' ? 'success' : 'info');
  } catch (_) {
    ['btn-approve','btn-reject'].forEach((bid) => { const b = document.getElementById(bid); if (b) b.disabled = false; });
    showFeedback(feedback, 'Something went wrong.', 'error');
  }
}

async function saveNote(id) {
  const note = document.getElementById('mod-note')?.value.trim() || '';
  const btn = document.getElementById('btn-save-note');
  const feedback = document.getElementById('mod-action-feedback');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  try { await api.patch(`${API_BASE}/${id}`, { moderatorNote: note }); showFeedback(feedback, 'Note saved.', 'success'); }
  catch (_) { showFeedback(feedback, 'Failed to save.', 'error'); }
  finally { if (btn) { btn.disabled = false; btn.textContent = 'Save note'; } }
}

function showFeedback(el, message, type) {
  if (!el) return;
  el.hidden = false; el.textContent = message; el.className = `mod-action-feedback mod-feedback-${type}`;
  setTimeout(() => { el.hidden = true; }, 5000);
}

function showError(message) {
  document.getElementById('submission-edit-root').hidden = true;
  const err = document.getElementById('submission-edit-error');
  err.hidden = false; err.querySelector('.mod-error-message').textContent = message;
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