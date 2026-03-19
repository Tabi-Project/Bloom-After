import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { richTextToPlainText, toRichTextHtml } from '../richText.js';
import api from '../api.js';

const navbarRoot  = document.getElementById('navbar-root');
const footerRoot  = document.getElementById('footer-root');
const heroBanner  = document.getElementById('resource-hero');
const contentRoot = document.getElementById('resource-content');
const errorState  = document.getElementById('error-state');

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

async function init() {
  if (navbarRoot) {
    navbarRoot.innerHTML = renderNavbar('stories');
    initNavbar();
  }
  if (footerRoot) footerRoot.innerHTML = renderFooter();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showError('No story ID provided.');
    return;
  }

  showLoading();

  const story = await fetchStory(id);

  if (!story) {
    showError('Story not found. It may have been removed or the link may be incorrect.');
    return;
  }

  populateHero(story);
  populateContent(story);
  populateMeta(story);
}

/* Fetch a single story from backend */
async function fetchStory(id) {
  try {
    const response = await api.get(`/api/v1/stories/${id}`);
    return response?.story || response?.data || null;
  } catch (_) {
    return null;
  }
}

/* Hero */
function populateHero(story) {
  const authorName = story.privacy === 'named' && story.name
    ? story.name
    : 'Anonymous';

  const date = new Date(story.createdAt).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const tagsHtml = (story.what_helped || [])
    .map(t => `<span class="resource-hero-tag">${escapeHtml(t)}</span>`)
    .join('');

  if (story.image_url) {
    heroBanner.style.backgroundImage = `url('${story.image_url}')`;
  } else {
    heroBanner.style.backgroundColor = '#001616';
  }

  heroBanner.innerHTML = `
    <div class="resource-hero-overlay" aria-hidden="true"></div>
    <div class="resource-hero-content container">
      ${tagsHtml ? `<div class="story-hero-tags">${tagsHtml}</div>` : ''}
      <h1 class="resource-hero-title">${escapeHtml(authorName)}'s Story</h1>
      <p class="resource-hero-summary">
        ${escapeHtml([story.location, date].filter(Boolean).join(' · '))}
      </p>
    </div>
  `;
  heroBanner.removeAttribute('aria-busy');
}

/* Content */
function populateContent(story) {
  const storyHtml = toRichTextHtml(story.story || '');

  const whatHelpedHtml = (story.what_helped || []).length > 0
    ? `<div class="story-what-helped">
        <h2 class="story-what-helped-heading">What helped me</h2>
        <div class="review-tags">
          ${story.what_helped.map(t => `<span class="review-tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>`
    : '';

  contentRoot.innerHTML = `
    <div class="story-article">
      <div class="story-body rich-text-display">${storyHtml}</div>
      ${whatHelpedHtml}
    </div>
  `;
  contentRoot.removeAttribute('aria-busy');
}

/* Meta */
function populateMeta(story) {
  const authorName = story.privacy === 'named' && story.name
    ? story.name
    : 'Anonymous';
  document.title = `${authorName}'s Story — Bloom After`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    const plainText = richTextToPlainText(story.story || '');
    metaDesc.setAttribute('content', plainText.slice(0, 150));
  }
}

/* Loading skeleton */
function showLoading() {
  heroBanner.setAttribute('aria-busy', 'true');
  heroBanner.innerHTML = `<div class="resource-hero-skeleton skeleton-block"></div>`;

  contentRoot.setAttribute('aria-busy', 'true');
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
  errorState.hidden = false;
  errorState.querySelector('.error-message').textContent = message;
}

init();
