const CONTENT_TYPE_ICONS = {
  'article': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>`,

  'infographic': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18"/>
    <path d="M9 21V9"/>
  </svg>`,

  'audio': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,

  'podcast': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`,

  'myth-busting': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
};

const CONTENT_TYPE_LABELS = {
  'article':      'Article',
  'infographic':  'Infographic',
  'audio':        'Audio Summary',
  'podcast':      'Podcast',
  'myth-busting': 'Myth-busting guide'
};

export function createResourceCard(resource) {
  const {
    id,
    title,
    summary,
    theme,
    content_type,
    image_url,
    date,
    read_time,
    cta_label = 'Read more'
  } = resource;

  const icon        = CONTENT_TYPE_ICONS[content_type] || CONTENT_TYPE_ICONS['article'];
  const typeLabel   = CONTENT_TYPE_LABELS[content_type] || content_type;
  const href        = `resource-detail.html?id=${id}`;
  const themeClass  = `badge-theme-${theme.toLowerCase()}`;

  return `
    <article class="resource-card" data-id="${id}">
      <a href="${href}" class="resource-card-image-link" tabindex="-1" aria-hidden="true">
        <figure class="resource-card-image">
          <img
            src="${image_url}"
            alt=""
            loading="lazy"
            width="400"
            height="240"
          />
          <figcaption class="resource-card-badges">
            <span class="badge badge-theme ${themeClass}">${theme}</span>
            <span class="badge badge-type" aria-label="Content type: ${typeLabel}">
              ${icon}
            </span>
          </figcaption>
        </figure>
      </a>

      <div class="resource-card-body">
        <div class="resource-card-meta">
          <time datetime="${date}">${date}</time>
          <span class="resource-read-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            ${read_time}
          </span>
        </div>

        <h3 class="resource-card-title">
          <a href="${href}">${title}</a>
        </h3>

        <p class="resource-card-summary">${summary}</p>

        <a href="${href}" class="resource-card-cta" aria-label="${cta_label}: ${title}">
          ${cta_label}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </div>
    </article>
  `;
}

export function createSkeletonCard() {
  return `
    <article class="resource-card resource-card-skeleton" aria-hidden="true">
      <div class="resource-card-image skeleton-block"></div>
      <div class="resource-card-body">
        <div class="skeleton-line skeleton-line-short"></div>
        <div class="skeleton-line skeleton-line-full"></div>
        <div class="skeleton-line skeleton-line-full"></div>
        <div class="skeleton-line skeleton-line-medium"></div>
        <div class="skeleton-line skeleton-line-short"></div>
      </div>
    </article>
  `;
}