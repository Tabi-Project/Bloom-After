const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80';

export function createStoryCard(story) {
  const {
    _id,
    name,
    privacy = 'named',
    image_url,
    story: text,
    what_helped = [],
    location,
    createdAt,
  } = story;

  const author  = privacy === 'anonymous' || !name ? 'Anonymous' : name;
  const date    = createdAt
    ? new Date(createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';
  const plainText = story.story_text || (text ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const excerpt = plainText && plainText.length > 130 ? plainText.slice(0, 130).trim() + '…' : plainText;
  const img     = image_url || FALLBACK_IMAGE;
  const tags    = what_helped.slice(0, 3);
  const href    = `story-detail.html?id=${_id}`;

  return `
    <article class="resource-card story-card" data-id="${_id}">
      <a href="${href}" class="resource-card-image-link" tabindex="-1" aria-hidden="true">
        <figure class="resource-card-image">
          <img src="${img}" alt="" loading="lazy" width="400" height="240" />
        </figure>
      </a>

      <div class="resource-card-body">
        <div class="resource-card-meta">
          ${date     ? `<time datetime="${createdAt}">${date}</time>` : ''}
          ${location ? `<span class="story-location">${location}</span>` : ''}
        </div>

        <p class="story-author">By ${author}</p>
        <p class="resource-card-summary">${excerpt}</p>

        ${tags.length ? `
        <div class="story-card-tags" aria-label="What helped">
          ${tags.map(t => `<span class="review-tag">${t}</span>`).join('')}
        </div>` : ''}

        <a href="${href}" class="resource-card-cta" aria-label="Read story by ${author}">
          Read story
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
