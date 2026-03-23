import {
  renderAdminSidebar,
  renderAdminTopbar,
  initAdminNavbar,
} from '../components/adminNavbar.js';
import { renderFooter } from '../components/footer.js';
import api from '../api.js';

const PAGE_SIZE = 15;
const ADMIN_USER_KEY = 'adminUser';

let allItems = [];
let filtered = [];
let currentStatus = '';
let currentQuery = '';
let currentPage = 1;

const getEl = (id) => document.getElementById(id);

async function init() {
  const stored = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY)) || {};
    } catch {
      return {};
    }
  })();

  getEl('sidebar-root').innerHTML = renderAdminSidebar({
    activePage: 'moderation-suggestions',
    totalPending: 0,
    currentRole: stored.isSuperAdmin ? 'superadmin' : 'moderator',
  });
  getEl('topbar-root').innerHTML = renderAdminTopbar({ name: stored.name, email: stored.email });
  getEl('footer-root').innerHTML = renderFooter();

  initAdminNavbar();
  bindLogout();

  renderSkeleton();
  allItems = await fetchSuggestions();
  if (!allItems) return;

  applyFilters();
  bindControls();
}

async function fetchSuggestions() {
  try {
    const res = await api.get('/api/v1/admin/suggestions');
    return res?.data?.suggestions || [];
  } catch (err) {
    if (err?.status === 401 || err?.status === 403) {
      window.location.assign('/admin/login');
      return null;
    }
    return [];
  }
}

function applyFilters() {
  const q = currentQuery.toLowerCase().trim();
  filtered = allItems.filter((item) => {
    const matchStatus = !currentStatus || item.status === currentStatus;
    const matchQuery =
      !q ||
      [item.type || '', item.email || '', item.content || '', item.moderatorNote || ''].some((field) =>
        field.toLowerCase().includes(q)
      );
    return matchStatus && matchQuery;
  });

  filtered.sort((a, b) => {
    const aPending = a.status === 'pending' ? 1 : 0;
    const bPending = b.status === 'pending' ? 1 : 0;
    if (aPending !== bPending) return bPending - aPending;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
  currentPage = 1;
  renderList();
  renderStats();
  renderPagination();
}

function renderStats() {
  const counts = { pending: 0, approved: 0, implemented: 0, rejected: 0 };
  allItems.forEach((item) => {
    if (counts[item.status] !== undefined) counts[item.status] += 1;
  });

  getEl('mod-header-stats').innerHTML = `
    <span class="mod-stat-pill mod-stat-pending">${counts.pending} pending</span>
    <span class="mod-stat-pill mod-stat-approved">${counts.approved} approved</span>
    <span class="mod-stat-pill mod-stat-approved">${counts.implemented} implemented</span>
    <span class="mod-stat-pill mod-stat-rejected">${counts.rejected} rejected</span>
  `;
}

function renderList() {
  const list = getEl('suggestion-list');
  const empty = getEl('suggestion-empty');
  const start = (currentPage - 1) * PAGE_SIZE;
  const page = filtered.slice(start, start + PAGE_SIZE);

  if (!page.length) {
    list.innerHTML = '';
    empty.hidden = false;
    empty.textContent = currentQuery || currentStatus ? 'No suggestions match your search or filter.' : 'No suggestions yet.';
    return;
  }

  empty.hidden = true;
  list.innerHTML = page.map(renderSuggestionCard).join('');
}

function renderSuggestionCard(item) {
  const id = item.id || item._id;
  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return `
    <article class="mod-submission-card" data-id="${escHtml(id)}">
      <div class="mod-sub-body">
        <div class="mod-sub-top">
          <div class="mod-sub-meta">
            <span class="mod-sub-title">${escHtml(item.type || 'suggestion')}</span>
            <div class="mod-sub-tags">
              ${item.email ? `<span class="mod-sub-tag">${escHtml(item.email)}</span>` : '<span class="mod-sub-tag">No email</span>'}
            </div>
          </div>
          <div class="mod-sub-right">
            <span class="mod-status-badge mod-status-${escHtml(item.status)}">${escHtml(item.status)}</span>
            ${date ? `<span class="mod-sub-date">${date}</span>` : ''}
          </div>
        </div>
        <p class="mod-sub-desc">${escHtml(item.content || '')}</p>
      </div>
      <div class="mod-row-actions">
        ${item.status === 'pending' ? `<button class="mod-action-btn mod-action-approve" data-action="approved" data-id="${escHtml(id)}">Approve</button>` : ''}
        ${item.status === 'pending' ? `<button class="mod-action-btn mod-action-reject" data-action="rejected" data-id="${escHtml(id)}">Reject</button>` : ''}
        ${item.status === 'approved' ? `<button class="mod-action-btn mod-action-review" data-action="implemented" data-id="${escHtml(id)}">Implemented</button>` : ''}
      </div>
    </article>
  `;
}

function renderSkeleton() {
  getEl('suggestion-list').innerHTML = Array.from({ length: 5 })
    .map(
      () => `
    <div class="mod-submission-card mod-row-skeleton" aria-hidden="true">
      <div class="mod-sub-body" style="flex:1">
        <div class="skeleton-line" style="width:40%;margin-bottom:8px"></div>
        <div class="skeleton-line" style="width:80%"></div>
      </div>
    </div>
  `
    )
    .join('');
}

function renderPagination() {
  const wrap = getEl('mod-pagination');
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (totalPages <= 1) {
    wrap.innerHTML = '';
    return;
  }

  wrap.innerHTML = `
    <nav class="pagination" aria-label="Suggestions pagination">
      <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>
      <div class="pagination-pages">
        ${Array.from({ length: totalPages }, (_, index) => index + 1)
          .map(
            (page) => `
          <button class="pagination-page ${page === currentPage ? 'pagination-page-active' : ''}" data-page="${page}" ${
              page === currentPage ? 'aria-current="page"' : ''
            }>${page}</button>
        `
          )
          .join('')}
      </div>
      <button class="pagination-btn" data-page="${currentPage + 1}" ${
    currentPage === totalPages ? 'disabled' : ''
  }>Next →</button>
    </nav>
  `;
}

function bindControls() {
  document.querySelectorAll('.mod-filter-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mod-filter-tab').forEach((tab) => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentStatus = btn.dataset.status || '';
      applyFilters();
    });
  });

  let timer;
  getEl('mod-search').addEventListener('input', (event) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      currentQuery = event.target.value;
      applyFilters();
    }, 250);
  });

  getEl('suggestion-list').addEventListener('click', handleListClick);

  getEl('mod-pagination').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    currentPage = Number.parseInt(btn.dataset.page, 10);
    renderList();
    renderPagination();
  });

}

async function handleListClick(event) {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;

  const id = btn.dataset.id;
  const status = btn.dataset.action;
  const item = allItems.find((suggestion) => (suggestion.id || suggestion._id) === id);
  if (!item) return;

  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = '...';

  try {
    await api.patch(`/api/v1/admin/suggestions/${encodeURIComponent(id)}`, {
      status,
      notificationEmail: item.email || undefined,
    });

    item.status = status;
    applyFilters();
  } catch (_) {
    btn.disabled = false;
    btn.textContent = original;
  }
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

function escHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[char] || char;
  });
}

init();
