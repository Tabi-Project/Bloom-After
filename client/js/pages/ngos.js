import { fetchNGOs } from '../data/ngos.js';
import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { icons } from '../components/icons.js';

const ITEMS_PER_PAGE = 6;

let currentPage = 1;
let activeFilter = "";
let searchQuery = "";
let allNGOs = [];
let filteredNGOs = [];

const DOM = {
  grid: document.getElementById("ngo-grid"),
  emptyState: document.getElementById("ngo-empty"),
  errorState: document.getElementById("ngo-error"),
  paginationWrap: document.getElementById("pagination"),
  searchInput: document.getElementById("search-input"),
  filterBtns: document.querySelectorAll("[data-filter]"),
  
  modalOverlay: document.getElementById("submission-modal"),
  btnOpenModal: document.getElementById("btn-open-modal"),
  btnCloseModal: document.getElementById("close-modal"),
  ngoForm: document.getElementById("ngo-submit-form"),
  formContainer: document.getElementById("modal-form-container"),
  successState: document.getElementById("modal-success-state"),
  btnRetry: document.getElementById("btn-retry")
};

async function init() {
  document.getElementById("navbar-root").innerHTML = renderNavbar("ngos");
  if (typeof initNavbar === "function") initNavbar();
  document.getElementById("footer-root").innerHTML = renderFooter();

  bindEvents();
  await loadInitialData();
}

async function loadInitialData() {
  DOM.grid.innerHTML = '<div class="skeleton-card"><div class="skeleton-avatar"></div><div class="skeleton-lines"><div class="skeleton-line medium"></div><div class="skeleton-line short"></div></div></div>'.repeat(3);
  
  try {
    allNGOs = await fetchNGOs();
    applyFiltersAndRender({ resetPage: true });
  } catch (error) {
    showError("We could not load the directory right now. Please try again.");
  }
}

function applyFiltersAndRender({ resetPage = false, scrollToGrid = false } = {}) {
  if (resetPage) currentPage = 1;

  filteredNGOs = allNGOs.filter(ngo => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchQuery) || 
                          ngo.geographic_coverage.toLowerCase().includes(searchQuery) ||
                          ngo.services.join(' ').toLowerCase().includes(searchQuery) ||
                          ngo.mission.toLowerCase().includes(searchQuery) ||
                          ngo.focus_areas.toLowerCase().includes(searchQuery);
    
    const matchesFilter = activeFilter === "" || ngo.focus_areas.toLowerCase().includes(activeFilter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  renderPage({ scrollToGrid });
}

function renderPage({ scrollToGrid = false } = {}) {
  DOM.emptyState.hidden = true;
  DOM.errorState.hidden = true;

  if (filteredNGOs.length === 0) {
    DOM.grid.innerHTML = "";
    DOM.emptyState.hidden = false;
    DOM.paginationWrap.innerHTML = "";
    return;
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredNGOs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredNGOs.length / ITEMS_PER_PAGE);

  DOM.grid.innerHTML = paginatedItems.map(ngo => createNGOCard(ngo)).join("");
  renderPagination(totalPages);

  if (scrollToGrid) {
    DOM.grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function createNGOCard(ngo) {
  const servicesText = ngo.services.join(', ');
  
  return `
    <article class="ngo-card">
      <div class="ngo-card-image-wrapper">
        <img src="${ngo.cover_image}" alt="Cover photo for ${ngo.name}" class="ngo-card-image" loading="lazy">
        <div class="ngo-card-badges">
          <span class="badge-coverage">${ngo.geographic_coverage}</span>
        </div>
      </div>
      
      <div class="ngo-card-body">
        <h3 class="ngo-card-title">${ngo.name}</h3>
        <p class="ngo-card-mission">${ngo.mission}</p>
        
        <ul class="ngo-contact-list">
          <li class="ngo-contact-item">
            <span class="ngo-icon">${icons.phone}</span> 
            <a href="tel:${ngo.contact.phone.replace(/\s+/g, '')}">${ngo.contact.phone}</a>
          </li>
          <li class="ngo-contact-item">
            <span class="ngo-icon">${icons.email}</span> 
            <a href="mailto:${ngo.contact.email}">${ngo.contact.email}</a>
          </li>
          <li class="ngo-contact-item">
            <span class="ngo-icon">${icons.link}</span> 
            <a href="${ngo.website}" target="_blank" rel="noopener noreferrer">Visit Website</a>
          </li>
        </ul>
      </div>
      
      <div class="ngo-card-footer">
        <div class="ngo-stat">
          <span class="ngo-stat-label">Focus</span>
          <span class="ngo-stat-value">${ngo.focus_areas}</span>
        </div>
        <div class="ngo-stat text-right">
          <span class="ngo-stat-label">Services</span>
          <span class="ngo-stat-value services-text">${servicesText}</span>
        </div>
      </div>
    </article>
  `;
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    DOM.paginationWrap.innerHTML = "";
    return;
  }

  const pages = buildPageNumbers(currentPage, totalPages);

  DOM.paginationWrap.innerHTML = `
    <nav class="pagination" aria-label="NGO pages">
      <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled aria-disabled="true"' : ''}>
        Previous
      </button>
      <div class="pagination-pages" role="list">
        ${pages.map(p => p === "..." 
          ? `<span class="pagination-ellipsis" aria-hidden="true">...</span>` 
          : `<button class="pagination-page ${p === currentPage ? "pagination-page-active" : ""}" 
                    data-page="${p}" 
                    ${p === currentPage ? 'aria-current="page"' : ''}>${p}</button>`
        ).join('')}
      </div>
      <button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled aria-disabled="true"' : ''}>
        Next
      </button>
    </nav>
  `;
}

function showError(message) {
  DOM.grid.innerHTML = "";
  DOM.emptyState.hidden = true;
  DOM.errorState.hidden = false;
  DOM.errorState.querySelector('.error-card-message').textContent = message;
}

function openModal() {
  DOM.modalOverlay.classList.add("active");
  DOM.modalOverlay.setAttribute("aria-hidden", "false");
  DOM.formContainer.hidden = false;
  DOM.successState.hidden = true;
  DOM.ngoForm.reset();
}

function closeModal() {
  DOM.modalOverlay.classList.remove("active");
  DOM.modalOverlay.setAttribute("aria-hidden", "true");
}

function bindEvents() {
  DOM.filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      DOM.filterBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      activeFilter = btn.dataset.filter || "";
      applyFiltersAndRender({ resetPage: true });
    });
  });

  let searchTimer;
  DOM.searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = DOM.searchInput.value.trim().toLowerCase();
      applyFiltersAndRender({ resetPage: true });
    }, 350);
  });

  DOM.paginationWrap.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-page]");
    if (!btn || btn.disabled) return;
    const nextPage = Number(btn.dataset.page);
    if (!nextPage) return;
    currentPage = nextPage;
    applyFiltersAndRender({ scrollToGrid: true });
  });

  DOM.btnOpenModal.addEventListener("click", openModal);
  DOM.btnCloseModal.addEventListener("click", closeModal);
  DOM.modalOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.modalOverlay) closeModal();
  });

  if (DOM.btnRetry) {
    DOM.btnRetry.addEventListener("click", () => window.location.reload());
  }

  DOM.ngoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const btnSubmit = DOM.ngoForm.querySelector("button[type='submit']");
    btnSubmit.textContent = "Submitting...";
    btnSubmit.disabled = true;

    setTimeout(() => {
      DOM.formContainer.hidden = true;
      DOM.successState.hidden = false;
      btnSubmit.textContent = "Submit for Review";
      btnSubmit.disabled = false;
    }, 800);
  });
}

init();