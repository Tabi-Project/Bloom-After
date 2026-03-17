import { fetchNGOs } from '../data/ngos.js';
import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

const ITEMS_PER_PAGE = 6;

let currentPage = 1;
let activeFilter = "";
let searchQuery = "";
let allNGOs = [];
let filteredNGOs = [];

const DOM = {
  grid: document.getElementById("ngo-grid"),
  emptyState: document.getElementById("ngo-empty"),
  paginationWrap: document.getElementById("pagination"),
  searchInput: document.getElementById("search-input"),
  filterBtns: document.querySelectorAll("[data-filter]"),
  
  modalOverlay: document.getElementById("submission-modal"),
  btnOpenModal: document.getElementById("btn-open-modal"),
  btnCloseModal: document.getElementById("close-modal"),
  ngoForm: document.getElementById("ngo-submit-form"),
  formContainer: document.getElementById("modal-form-container"),
  successState: document.getElementById("modal-success-state")
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
  if (filteredNGOs.length === 0) {
    DOM.grid.innerHTML = "";
    DOM.emptyState.hidden = false;
    DOM.paginationWrap.innerHTML = "";
    return;
  }

  DOM.emptyState.hidden = true;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredNGOs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredNGOs.length / ITEMS_PER_PAGE);

  DOM.grid.innerHTML = paginatedItems.map(ngo => createNGOCard(ngo)).join("");
  renderPagination(totalPages);

  if (scrollToGrid ) {
    DOM.grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function createNGOCard(ngo) {
  const servicesText = ngo.services.join(', ');
  
  const phoneIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
  const mailIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const linkIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

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
            <span class="ngo-icon">${phoneIcon}</span> 
            <a href="tel:${ngo.contact.phone.replace(/\s+/g, '')}">${ngo.contact.phone}</a>
          </li>
          <li class="ngo-contact-item">
            <span class="ngo-icon">${mailIcon}</span> 
            <a href="mailto:${ngo.contact.email}">${ngo.contact.email}</a>
          </li>
          <li class="ngo-contact-item">
            <span class="ngo-icon">${linkIcon}</span> 
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

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    DOM.paginationWrap.innerHTML = "";
    return;
  }

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  DOM.paginationWrap.innerHTML = `
    <nav class="pagination" aria-label="NGO pages">
      <button class="pagination-btn pagination-btn--prev" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled aria-disabled="true"' : ''}>Previous</button>
      <div class="pagination-pages" role="list">
        ${pages.map(p => `
          <button class="pagination-page ${p === currentPage ? "pagination-page-active" : ""}" data-page="${p}" ${p === currentPage ? 'aria-current="page"' : ''}>${p}</button>
        `).join('')}
      </div>
      <button class="pagination-btn pagination-btn--next" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled aria-disabled="true"' : ''}>Next</button>
    </nav>
  `;
}

function showError(message) {
  DOM.grid.innerHTML = "";
  DOM.emptyState.hidden = false;
  DOM.emptyState.innerHTML = `<strong>Error:</strong><br/>${message}`;
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
    if (e.target === DOM.modalOverlay) {
      closeModal();
    }
  });

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