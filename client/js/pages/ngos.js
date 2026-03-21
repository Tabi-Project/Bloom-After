import { fetchNgos, submitNgo } from '../data/ngos-api.js';
import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { icons } from '../components/icons.js';

const ITEMS_PER_PAGE = 6;

let currentPage = 1;
let activeFilter = "";
let searchQuery = "";
let currentTotalPages = 0;
let requestSequence = 0;
let inFlightController = null;

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
  btnRetry: document.getElementById("btn-retry"),
  submitBtn: document.querySelector("#ngo-submit-form button[type='submit']"),
};

async function init() {
  document.getElementById("navbar-root").innerHTML = renderNavbar("ngos");
  if (typeof initNavbar === "function") initNavbar();
  document.getElementById("footer-root").innerHTML = renderFooter();

  bindEvents();
  await loadInitialData();
}

async function loadInitialData() {
  await loadNgos({ resetPage: true });
}

async function loadNgos({ resetPage = false, scrollToGrid = false } = {}) {
  if (resetPage) currentPage = 1;
  const requestId = ++requestSequence;

  if (inFlightController) {
    inFlightController.abort();
  }

  inFlightController = new AbortController();
  showSkeletons();

  try {
    const { data, pagination } = await fetchNgos(
      {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        q: searchQuery,
        focus: activeFilter,
        status: 'approved',
      },
      { signal: inFlightController.signal },
    );

    if (requestId !== requestSequence) return;

    currentPage = pagination?.currentPage || currentPage;
    currentTotalPages = pagination?.totalPages || 0;
    renderPage(data, { scrollToGrid });
  } catch (error) {
    if (error?.name === 'AbortError') return;
    if (requestId !== requestSequence) return;
    showError(error?.message || 'We could not load the directory right now. Please try again.');
  }
}

function showSkeletons() {
  DOM.grid.innerHTML = '<div class="skeleton-card"><div class="skeleton-avatar"></div><div class="skeleton-lines"><div class="skeleton-line medium"></div><div class="skeleton-line short"></div></div></div>'.repeat(ITEMS_PER_PAGE);
  DOM.grid.setAttribute('aria-busy', 'true');
  DOM.emptyState.hidden = true;
  DOM.errorState.hidden = true;
  DOM.paginationWrap.innerHTML = '';
}

function renderPage(ngos, { scrollToGrid = false } = {}) {
  DOM.grid.removeAttribute('aria-busy');
  DOM.emptyState.hidden = true;
  DOM.errorState.hidden = true;

  if (!ngos.length) {
    DOM.grid.innerHTML = "";
    DOM.emptyState.hidden = false;
    DOM.paginationWrap.innerHTML = "";
    return;
  }

  DOM.grid.innerHTML = ngos.map(ngo => createNGOCard(ngo)).join("");
  renderPagination(currentTotalPages);

  if (scrollToGrid) {
    DOM.grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function createNGOCard(ngo) {
  const servicesText = Array.isArray(ngo.services) && ngo.services.length
    ? ngo.services.join(', ')
    : 'Not specified';
  const focusText = ngo.focus_areas || (Array.isArray(ngo.focus_tags) ? ngo.focus_tags.join(', ') : '') || 'General support';
  const coverageText = ngo.geographic_coverage || 'Coverage not specified';
  const phone = ngo.contact?.phone || '';
  const email = ngo.contact?.email || '';
  const website = ngo.website || '#';
  const image = ngo.cover_image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80';
  
  return `
    <article class="ngo-card">
      <div class="ngo-card-image-wrapper">
        <img src="${image}" alt="Cover photo for ${ngo.name}" class="ngo-card-image" loading="lazy">
        <div class="ngo-card-badges">
          <span class="badge-coverage">${coverageText}</span>
        </div>
      </div>
      
      <div class="ngo-card-body">
        <h3 class="ngo-card-title">${ngo.name}</h3>
        <p class="ngo-card-mission">${ngo.mission}</p>
        
        <ul class="ngo-contact-list">
          <li class="ngo-contact-item">
            <span class="ngo-icon">${icons.phone}</span> 
            ${phone ? `<a href="tel:${phone.replace(/\s+/g, '')}">${phone}</a>` : '<span>Not available</span>'}
          </li>
          <li class="ngo-contact-item">
            <span class="ngo-icon">${icons.email}</span> 
            ${email ? `<a href="mailto:${email}">${email}</a>` : '<span>Not available</span>'}
          </li>
          <li class="ngo-contact-item">
            <span class="ngo-icon">${icons.link}</span> 
            ${website && website !== '#' ? `<a href="${website}" target="_blank" rel="noopener noreferrer">Visit Website</a>` : '<span>Not available</span>'}
          </li>
        </ul>
      </div>
      
      <div class="ngo-card-footer">
        <div class="ngo-stat">
          <span class="ngo-stat-label">Focus</span>
          <span class="ngo-stat-value">${focusText}</span>
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
  DOM.grid.removeAttribute('aria-busy');
  DOM.emptyState.hidden = true;
  DOM.errorState.hidden = false;
  DOM.errorState.querySelector('.error-card-message').textContent = message;
}

function getOrCreateFormErrorNode() {
  let errorNode = DOM.ngoForm.querySelector('#ngo-submit-error');
  if (!errorNode) {
    errorNode = document.createElement('p');
    errorNode.id = 'ngo-submit-error';
    errorNode.className = 'error-card-message';
    errorNode.setAttribute('role', 'alert');
    DOM.ngoForm.appendChild(errorNode);
  }
  return errorNode;
}

function setSubmitLoading(isLoading) {
  if (!DOM.submitBtn) return;
  DOM.submitBtn.disabled = isLoading;
  DOM.submitBtn.textContent = isLoading ? 'Submitting...' : 'Submit for Review';
}

function clearFormError() {
  const errorNode = DOM.ngoForm.querySelector('#ngo-submit-error');
  if (errorNode) {
    errorNode.textContent = '';
  }
}

function showFormError(message) {
  const errorNode = getOrCreateFormErrorNode();
  errorNode.textContent = message;
}

function openModal() {
  DOM.modalOverlay.classList.add("active");
  DOM.modalOverlay.setAttribute("aria-hidden", "false");
  DOM.formContainer.hidden = false;
  DOM.successState.hidden = true;
  DOM.ngoForm.reset();
  clearFormError();
}

function closeModal() {
  DOM.modalOverlay.classList.remove("active");
  DOM.modalOverlay.setAttribute("aria-hidden", "true");
}

function bindEvents() {
  DOM.filterBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      DOM.filterBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      activeFilter = btn.dataset.filter || "";
      await loadNgos({ resetPage: true });
    });
  });

  let searchTimer;
  DOM.searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      searchQuery = DOM.searchInput.value.trim();
      await loadNgos({ resetPage: true });
    }, 350);
  });

  DOM.paginationWrap.addEventListener("click", async (event) => {
    const btn = event.target.closest("[data-page]");
    if (!btn || btn.disabled) return;
    const nextPage = Number(btn.dataset.page);
    if (!nextPage || nextPage < 1 || nextPage > currentTotalPages) return;
    currentPage = nextPage;
    await loadNgos({ scrollToGrid: true });
  });

  DOM.btnOpenModal.addEventListener("click", openModal);
  DOM.btnCloseModal.addEventListener("click", closeModal);
  DOM.modalOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.modalOverlay) closeModal();
  });

  if (DOM.btnRetry) {
    DOM.btnRetry.addEventListener("click", async () => {
      await loadNgos();
    });
  }

  DOM.ngoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearFormError();
    const nameInput = document.getElementById('ngo-name');
    const linkInput = document.getElementById('ngo-link');
    const name = nameInput?.value?.trim() || '';
    const website = linkInput?.value?.trim() || '';

    if (!name || !website) {
      showFormError('Please enter the organisation name and website link.');
      return;
    }

    setSubmitLoading(true);

    try {
      await submitNgo({ name, website });
      DOM.formContainer.hidden = true;
      DOM.successState.hidden = false;
    } catch (error) {
      showFormError(error?.message || 'Could not submit right now. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  });
}

init();