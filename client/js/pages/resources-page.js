import { fetchResources } from '../data/resources.js';
import { createResourceCard, createSkeletonCard } from '../components/resourceCard.js';
import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

const ITEMS_PER_PAGE = 9;

let allResources = [];
let filteredResources = [];
let currentPage = 1;
let activeFilter = '';
let searchQuery = '';

const grid           = document.getElementById('resources-grid');
const emptyState     = document.getElementById('resources-empty');
const paginationWrap = document.getElementById('pagination');
const searchInput    = document.getElementById('search-input');
const filterBtns     = document.querySelectorAll('[data-filter]');

async function init() {
  document.getElementById('navbar-root').innerHTML = renderNavbar('resources');
  initNavbar();
  document.getElementById('footer-root').innerHTML = renderFooter();

  showSkeletons();

  allResources = await fetchResources();
  filteredResources = [...allResources];

  renderPage();
  bindEvents();
}

function showSkeletons() {
  grid.innerHTML = Array(ITEMS_PER_PAGE).fill(null).map(() => createSkeletonCard()).join('');
  grid.setAttribute('aria-busy', 'true');
}

function applyFilters() {
  filteredResources = allResources.filter(r => {
    const matchesFilter = !activeFilter || r.content_type === activeFilter;
    const matchesSearch = !searchQuery ||
      r.title.toLowerCase().includes(searchQuery) ||
      r.summary.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  currentPage = 1;
  renderPage();
}

function getPageSlice() {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  return filteredResources.slice(start, start + ITEMS_PER_PAGE);
}

function getTotalPages() {
  return Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
}

function renderPage() {
  const slice = getPageSlice();
  const totalPages = getTotalPages();

  grid.removeAttribute('aria-busy');

  if (filteredResources.length === 0) {
    grid.innerHTML = '';
    emptyState.hidden = false;
    paginationWrap.innerHTML = '';
    return;
  }

  emptyState.hidden = true;
  grid.innerHTML = slice.map(r => createResourceCard(r)).join('');
  renderPagination(totalPages);

  if (currentPage > 1) {
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    paginationWrap.innerHTML = '';
    return;
  }

  const pages = buildPageNumbers(currentPage, totalPages);

  paginationWrap.innerHTML = `
    <nav class="pagination" aria-label="Resource pages">
      <button
        class="pagination-btn pagination-btn--prev"
        data-page="${currentPage - 1}"
        ${currentPage === 1 ? 'disabled aria-disabled="true"' : ''}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Previous
      </button>

      <div class="pagination-pages" role="list">
        ${pages.map(p => {
          if (p === '...') {
            return `<span class="pagination-ellipsis" aria-hidden="true">...</span>`;
          }
          return `
            <button
              class="pagination-page ${p === currentPage ? 'pagination-page-active' : ''}"
              data-page="${p}"
              aria-label="Page ${p}"
              ${p === currentPage ? 'aria-current="page"' : ''}
              role="listitem"
            >${p}</button>
          `;
        }).join('')}
      </div>

      <button
        class="pagination-btn pagination-btn--next"
        data-page="${currentPage + 1}"
        ${currentPage === totalPages ? 'disabled aria-disabled="true"' : ''}
        aria-label="Next page"
      >
        Next
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </nav>
  `;
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}

/* Events */
function bindEvents() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = searchInput.value.trim().toLowerCase();
      applyFilters();
    }, 350);
  });

  paginationWrap.addEventListener('click', e => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    currentPage = Number(btn.dataset.page);
    renderPage();
  });
}

init();