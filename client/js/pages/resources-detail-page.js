import { fetchResourceById } from '../data/resources.js';
import { renderArticle, renderInfographic, renderAudio, renderMythBusting } from '../components/renderers.js';
import { renderRelatedResources } from '../components/relatedResources.js';
import { renderCrisisStrip } from '../components/crisisStrip.js';
import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

/* DOM references */
const navbarRoot  = document.getElementById('navbar-root');
const footerRoot  = document.getElementById('footer-root');
const heroBanner  = document.getElementById('resource-hero');
const contentRoot = document.getElementById('resource-content');
const relatedRoot = document.getElementById('related-root');
const crisisRoot  = document.getElementById('crisis-root');
const errorState  = document.getElementById('error-state');

/* Helpers */
const TYPE_LABELS = {
  'article':      'Article',
  'infographic':  'Infographic',
  'audio':        'Audio summary',
  'myth-busting': 'Myth-busting guide'
};

/* Init */
async function init() {
  if (navbarRoot && typeof renderNavbar === 'function') {
    navbarRoot.innerHTML = renderNavbar('resources');
    initNavbar();
  }
  if (crisisRoot) crisisRoot.innerHTML = renderCrisisStrip();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showError('No resource ID provided.');
    return;
  }

  showLoading();

  const resource = await fetchResourceById(id);

  if (!resource) {
    showError('Resource not found. It may have been removed or the link may be incorrect.');
    return;
  }

  if (footerRoot) {
    footerRoot.innerHTML = renderFooter();
  }

  populateHero(resource);
  populateContent(resource);
  populateMeta(resource);
  renderRelatedResources(relatedRoot, resource.id, resource.theme);
}

/* Hero */
function populateHero(resource) {
  heroBanner.style.backgroundImage = `url('${resource.image_url}')`;
  heroBanner.innerHTML = `
    <div class="resource-hero-overlay" aria-hidden="true"></div>
    <div class="resource-hero-content container">
      <span class="resource-hero-tag">${TYPE_LABELS[resource.content_type] || resource.content_type}</span>
      <h1 class="resource-hero-title">${resource.title}</h1>
      <p class="resource-hero-summary">${resource.summary}</p>
    </div>
  `;
  heroBanner.removeAttribute('aria-busy');
}

/* Content */
function populateContent(resource) {
  let html = '';
  
  switch (resource.content_type) {
    case 'infographic':
      html = renderInfographic(resource);
      break;
    case 'audio':
      html = renderAudio(resource);
      break;
    case 'myth-busting':
      html = renderMythBusting(resource);
      break;
    case 'article':
    default:
      html = renderArticle(resource);
      break;
  }
  
  contentRoot.innerHTML = html;
  contentRoot.removeAttribute('aria-busy');
}

/* Meta */
function populateMeta(resource) {
  document.title = `${resource.title} — Bloom After`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', resource.summary);
}

/* Loading state ─ */
function showLoading() {
  heroBanner.setAttribute('aria-busy', 'true');
  heroBanner.innerHTML = `
    <div class="resource-hero-skeleton skeleton-block" style="width:100%;height:300px;"></div>
  `;

  contentRoot.setAttribute('aria-busy', 'true');
  contentRoot.innerHTML = `
    <div class="content-skeleton" style="padding-block:var(--space-10);">
      <div class="skeleton-line skeleton-line-full"></div>
      <div class="skeleton-line skeleton-line-full"></div>
      <div class="skeleton-line skeleton-line-medium"></div>
    </div>
  `;
}

/* Error state */
function showError(message) {
  heroBanner.innerHTML = '';
  contentRoot.innerHTML = '';
  errorState.hidden = false;
  errorState.querySelector('.error-message').textContent = message;
}

init();