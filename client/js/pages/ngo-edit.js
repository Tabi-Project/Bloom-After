import {
  renderAdminSidebar,
  renderAdminTopbar,
  initAdminNavbar,
} from '../components/adminNavbar.js';
import { renderFooter } from '../components/footer.js';
import api from '../api.js';

const ADMIN_USER_KEY = 'adminUser';

async function init() {
  const stored = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY)) || {};
    } catch {
      return {};
    }
  })();

  document.getElementById('sidebar-root').innerHTML = renderAdminSidebar({
    activePage: 'moderation-ngos',
    totalPending: 0,
    currentRole: stored.isSuperAdmin ? 'superadmin' : 'moderator',
  });
  document.getElementById('topbar-root').innerHTML = renderAdminTopbar({
    name: stored.name,
    email: stored.email,
  });
  document.getElementById('footer-root').innerHTML = renderFooter();

  initAdminNavbar();
  bindLogout();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showError('No NGO ID provided.');
    return;
  }

  renderSkeleton();
  const ngo = await fetchNgo(id);
  if (!ngo) {
    showError('NGO not found or has been removed.');
    return;
  }

  renderNgoEdit(ngo);
  bindActions(ngo);
}

async function fetchNgo(id) {
  try {
    const res = await api.get(`/api/v1/admin/ngos/${encodeURIComponent(id)}`);
    return res?.data?.ngo || null;
  } catch (err) {
    if (err?.status === 401 || err?.status === 403) {
      window.location.assign('/admin/login');
      return null;
    }
    return null;
  }
}

function renderNgoEdit(ngo) {
  const root = document.getElementById('ngo-edit-root');
  const status = String(ngo.status || 'pending').toLowerCase();
  const submittedDate = ngo.createdAt
    ? new Date(ngo.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  root.innerHTML = `
    <div class="story-edit-layout">
      <div class="story-edit-preview">
        <div class="story-edit-preview-header">
          <div>
            <h1 class="story-edit-name">${escHtml(ngo.name || 'Untitled NGO')}</h1>
            <div class="story-edit-meta">
              ${submittedDate ? `<span>Submitted ${submittedDate}</span>` : ''}
              ${ngo.geographic_coverage ? `<span>${escHtml(ngo.geographic_coverage)}</span>` : ''}
            </div>
          </div>
          <span class="mod-status-badge mod-status-${escHtml(status)}" id="ngo-status-badge">${escHtml(status)}</span>
        </div>

        ${ngo.cover_image ? `
          <figure class="story-edit-image-wrap">
            <img src="${escHtml(ngo.cover_image)}" alt="NGO image" class="story-edit-image" />
          </figure>
        ` : ''}

        <div class="story-edit-body mod-rich-text">
          <p><strong>Submitted name:</strong> ${escHtml(ngo.name || 'N/A')}</p>
          <p><strong>Submitted website:</strong> ${ngo.website ? `<a href="${escHtml(ngo.website)}" target="_blank" rel="noopener noreferrer">${escHtml(ngo.website)}</a>` : 'N/A'}</p>
          <p><strong>Submitted mission:</strong> ${escHtml(ngo.mission || 'Not provided')}</p>
        </div>
      </div>

      <aside class="story-edit-panel" aria-label="NGO moderation actions">
        <h2 class="story-edit-panel-title">Moderation</h2>

        <div class="story-edit-field">
          <label for="ngo-mission" class="story-edit-label">
            NGO description
            <span class="story-edit-label-hint">Required before approval</span>
          </label>
          <textarea id="ngo-mission" class="story-edit-textarea" rows="4" placeholder="Add verified NGO description...">${escHtml(ngo.mission || '')}</textarea>
        </div>

        <div class="story-edit-field">
          <label for="ngo-phone" class="story-edit-label">
            Contact phone
            <span class="story-edit-label-hint">Required before approval</span>
          </label>
          <input type="text" id="ngo-phone" class="story-edit-input" value="${escHtml(ngo.contact?.phone || '')}" placeholder="+234 ..." />
        </div>

        <div class="story-edit-field">
          <label for="ngo-email" class="story-edit-label">
            Contact email
            <span class="story-edit-label-hint">Required before approval and used for notification</span>
          </label>
          <input type="email" id="ngo-email" class="story-edit-input" value="${escHtml(ngo.contact?.email || '')}" placeholder="contact@example.org" />
        </div>

        <div class="story-edit-field">
          <label for="ngo-note" class="story-edit-label">
            Moderator note
            <span class="story-edit-label-hint">Internal only</span>
          </label>
          <textarea id="ngo-note" class="story-edit-textarea" rows="3" placeholder="Add moderator note...">${escHtml(ngo.moderatorNote || '')}</textarea>
        </div>

        <div id="mod-action-feedback" class="mod-action-feedback" hidden role="alert"></div>

        <div class="story-edit-actions" id="ngo-action-buttons">
          ${status !== 'approved' ? `
            <button class="btn btn-primary mod-btn-approve" id="btn-approve" type="button">Complete & Approve</button>
          ` : ''}
          ${status !== 'rejected' ? `
            <button class="btn mod-btn-reject" id="btn-reject" type="button">Reject</button>
          ` : ''}
          <button class="btn mod-btn-save-note" id="btn-save-note" type="button">Save changes</button>
        </div>
      </aside>
    </div>
  `;
}

function bindActions(ngo) {
  const approveBtn = document.getElementById('btn-approve');
  const rejectBtn = document.getElementById('btn-reject');
  const saveBtn = document.getElementById('btn-save-note');

  if (approveBtn) {
    approveBtn.addEventListener('click', () => submitModeration(ngo, 'approved'));
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => submitModeration(ngo, 'rejected'));
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => submitModeration(ngo, ngo.status || 'pending', { saveOnly: true }));
  }
}

async function submitModeration(ngo, status, options = {}) {
  const mission = (document.getElementById('ngo-mission')?.value || '').trim();
  const phone = (document.getElementById('ngo-phone')?.value || '').trim();
  const email = (document.getElementById('ngo-email')?.value || '').trim();
  const moderatorNote = (document.getElementById('ngo-note')?.value || '').trim();
  const feedback = document.getElementById('mod-action-feedback');

  if (!options.saveOnly && status === 'approved' && (!mission || !phone || !email)) {
    showFeedback(feedback, 'Description, phone, and email are required before approval.', 'error');
    return;
  }

  try {
    const payload = {
      status,
      mission,
      contact: {
        phone,
        email,
      },
      moderatorNote,
      notificationEmail: email || undefined,
    };

    if (options.saveOnly) {
      delete payload.status;
    }

    const result = await api.patch(`/api/v1/admin/ngos/${encodeURIComponent(ngo.id || ngo._id)}`, payload);
    const updated = result?.data?.ngo;
    const emailNotification = result?.data?.emailNotification;

    if (updated) {
      ngo.status = updated.status;
      ngo.mission = updated.mission;
      ngo.contact = updated.contact;
      ngo.moderatorNote = updated.moderatorNote;
      const badge = document.getElementById('ngo-status-badge');
      if (badge) {
        badge.textContent = updated.status;
        badge.className = `mod-status-badge mod-status-${updated.status}`;
      }
    }

    const emailMessage = emailNotification?.sent
      ? ' Notification email sent.'
      : emailNotification?.attempted
        ? ' Notification email not sent.'
        : '';

    showFeedback(
      feedback,
      options.saveOnly ? 'Changes saved.' : `NGO ${status}.${emailMessage}`,
      status === 'rejected' ? 'info' : 'success'
    );
  } catch (error) {
    showFeedback(feedback, error?.message || 'Could not update NGO right now.', 'error');
  }
}

function renderSkeleton() {
  document.getElementById('ngo-edit-root').innerHTML = `
    <div class="story-edit-layout">
      <div class="story-edit-preview">
        <div class="skeleton-line" style="width:50%;height:32px;margin-bottom:12px"></div>
        <div class="skeleton-line" style="width:30%;margin-bottom:24px"></div>
        <div class="skeleton-block" style="width:100%;height:220px;border-radius:12px;margin-bottom:20px"></div>
      </div>
      <div class="story-edit-panel">
        <div class="skeleton-line" style="width:60%;height:24px;margin-bottom:20px"></div>
        <div class="skeleton-block" style="width:100%;height:120px;border-radius:8px;margin-bottom:12px"></div>
      </div>
    </div>
  `;
}

function showFeedback(el, message, type = 'success') {
  if (!el) return;
  el.hidden = false;
  el.textContent = message;
  el.className = `mod-action-feedback mod-feedback-${type}`;
  setTimeout(() => {
    el.hidden = true;
  }, 5000);
}

function showError(message) {
  document.getElementById('ngo-edit-root').hidden = true;
  const err = document.getElementById('ngo-edit-error');
  err.hidden = false;
  err.querySelector('.mod-error-message').textContent = message;
}

function bindLogout() {
  document.querySelectorAll('[data-admin-logout]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        await api.post('/api/v1/auth/logout');
      } catch (_) {}
      sessionStorage.removeItem(ADMIN_USER_KEY);
      sessionStorage.removeItem('adminToken');
      window.location.assign('/admin/login');
    });
  });
}

function escHtml(v = '') {
  return String(v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

init();
