import { fetchResourceById } from "../data/resources-api.js";
import { renderArticle, renderInfographic, renderMedia, renderMythBusting } from "../components/renderers.js";
import { renderRelatedResources } from "../components/relatedResources.js";
import { renderCrisisStrip } from "../components/crisisStrip.js";
import { renderNavbar, initNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";

const navbarRoot  = document.getElementById('navbar-root');
const footerRoot  = document.getElementById('footer-root');
const heroBanner  = document.getElementById('resource-hero');
const contentRoot = document.getElementById('resource-content');
const relatedRoot = document.getElementById('related-root');
const crisisRoot  = document.getElementById('crisis-root');
const errorState  = document.getElementById('error-state');

const TYPE_LABELS = {
  'article':      'Article',
  'infographic':  'Infographic',
  'media':        'Media',
  'myth-busting': 'Myth-busting guide'
};

async function init() {
  if (navbarRoot && typeof renderNavbar === "function") {
    navbarRoot.innerHTML = renderNavbar("resources");
    initNavbar();
  }
  if (crisisRoot) crisisRoot.innerHTML = renderCrisisStrip();
  if (footerRoot) footerRoot.innerHTML = renderFooter();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showError('No resource ID provided.');
    return;
  }

  showLoading();

  try {
    const resource = await fetchResourceById(id);

    if (!resource) {
      showError("Resource not found. It may have been removed or the link may be incorrect.");
      return;
    }

    populateHero(resource);
    populateContent(resource);
    populateMeta(resource);
    await renderRelatedResources(relatedRoot, resource.id, resource.theme);
  } catch (error) {
    if (error?.status === 404) {
      showError("Resource not found. It may have been removed or the link may be incorrect.");
      return;
    }

    showError(error?.message || "We could not load this resource right now. Please try again.");
  }
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

function populateContent(resource) {
  let html = '';
  
  switch (resource.content_type) {
    case 'infographic':
      html = renderInfographic(resource);
      break;
    case 'media':
      html = renderMedia(resource);
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
  contentRoot.removeAttribute("aria-busy");
}

/* Meta */
function populateMeta(resource) {
  document.title = `${resource.title} — Bloom After`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', resource.summary);
}

function showLoading() {
  heroBanner.setAttribute('aria-busy', 'true');
  heroBanner.innerHTML = `
    <div class="resource-hero-skeleton skeleton-block"></div>
  `;

  contentRoot.setAttribute("aria-busy", "true");
  contentRoot.innerHTML = `
    <div class="content-skeleton">
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
  relatedRoot.innerHTML = "";
  heroBanner.removeAttribute("aria-busy");
  contentRoot.removeAttribute("aria-busy");
  errorState.hidden = false;
  errorState.querySelector('.error-message').textContent = message;
}

init();

document.addEventListener('click', async (e) => {
  const shareBtn = e.target.closest('.share-btn');
  if (!shareBtn) return;

  const url = window.location.href;
  const originalHTML = shareBtn.innerHTML;

  if (navigator.share && /Mobi|Android|Mac OS/i.test(navigator.userAgent)) {
    try {
      await navigator.share({
        title: document.title,
        text: 'Check out this resource from Bloom After',
        url: url
      });
      return; 
    } catch (err) {
      console.log('User cancelled share or native share failed:', err);
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    
    shareBtn.innerHTML = `
      Copied!
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
    `;
    
    setTimeout(() => {
      shareBtn.innerHTML = originalHTML;
    }, 2000);

  } catch (err) {
    console.error('Failed to copy link', err);
    alert('Failed to copy. Please manually copy the URL from your browser.');
  }
});
