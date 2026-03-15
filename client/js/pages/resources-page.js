import { fetchResources } from "../data/resources-api.js";
import { createResourceCard, createSkeletonCard } from "../components/resourceCard.js";
import { renderNavbar, initNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { renderCrisisStrip } from "../components/crisisStrip.js";

const ITEMS_PER_PAGE = 9;

let currentPage = 1;
let activeFilter = "";
let searchQuery = "";
let currentTotalPages = 0;
let requestSequence = 0;

const grid = document.getElementById("resources-grid");
const emptyState = document.getElementById("resources-empty");
const paginationWrap = document.getElementById("pagination");
const searchInput = document.getElementById("search-input");
const filterBtns = document.querySelectorAll("[data-filter]");
const crisisRoot = document.getElementById("crisis-root");

async function init() {
  document.getElementById("navbar-root").innerHTML = renderNavbar("resources");
  initNavbar();
  document.getElementById("footer-root").innerHTML = renderFooter();
  if (crisisRoot) {
    crisisRoot.innerHTML = renderCrisisStrip();
  }

  bindEvents();
  await loadResources();
}

async function loadResources({ resetPage = false, scrollToGrid = false } = {}) {
  if (resetPage) currentPage = 1;

  const requestId = ++requestSequence;
  showSkeletons();

  try {
    const { data, pagination } = await fetchResources({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      content_type: activeFilter,
      q: searchQuery,
      published: true,
    });

    if (requestId !== requestSequence) return;

    currentPage = pagination?.currentPage || currentPage;
    currentTotalPages = pagination?.totalPages || 0;
    renderPage(data, { scrollToGrid });
  } catch (error) {
    if (requestId !== requestSequence) return;
    showError(error?.message || "We could not load resources right now. Please try again.");
  }
}

function showSkeletons() {
  grid.innerHTML = Array(ITEMS_PER_PAGE)
    .fill(null)
    .map(() => createSkeletonCard())
    .join("");
  grid.setAttribute("aria-busy", "true");
  emptyState.hidden = true;
  paginationWrap.innerHTML = "";
}

function renderPage(resources, { scrollToGrid = false } = {}) {
  grid.removeAttribute("aria-busy");

  if (!resources.length) {
    grid.innerHTML = "";
    emptyState.hidden = false;
    paginationWrap.innerHTML = "";
    return;
  }

  emptyState.hidden = true;
  grid.innerHTML = resources.map((resource) => createResourceCard(resource)).join("");
  renderPagination(currentTotalPages);

  if (scrollToGrid && currentPage > 1) {
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    paginationWrap.innerHTML = "";
    return;
  }

  const pages = buildPageNumbers(currentPage, totalPages);

  paginationWrap.innerHTML = `
    <nav class="pagination" aria-label="Resource pages">
      <button
        class="pagination-btn pagination-btn--prev"
        data-page="${currentPage - 1}"
        ${currentPage === 1 ? "disabled aria-disabled=\"true\"" : ""}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Previous
      </button>

      <div class="pagination-pages" role="list">
        ${pages.map(p => {
          if (p === "...") {
            return `<span class="pagination-ellipsis" aria-hidden="true">...</span>`;
          }
          return `
            <button
              class="pagination-page ${p === currentPage ? "pagination-page-active" : ""}"
              data-page="${p}"
              aria-label="Page ${p}"
              ${p === currentPage ? "aria-current=\"page\"" : ""}
              role="listitem"
            >${p}</button>
          `;
        }).join('')}
      </div>

      <button
        class="pagination-btn pagination-btn--next"
        data-page="${currentPage + 1}"
        ${currentPage === totalPages ? "disabled aria-disabled=\"true\"" : ""}
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

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}

function showError(message) {
  grid.removeAttribute("aria-busy");
  emptyState.hidden = true;
  paginationWrap.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "resources-error";
  wrapper.setAttribute("role", "alert");

  const text = document.createElement("p");
  text.className = "resources-error-message";
  text.textContent = message;

  const retryButton = document.createElement("button");
  retryButton.className = "resources-error-btn";
  retryButton.type = "button";
  retryButton.dataset.retry = "true";
  retryButton.textContent = "Try again";

  wrapper.appendChild(text);
  wrapper.appendChild(retryButton);

  grid.innerHTML = "";
  grid.appendChild(wrapper);
}

/* Events */
function bindEvents() {
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      filterBtns.forEach((button) => {
        button.classList.remove("active");
        button.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      activeFilter = btn.dataset.filter || "";
      await loadResources({ resetPage: true });
    });
  });

  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      await loadResources({ resetPage: true });
    }, 350);
  });

  paginationWrap.addEventListener("click", async (event) => {
    const btn = event.target.closest("[data-page]");
    if (!btn || btn.disabled) return;
    const nextPage = Number(btn.dataset.page);
    if (!nextPage || nextPage < 1 || nextPage > currentTotalPages) return;
    currentPage = nextPage;
    await loadResources({ scrollToGrid: true });
  });

  grid.addEventListener("click", async (event) => {
    const retryButton = event.target.closest("[data-retry='true']");
    if (!retryButton) return;
    await loadResources();
  });
}

init();
