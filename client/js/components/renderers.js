function renderBulletItem(text) {
  const formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return `
    <li class="content-list-item">
      <span class="content-list-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </span>
      <span>${formatted}</span>
    </li>
  `;
}

/* Article renderer */
function renderBlock(block) {
  switch (block.type) {

    case 'paragraph':
      return `<p class="content-paragraph">${block.text}</p>`;

    case 'section-text-image':
      return `
        <section class="content-section content-section-text-image">
          <div class="content-section-text">
            <h2 class="content-section-heading">${block.heading}</h2>
            <p class="content-section-body">${block.body}</p>
            <ul class="content-list" role="list">
              ${block.items.map(renderBulletItem).join('')}
            </ul>
          </div>
          <figure class="content-section-image">
            <img src="${block.image_url}" alt="" loading="lazy" />
          </figure>
        </section>
      `;

    case 'section-image-text':
      return `
        <section class="content-section content-section-image-text">
          <figure class="content-section-image">
            <img src="${block.image_url}" alt="" loading="lazy" />
          </figure>
          <div class="content-section-text">
            <h2 class="content-section-heading">${block.heading}</h2>
            <p class="content-section-body">${block.body}</p>
            <ul class="content-list" role="list">
              ${block.items.map(renderBulletItem).join('')}
            </ul>
          </div>
        </section>
      `;

    case 'bullet-list':
      return `
        <ul class="content-list content-list-standalone" role="list">
          ${block.items.map(renderBulletItem).join('')}
        </ul>
      `;

    case 'callout':
      return `
        <aside class="content-callout" role="note">
          <p>${block.text}</p>
        </aside>
      `;

    default:
      return '';
  }
}

export function renderArticle(resource) {
  const blocks = resource.structured_content || [];
  return `
    <div class="article-body">
      ${blocks.map(renderBlock).join('')}
    </div>
  `;
}

export function renderInfographic(resource) {
  return `<p class="content-paragraph">Infographic view coming soon...</p>`;
}

export function renderAudio(resource) {
  return `<p class="content-paragraph">Audio view coming soon...</p>`;
}

export function renderMythBusting(resource) {
  return `<p class="content-paragraph">Myth-busting view coming soon...</p>`;
}