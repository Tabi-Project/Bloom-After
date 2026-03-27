import { fetchLifestyle } from '../data/lifestyle-api.js';
import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

const ITEMS_PER_PAGE = 6;
let currentPage = 1;
let activeFilter = 'all';
let searchQuery = '';
let totalPages = 0;
let requestSequence = 0;

const grid = document.getElementById('lm-grid');
const emptyState = document.getElementById('lm-empty');
const paginationWrap = document.getElementById('pagination');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('lm-search');

document.getElementById('navbar-root').innerHTML = renderNavbar('lifestyle');
initNavbar();
document.getElementById('footer-root').innerHTML = renderFooter();

async function loadData({ resetPage = false, scrollToTop = false } = {}) {
  if (resetPage) currentPage = 1;

  const requestId = ++requestSequence;

  grid.innerHTML = Array(6).fill().map(() => `
    <div class="skeleton-card">
      <div class="skeleton-line skeleton-line-short"></div>
      <div class="skeleton-line skeleton-line-full" style="height: 28px;"></div>
      <div class="skeleton-line skeleton-line-full"></div>
      <div class="skeleton-line skeleton-line-medium"></div>
    </div>
  `).join('');

  emptyState.hidden = true;
  paginationWrap.innerHTML = '';

  try {
    const { data, pagination } = await fetchLifestyle({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      category: activeFilter === 'all' ? '' : activeFilter,
      q: searchQuery,
      published: true,
    });

    if (requestId !== requestSequence) return;

    currentPage = pagination?.currentPage || currentPage;
    totalPages = pagination?.totalPages || 0;
    processAndRender(data, scrollToTop);
  } catch (error) {
    if (requestId !== requestSequence) return;
    grid.innerHTML = '';
    emptyState.hidden = false;
    emptyState.innerHTML = `<strong>Unable to load interventions.</strong><br />${error?.message || 'Please try again shortly.'}`;
  }
}

// --- Data Processing ---
function processAndRender(items, scrollToTop) {
  if (!items.length) {
    grid.innerHTML = '';
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  grid.innerHTML = items.map(item => `
    <a href="/lifestyle/detail?id=${item.id}" class="lm-card">
      <header class="lm-card-header">
        <span class="lm-badge">${item.category}</span>
      </header>
      <div class="lm-card-body">
        <h3 class="lm-card-title">${item.title}</h3>
        <p class="lm-card-desc">${item.summary}</p>
      </div>
      <div class="lm-card-cta">Explore Strategy &rarr;</div>
    </a>
  `).join('');

  renderPagination(totalPages);

  if (scrollToTop) {
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// --- Pagination UI ---
function renderPagination(totalPages) {
  if (totalPages <= 1) return;

  let pagesHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    pagesHtml += `
      <button class="pagination-page ${i === currentPage ? 'pagination-page-active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  paginationWrap.innerHTML = `
    <nav class="pagination" aria-label="Resource pages">
      <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
        Previous
      </button>
      <div class="pagination-pages">${pagesHtml}</div>
      <button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
        Next
      </button>
    </nav>
  `;
}

// --- Events ---
filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    filterBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    activeFilter = e.target.dataset.filter;
    loadData({ resetPage: true });
  });
});

let searchTimer;
searchInput?.addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = e.target.value.toLowerCase();
      loadData({ resetPage: true });
  }, 350);
});

paginationWrap.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-page]');
  if (!btn || btn.disabled) return;
  const nextPage = Number(btn.dataset.page);
  if (!nextPage || nextPage < 1 || nextPage > totalPages) return;
  currentPage = nextPage;
  loadData({ scrollToTop: true });
});

// Initial Load
loadData();