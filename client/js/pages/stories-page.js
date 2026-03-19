import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { createStoryCard, createSkeletonCard } from '../components/storyCard.js';
import { icons } from '../components/icons.js';
import { getMockStories } from '../data/stories.js';

const ITEMS_PER_PAGE = 9;
const API_URL = '/api/v1/stories?status=approved';

let allStories      = [];
let filteredStories = [];
let currentPage     = 1;
let activeFilter    = '';
let searchQuery     = '';

const grid           = document.getElementById('stories-grid');
const emptyState     = document.getElementById('stories-empty');
const paginationWrap = document.getElementById('pagination');
const searchInput    = document.getElementById('search-input');

// dropdown elements are looked up inside init() to ensure DOM is ready
let filterToggle;
let filterMenu;
let filterBadge;
let filterBtns = [];

async function fetchStories() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Network response not ok');
    const json = await res.json();
    const data = json.data ?? [];
    if (Array.isArray(data) && data.length > 0) return data;
    // fallback to local mock stories during development
    return await getMockStories();
  } catch (err) {
    // network or other error — use mock stories so UI stays functional
    return await getMockStories();
  }
}

async function init() {
  document.getElementById('navbar-root').innerHTML  = renderNavbar('stories');
  initNavbar();
  document.getElementById('footer-root').innerHTML  = renderFooter();

  // Inject filter icon from icons.js
  document.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.dataset.icon;
    if (icons[name]) { el.innerHTML = icons[name]; el.setAttribute('aria-hidden', 'true'); }
  });

  filterToggle = document.getElementById('filter-toggle');
  filterMenu   = document.getElementById('filter-menu');
  filterBadge  = document.getElementById('filter-active-badge');
  filterBtns   = filterMenu ? filterMenu.querySelectorAll('[data-filter]') : [];

  showSkeletons();

  allStories      = await fetchStories();
  filteredStories = [...allStories];

  renderPage();
  bindEvents();
}

function showSkeletons() {
  grid.innerHTML = Array(ITEMS_PER_PAGE).fill(null).map(() => createSkeletonCard()).join('');
  grid.setAttribute('aria-busy', 'true');
}

function applyFilters() {
  filteredStories = allStories.filter(s => {
    const helped = s.what_helped ?? [];
    const storyText = (s.story_text ?? s.story ?? '').replace(/<[^>]+>/g, ' ').toLowerCase();
    const matchesFilter = !activeFilter || helped.includes(activeFilter);
    const matchesSearch = !searchQuery ||
      storyText.includes(searchQuery) ||
      (s.name     ?? '').toLowerCase().includes(searchQuery) ||
      (s.location ?? '').toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  currentPage = 1;
  renderPage();
}

function getPageSlice() {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  return filteredStories.slice(start, start + ITEMS_PER_PAGE);
}

function getTotalPages() {
  return Math.ceil(filteredStories.length / ITEMS_PER_PAGE);
}

function renderPage() {
  const slice      = getPageSlice();
  const totalPages = getTotalPages();

  grid.removeAttribute('aria-busy');

  if (filteredStories.length === 0) {
    grid.innerHTML       = '';
    emptyState.hidden    = false;
    paginationWrap.innerHTML = '';
    return;
  }

  emptyState.hidden = true;
  grid.innerHTML    = slice.map(s => createStoryCard(s)).join('');
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
    <nav class="pagination" aria-label="Story pages">
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
          if (p === '...') return `<span class="pagination-ellipsis" aria-hidden="true">...</span>`;
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

function closeDropdown() {
  if (!filterMenu) return;
  filterMenu.hidden = true;
  filterToggle?.setAttribute('aria-expanded', 'false');
}

function bindEvents() {
  // Dropdown toggle
  filterToggle?.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = filterMenu.hidden === false;
    filterMenu.hidden = isOpen;
    filterToggle.setAttribute('aria-expanded', String(!isOpen));
  });

  // Close on outside click or Escape
  document.addEventListener('click', closeDropdown);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDropdown(); });
  filterMenu?.addEventListener('click', e => e.stopPropagation());

  // Filter selection
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeFilter = btn.dataset.filter;

      // Update badge on toggle button
      if (filterBadge) {
        if (activeFilter) {
          filterBadge.textContent = btn.textContent.trim();
          filterBadge.hidden = false;
          filterToggle.classList.add('filter-dropdown-toggle--active');
        } else {
          filterBadge.hidden = true;
          filterToggle.classList.remove('filter-dropdown-toggle--active');
        }
      }

      closeDropdown();
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
