
import {
  renderAdminSidebar,
  renderAdminTopbar,
  initAdminNavbar,
} from '../components/adminNavbar.js';
import { renderFooter } from '../components/footer.js';
import api from '../api.js';

// Type config

const TYPE_CONFIG = {
  clinic: {
    label:         'Clinics',
    singular:      'Clinic',
    subtitle:      'Review and moderate clinic recommendations submitted by the community.',
    activePageId:  'moderation-clinics',
    editPage:      '/admin/clinic/edit',
    apiEndpoint:   '/api/v1/admin/clinics',
    hasImage:      true,
    hasLink:       true,
    mockItems:     mockClinics(),
  },
  specialist: {
    label:         'Specialist Onboarding',
    singular:      'Specialist',
    subtitle:      'Review specialists submitted for listing on the platform.',
    activePageId:  'specialists-onboarding',
    editPage:      '/admin/specialist/edit',
    apiEndpoint:   '/api/v1/admin/specialists',
    hasImage:      true,
    hasLink:       false,
    mockItems:     mockSpecialists(),
  },
  media: {
    label:         'Media Suggestions',
    singular:      'Media',
    subtitle:      'Review podcasts, articles, and media resources suggested by the community.',
    activePageId:  'media-suggestions',
    editPage:      '/admin/media/edit',
    apiEndpoint:   '/api/v1/admin/media',
    hasImage:      true,
    hasLink:       true,
    mockItems:     mockMedia(),
  },
  request: {
    label:         'Other Requests',
    singular:      'Request',
    subtitle:      'Review partnership requests, resource submissions, and other enquiries.',
    activePageId:  'moderation-other',
    editPage:      '/admin/moderation?type=request',
    apiEndpoint:   '/api/v1/admin/requests',
    hasImage:      false,
    hasLink:       false,
    mockItems:     mockRequests(),
  },
};

// Mock data

function mockClinics() {
  return [
    { id: 'c1', title: 'Grace Medical Centre', description: 'Excellent postpartum care in Lagos Island. Staff are very empathetic and experienced with PPD cases.', email: 'grace@example.com', location: 'Lagos, Nigeria', link: 'https://gracemedical.ng', image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&q=60', status: 'pending',  submittedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'c2', title: 'Safe Haven Clinic',    description: 'Specialist postpartum mental health clinic in Abuja. Offers both in-person and virtual sessions.', email: 'info@safehaven.ng', location: 'Abuja, Nigeria', link: 'https://safehaven.ng', image_url: null, status: 'pending',  submittedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'c3', title: 'Bloom Wellness Ibadan', description: 'Community-based wellness centre with a dedicated mothers unit.', email: null, location: 'Ibadan, Nigeria', link: null, image_url: null, status: 'approved', submittedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  ];
}

function mockSpecialists() {
  return [
    { id: 's1', title: 'Dr. Funmi Adeyemi',  description: 'Perinatal psychiatrist with 12 years experience. Based in Lagos. Available for in-person and virtual consultations.', email: 'funmi@example.com', speciality: 'Perinatal Psychiatry', image_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=60', status: 'pending',  submittedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 's2', title: 'Dr. Chidi Nwosu',    description: 'Clinical psychologist specialising in maternal mental health and CBT for postpartum anxiety.', email: 'chidi@example.com', speciality: 'Clinical Psychology', image_url: null, status: 'pending',  submittedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 's3', title: 'Dr. Amaka Okafor',   description: 'Obstetrician with a strong focus on mental health screening during and after pregnancy.', email: null, speciality: 'Obstetrics', image_url: null, status: 'rejected', submittedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  ];
}

function mockMedia() {
  return [
    { id: 'm1', title: 'Motherhood Unfiltered — Ep. 12',  description: 'Podcast episode covering lived experiences of PPD in West Africa. Very raw and relatable.', email: 'nkechi@example.com', link: 'https://spotify.com/motherhood', image_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&q=60', mediaType: 'Podcast',  status: 'pending',  submittedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'm2', title: 'The Invisible Weight — Article',  description: 'Long-form article on postpartum depression stigma in Nigerian culture published in The Guardian Nigeria.', email: null, link: 'https://guardian.ng/invisible-weight', image_url: null, mediaType: 'Article',  status: 'pending',  submittedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'm3', title: 'After Baby — Documentary',        description: 'Short documentary following four mothers through their PPD journeys. Beautifully made.', email: 'tolu@example.com', link: 'https://youtube.com/afterbaby', image_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&q=60', mediaType: 'Video',    status: 'approved', submittedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  ];
}

function mockRequests() {
  return [
    { id: 'r1', title: 'Partnership — Postpartum Support International', description: 'We are a global NGO supporting mothers with PPD. We would love to partner with Bloom After to expand our reach in West Africa.', email: 'admin@ppsi.org', status: 'pending',  submittedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'r2', title: 'Resource submission — Peer support guide',        description: 'I have written a practical guide for peer supporters working with PPD mothers. Happy to share it freely.', email: 'ada@example.com', status: 'pending',  submittedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'r3', title: 'Speaking request',                                description: 'Requesting that Bloom After participate in our maternal health conference in Accra, November 2026.', email: 'events@maternalhealth.org', status: 'approved', submittedAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  ];
}

// Constants

const PAGE_SIZE     = 15;
const ADMIN_USER_KEY = 'adminUser';

// State

let allItems      = [];
let filtered      = [];
let currentStatus = '';
let currentQuery  = '';
let currentPage   = 1;
let cfg           = null;

// Boot

async function init() {
  const params = new URLSearchParams(window.location.search);
  const type   = params.get('type') || 'clinic';
  cfg = TYPE_CONFIG[type] || TYPE_CONFIG.clinic;

  const stored = (() => {
    try { return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY)) || {}; }
    catch { return {}; }
  })();

  // Sidebar + topbar
  document.getElementById('sidebar-root').innerHTML = renderAdminSidebar({
    activePage: cfg.activePageId,
    totalPending: 0,
    currentRole: stored.isSuperAdmin ? 'superadmin' : 'moderator',
  });
  document.getElementById('topbar-root').innerHTML = renderAdminTopbar({
    name: stored.name, email: stored.email,
  });
  document.getElementById('footer-root').innerHTML = renderFooter();

  initAdminNavbar();
  bindLogout();

  // Page header
  document.getElementById('mod-list-header').innerHTML = `
    <div class="mod-page-header">
      <div>
        <h1 class="mod-page-title">${cfg.label}</h1>
        <p class="mod-page-subtitle">${cfg.subtitle}</p>
      </div>
      <div id="mod-header-stats" class="mod-header-stats" aria-live="polite"></div>
    </div>
  `;

  // Load items
  renderSkeleton();
  allItems = await fetchItems();
  applyFilters();
  bindControls();
}

// Data

async function fetchItems() {
  try {
    const res = await api.get(cfg.apiEndpoint);
    const data = res?.data?.items || res?.data?.data || res?.data || [];
    if (Array.isArray(data) && data.length) return data;
  } catch (_) { /* fall through */ }
  return cfg.mockItems;
}

// ── Filter & sort ─────────────────────────────────────────────────────────────

function applyFilters() {
  const q = currentQuery.toLowerCase().trim();
  filtered = allItems.filter((item) => {
    const matchStatus = !currentStatus || item.status === currentStatus;
    const matchQuery  = !q || [
      item.title || '', item.description || '', item.email || '',
    ].some((f) => f.toLowerCase().includes(q));
    return matchStatus && matchQuery;
  });
  filtered.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
  currentPage = 1;
  renderList();
  renderStats();
  renderPagination();
}

//  Rendering

function renderStats() {
  const counts = { pending: 0, approved: 0, rejected: 0 };
  allItems.forEach((s) => { if (counts[s.status] !== undefined) counts[s.status]++; });
  document.getElementById('mod-header-stats').innerHTML = `
    <span class="mod-stat-pill mod-stat-pending">${counts.pending} pending</span>
    <span class="mod-stat-pill mod-stat-approved">${counts.approved} approved</span>
    <span class="mod-stat-pill mod-stat-rejected">${counts.rejected} rejected</span>
  `;
}

function renderList() {
  const list  = document.getElementById('mod-list');
  const empty = document.getElementById('mod-empty');
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  if (!page.length) {
    list.innerHTML = '';
    empty.hidden = false;
    empty.textContent = currentQuery || currentStatus
      ? 'No submissions match your search or filter.'
      : 'No submissions yet.';
    return;
  }

  empty.hidden = true;
  list.innerHTML = page.map(renderSubmissionCard).join('');
}

function renderSubmissionCard(item) {
  const id      = item._id || item.id;
  const date    = item.submittedAt
    ? new Date(item.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const imgHtml = cfg.hasImage && item.image_url
    ? `<img src="${escHtml(item.image_url)}" alt="" class="mod-sub-thumb" loading="lazy" />`
    : cfg.hasImage
    ? `<div class="mod-sub-thumb mod-sub-thumb-placeholder" aria-hidden="true"></div>`
    : '';

  const linkHtml = cfg.hasLink && item.link
    ? `<a href="${escHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="mod-sub-link">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        View link
      </a>`
    : '';

  const emailHtml = item.email
    ? `<span class="mod-sub-email">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
        ${escHtml(item.email)}
      </span>`
    : '';

  // Type-specific extra field
  let extraHtml = '';
  if (item.speciality) extraHtml = `<span class="mod-sub-tag">${escHtml(item.speciality)}</span>`;
  if (item.mediaType)  extraHtml = `<span class="mod-sub-tag">${escHtml(item.mediaType)}</span>`;
  if (item.location)   extraHtml += `<span class="mod-sub-tag">${escHtml(item.location)}</span>`;

  return `
    <article class="mod-submission-card" data-id="${escHtml(id)}" data-status="${escHtml(item.status)}">
      ${imgHtml}
      <div class="mod-sub-body">
        <div class="mod-sub-top">
          <div class="mod-sub-meta">
            <span class="mod-sub-title">${escHtml(item.title || 'Untitled')}</span>
            ${extraHtml ? `<div class="mod-sub-tags">${extraHtml}</div>` : ''}
          </div>
          <div class="mod-sub-right">
            <span class="mod-status-badge mod-status-${escHtml(item.status)}">${escHtml(item.status)}</span>
            ${date ? `<span class="mod-sub-date">${date}</span>` : ''}
          </div>
        </div>
        <p class="mod-sub-desc">${escHtml(item.description || '')}</p>
        <div class="mod-sub-footer">
          ${emailHtml}
          ${linkHtml}
        </div>
      </div>
      <div class="mod-row-actions">
        <a href="${escHtml(cfg.editPage)}?id=${escHtml(id)}" class="mod-action-btn mod-action-review">
          Review
        </a>
        ${item.status === 'pending' ? `
          <button class="mod-action-btn mod-action-approve" data-action="approve" data-id="${escHtml(id)}">Approve</button>
          <button class="mod-action-btn mod-action-reject"  data-action="reject"  data-id="${escHtml(id)}">Reject</button>
        ` : ''}
      </div>
    </article>
  `;
}

function renderSkeleton() {
  document.getElementById('mod-list').innerHTML = Array.from({ length: 5 }).map(() => `
    <div class="mod-submission-card mod-row-skeleton" aria-hidden="true">
      <div class="mod-sub-thumb skeleton-block"></div>
      <div class="mod-sub-body" style="flex:1">
        <div class="skeleton-line" style="width:40%;margin-bottom:8px"></div>
        <div class="skeleton-line" style="width:80%"></div>
        <div class="skeleton-line" style="width:60%"></div>
      </div>
    </div>
  `).join('');
}

function renderPagination() {
  const wrap       = document.getElementById('mod-pagination');
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (totalPages <= 1) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = `
    <nav class="pagination" aria-label="Submission list pagination">
      <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>
      <div class="pagination-pages">
        ${Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => `
          <button class="pagination-page ${p === currentPage ? 'pagination-page-active' : ''}" data-page="${p}" ${p === currentPage ? 'aria-current="page"' : ''}>${p}</button>
        `).join('')}
      </div>
      <button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>
    </nav>
  `;
}

// Event binding 

function bindControls() {
  // Status tabs
  document.querySelectorAll('.mod-filter-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mod-filter-tab').forEach((b) => {
        b.classList.remove('active'); b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
      currentStatus = btn.dataset.status;
      applyFilters();
    });
  });

  // Search
  let timer;
  document.getElementById('mod-search').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { currentQuery = e.target.value; applyFilters(); }, 250);
  });

  // List actions
  document.getElementById('mod-list').addEventListener('click', handleListClick);

  // Pagination
  document.getElementById('mod-pagination').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    currentPage = parseInt(btn.dataset.page, 10);
    renderList(); renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

async function handleListClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  btn.disabled = true;
  const orig = btn.textContent;
  btn.textContent = '…';
  try {
    await api.patch(`${cfg.apiEndpoint}/${id}`, {
      status: action === 'approve' ? 'approved' : 'rejected',
    });
    const item = allItems.find((s) => (s._id || s.id) === id);
    if (item) item.status = action === 'approve' ? 'approved' : 'rejected';
    applyFilters();
  } catch (_) {
    btn.disabled = false;
    btn.textContent = orig;
  }
}

function bindLogout() {
  document.querySelectorAll('[data-admin-logout]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await api.post('/api/v1/auth/logout'); } catch (_) {}
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