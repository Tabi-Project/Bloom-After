import { interventions } from '../data/lifestyle.js';
import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

const ITEMS_PER_PAGE = 6;
let currentPage = 1;
let activeFilter = 'all';
let searchQuery = '';

const grid = document.getElementById('lm-grid');
const emptyState = document.getElementById('lm-empty');
const paginationWrap = document.getElementById('pagination');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('lm-search');

document.getElementById('navbar-root').innerHTML = renderNavbar('lifestyle');
initNavbar();
document.getElementById('footer-root').innerHTML = renderFooter();

// --- Loading Simulation ---
function loadData(scrollToTop = false) {
  // Show skeletons
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

  // Simulate network latency for a smooth app feel
  setTimeout(() => {
    processAndRender(scrollToTop);
  }, 400);
}

// --- Data Processing ---
function processAndRender(scrollToTop) {
  // Filter
  const filtered = interventions.filter(item => {
    const matchesCategory = activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery) || item.summary.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Check Empty
  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.hidden = false;
    return;
  }

  // Paginate
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Render Grid (Icons removed!)
  grid.innerHTML = paginatedItems.map(item => `
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
    currentPage = 1;
    loadData();
  });
});

let searchTimer;
searchInput?.addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = e.target.value.toLowerCase();
    currentPage = 1;
    loadData();
  }, 350);
});

paginationWrap.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-page]');
  if (!btn || btn.disabled) return;
  currentPage = Number(btn.dataset.page);
  loadData(true);
});

// Initial Load
loadData();