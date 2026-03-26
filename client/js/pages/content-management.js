import {
  renderAdminSidebar,
  renderAdminTopbar,
  initAdminNavbar,
} from '../components/adminNavbar.js';
import { renderFooter } from '../components/footer.js';
import api from '../api.js';

// Constants
const ADMIN_USER_KEY = 'adminUser';
const PAGE_SIZE      = 15;

// Destination config

const DESTINATIONS = [
  {
    id:       'resource',
    label:    'Resource Hub',
    desc:     'Articles, infographics, audio summaries, podcasts, myth-busting guides.',
    icon:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    newUrl:   '/admin/content-manager/editor?type=resource',
    listUrl:  '/admin/content-manager?filter=resource',
    color:    'var(--color-brand-400)',
    bgColor:  'var(--color-brand-50)',
  },
  {
    id:       'ngo',
    label:    'NGO Directory',
    desc:     'NGOs and support organisations providing maternal health services.',
    icon:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    newUrl:   '/admin/content-manager/editor?type=ngo',
    listUrl:  '/admin/content-manager?filter=ngo',
    color:    '#0369a1',
    bgColor:  '#f0f9ff',
  },
  {
    id:       'clinic',
    label:    'Clinic Directory',
    desc:     'Verified healthcare providers offering postpartum mental health support.',
    icon:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    newUrl:   '/admin/content-manager/editor?type=clinic',
    listUrl:  '/admin/content-manager?filter=clinic',
    color:    '#15803d',
    bgColor:  '#f0fdf4',
  },
];

// State 
let allContent    = [];
let filtered      = [];
let currentStatus = '';
let currentType   = '';
let currentQuery  = '';
let currentPage   = 1;
let pendingDeleteId = null;

// Boot
async function init() {
  const stored = getStoredAdmin();

  // Render chrome
  document.getElementById('sidebar-root').innerHTML = renderAdminSidebar({
    activePage: 'content-management',
    totalPending: 0,
    currentRole: stored.isSuperAdmin ? 'superadmin' : 'moderator',
  });
  document.getElementById('topbar-root').innerHTML = renderAdminTopbar({
    name: stored.name, email: stored.email,
  });
  document.getElementById('footer-root').innerHTML = renderFooter();
  initAdminNavbar();
  bindLogout();

  // Check for pre-selected filter from URL
  const params = new URLSearchParams(window.location.search);
  const urlFilter = params.get('filter');
  if (urlFilter) {
    currentType = urlFilter;
    const sel = document.getElementById('cm-type-filter');
    if (sel) sel.value = urlFilter;
  }

  // Render destination cards
  renderDestinationCards();

  // Load content
  renderTableSkeleton();
  allContent = await fetchContent();
  renderStats();
  applyFilters();
  bindControls();
}

// Data
async function fetchContent() {
  const [resourcesRes, ngosRes, clinicsRes] = await Promise.all([
    api.get('/api/v1/admin/resources'),
    api.get('/api/v1/admin/ngos'),
    api.get('/api/v1/admin/clinics'),
  ]);

  const resources = (resourcesRes?.data?.resources || []).map((item) => ({
    id: item.id,
    title: item.title,
    type: 'resource',
    status: normalizeStatus(item.status),
    updatedAt: item.updatedAt || null,
  }));

  const ngos = (ngosRes?.data?.ngos || []).map((item) => ({
    id: item.id,
    title: item.name,
    type: 'ngo',
    status: normalizeStatus(mapNgoStatusToContentStatus(item.status)),
    updatedAt: item.updatedAt || null,
  }));

  const clinics = (clinicsRes?.data?.clinics || []).map((item) => ({
    id: item.id,
    title: item.name,
    type: 'clinic',
    status: normalizeStatus(item.status),
    updatedAt: item.updatedAt || null,
  }));

  return [...resources, ...ngos, ...clinics];
}

// Destination cards 
function renderDestinationCards() {
  const grid = document.getElementById('cm-destination-grid');
  grid.innerHTML = DESTINATIONS.map((d) => {
    const count = allContent.filter((c) => c.type === d.id).length;
    return `
      <div class="cm-dest-card" style="--dest-color:${d.color};--dest-bg:${d.bgColor}">
        <div class="cm-dest-icon">${d.icon}</div>
        <div class="cm-dest-body">
          <h3 class="cm-dest-title">${d.label}</h3>
          <p class="cm-dest-desc">${d.desc}</p>
        </div>
        <div class="cm-dest-footer">
          <a href="${d.newUrl}" class="cm-dest-new-btn" aria-label="Add new ${d.label} entry">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New
          </a>
          <button class="cm-dest-import-btn" data-type="${d.id}" aria-label="Bulk import ${d.label}" disabled title="Import coming soon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Stats
function renderStats() {
  const counts = { published: 0, draft: 0, archived: 0 };
  allContent.forEach((c) => { if (counts[c.status] !== undefined) counts[c.status]++; });
  document.getElementById('stat-published').textContent = counts.published;
  document.getElementById('stat-draft').textContent     = counts.draft;
  document.getElementById('stat-archived').textContent  = counts.archived;
  renderDestinationCards(); // re-render with counts
}

// Filtering
function applyFilters() {
  const q = currentQuery.toLowerCase().trim();
  filtered = allContent.filter((c) => {
    const matchStatus = !currentStatus || c.status === currentStatus;
    const matchType   = !currentType   || c.type   === currentType;
    const matchQuery  = !q || (c.title || '').toLowerCase().includes(q);
    return matchStatus && matchType && matchQuery;
  });
  filtered.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  currentPage = 1;
  renderTable();
  renderPagination();
}

// Table
function renderTable() {
  const tbody = document.getElementById('cm-table-body');
  const empty = document.getElementById('cm-table-empty');
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  if (!page.length) {
    tbody.innerHTML = '';
    empty.hidden    = false;
    empty.textContent = currentQuery || currentStatus || currentType
      ? 'No content matches your filters.'
      : 'No content yet. Use the destination cards above to add your first entry.';
    return;
  }

  empty.hidden = true;
  tbody.innerHTML = page.map(renderTableRow).join('');
}

function renderTableRow(item) {
  const id       = item._id || item.id;
  const dest     = DESTINATIONS.find((d) => d.id === item.type) || DESTINATIONS[0];
  const date     = item.updatedAt
    ? new Date(item.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const statusCls = `cm-status-${escHtml(item.status)}`;
  const editUrl  = `/admin/content-manager/editor?type=${escHtml(item.type)}&id=${escHtml(id)}`;

  return `
    <tr class="cm-table-row" data-id="${escHtml(id)}" data-status="${escHtml(item.status)}">
      <td class="cm-td cm-td-title">
        <div class="cm-td-title-wrap">
          <span class="cm-entry-title">${escHtml(item.title || 'Untitled')}</span>
        </div>
      </td>
      <td class="cm-td">
        <span class="cm-type-badge" style="--dest-color:${dest.color};--dest-bg:${dest.bgColor}">
          ${dest.label}
        </span>
      </td>
      <td class="cm-td">
        <span class="cm-status-badge ${statusCls}">${escHtml(item.status)}</span>
      </td>
      <td class="cm-td cm-td-date">${date}</td>
      <td class="cm-td cm-td-actions">
        <div class="cm-row-actions">
          <!-- Edit -->
          <a href="${editUrl}" class="cm-action-icon" title="Edit" aria-label="Edit ${escHtml(item.title)}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </a>
          <!-- Archive / publish toggle -->
          ${item.status !== 'archived' ? `
            <button class="cm-action-icon"
              data-action="${item.status === 'published' ? 'archive' : 'publish'}"
              data-id="${escHtml(id)}"
              title="${item.status === 'published' ? 'Archive' : 'Publish'}"
              aria-label="${item.status === 'published' ? 'Archive' : 'Publish'} ${escHtml(item.title)}">
              ${item.status === 'published'
                ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>`
                : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`
              }
            </button>
          ` : `
            <button class="cm-action-icon"
              data-action="restore"
              data-id="${escHtml(id)}"
              title="Restore to draft"
              aria-label="Restore ${escHtml(item.title)} to draft">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          `}
          <!-- Delete -->
          <button class="cm-action-icon cm-action-delete"
            data-action="delete" data-id="${escHtml(id)}" data-title="${escHtml(item.title)}"
            title="Delete" aria-label="Delete ${escHtml(item.title)}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderTableSkeleton() {
  document.getElementById('cm-table-body').innerHTML = Array.from({ length: 8 }).map(() => `
    <tr class="cm-table-row" aria-hidden="true">
      <td class="cm-td"><div class="skeleton-line" style="width:200px"></div></td>
      <td class="cm-td"><div class="skeleton-line" style="width:80px;border-radius:999px"></div></td>
      <td class="cm-td"><div class="skeleton-line" style="width:70px;border-radius:999px"></div></td>
      <td class="cm-td"><div class="skeleton-line" style="width:90px"></div></td>
      <td class="cm-td"></td>
    </tr>
  `).join('');
}

function renderPagination() {
  const wrap       = document.getElementById('cm-pagination');
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (totalPages <= 1) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = `
    <nav class="pagination" aria-label="Content list pagination">
      <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>
      <div class="pagination-pages">
        ${Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => `
          <button class="pagination-page ${p === currentPage ? 'pagination-page-active' : ''}"
            data-page="${p}" ${p === currentPage ? 'aria-current="page"' : ''}>${p}</button>
        `).join('')}
      </div>
      <button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>
    </nav>
  `;
}

// Event binding
function bindControls() {
  // Status filter tabs
  document.querySelectorAll('.cm-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cm-filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatus = btn.dataset.status;
      applyFilters();
    });
  });

  // Type filter
  document.getElementById('cm-type-filter').addEventListener('change', (e) => {
    currentType = e.target.value;
    applyFilters();
  });

  // Search
  let searchTimer;
  document.getElementById('cm-search').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentQuery = e.target.value;
      applyFilters();
    }, 250);
  });

  // Table row actions (delegation)
  document.getElementById('cm-table-body').addEventListener('click', handleTableAction);

  // Pagination
  document.getElementById('cm-pagination').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    currentPage = parseInt(btn.dataset.page, 10);
    renderTable();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Import buttons
  document.getElementById('cm-destination-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.cm-dest-import-btn');
    if (!btn) return;
    triggerImport(btn.dataset.type);
  });

  // Delete modal
  document.getElementById('cm-delete-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('cm-delete-confirm').addEventListener('click', confirmDelete);
}

async function handleTableAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id, title } = btn.dataset;
  const item = allContent.find((entry) => (entry._id || entry.id) === id);
  if (!item) return;

  if (action === 'delete') {
    openDeleteModal(id, title);
    return;
  }

  btn.disabled = true;
  const statusMap = { publish: 'published', archive: 'archived', restore: 'draft' };

  try {
    if (statusMap[action]) {
      await patchItemStatus(item, statusMap[action]);
      item.status = statusMap[action];
    }
    renderStats();
    applyFilters();
  } catch (_) {
    btn.disabled = false;
  }
}

// Delete modal
function openDeleteModal(id, title) {
  pendingDeleteId = id;
  document.getElementById('cm-delete-modal-body').textContent =
    `"${title}" will be archived. You can restore it later.`;
  const modal = document.getElementById('cm-delete-modal');
  modal.hidden = false;
  document.getElementById('cm-delete-confirm').focus();
}

function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('cm-delete-modal').hidden = true;
}

async function confirmDelete() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;
  closeDeleteModal();

  const item = allContent.find((entry) => (entry._id || entry.id) === id);
  if (!item) return;

  try {
    await patchItemStatus(item, 'archived');
    item.status = 'archived';
    renderStats();
    applyFilters();
  } catch (_) { /* silently fail */ }
}

// Bulk import 
function triggerImport(type) {
  window.alert(`Import for ${type} is temporarily unavailable.`);
}

async function patchItemStatus(item, nextStatus) {
  const id = item._id || item.id;

  if (item.type === 'resource') {
    await api.patch(`/api/v1/admin/resources/${id}`, { status: nextStatus });
    return;
  }

  if (item.type === 'clinic') {
    await api.patch(`/api/v1/admin/clinics/${id}`, { status: nextStatus });
    return;
  }

  if (item.type === 'ngo') {
    await api.patch(`/api/v1/admin/ngos/${id}`, {
      status: mapContentStatusToNgoStatus(nextStatus),
    });
  }
}

function normalizeStatus(value) {
  if (value === 'published' || value === 'draft' || value === 'archived') return value;
  return 'draft';
}

function mapNgoStatusToContentStatus(status) {
  if (status === 'approved') return 'published';
  if (status === 'rejected') return 'archived';
  return 'draft';
}

function mapContentStatusToNgoStatus(status) {
  if (status === 'published') return 'approved';
  if (status === 'archived') return 'rejected';
  return 'pending';
}

// Helpers
function getStoredAdmin() {
  try { return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY)) || {}; }
  catch { return {}; }
}

function bindLogout() {
  document.querySelectorAll('[data-admin-logout]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await api.post('/api/v1/auth/logout'); } catch (_) {}
      sessionStorage.removeItem(ADMIN_USER_KEY);
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