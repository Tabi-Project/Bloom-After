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

/* Infographic renderer */

export function renderInfographic(resource) {

  const data = resource.structured_content;

  return `
    <div class="infographic-body">

      <h2 class="content-section-heading">
        ${data.title}
      </h2>

      <div class="infographic-grid">

        ${data.items.map(item => `
          <div class="infographic-item">
            <div class="infographic-icon">${item.icon}</div>
            <p>${item.label}</p>
          </div>
        `).join('')}

      </div>

      <p class="infographic-tagline">
        ${data.tagline}
      </p>

    </div>
  `;
}

/* Media renderer */

export function renderMedia(resource) {

  const data = resource.structured_content;

  return `
    <div class="media-body">

      <audio controls class="audio-player">
        <source src="${resource.file_url}" type="audio/mpeg">
      </audio>

      <div class="media-summary">
        ${data.summary_paragraphs
          .map(p => `<p class="content-paragraph">${p}</p>`)
          .join('')}
      </div>

    </div>
  `;
}

/* Myth-Busting renderer (temporary placeholder until redesign) */

export function renderMythBusting(resource) {

  const data = resource.structured_content;

  return `
    <div class="mythbusting-body">

      <div class="myth-section">
        <h2 class="content-section-heading">Common Myths</h2>

        ${data.myths.map(m => `
          <div class="myth-item">
            <strong>${m.label}</strong>
            <p>${m.description}</p>
          </div>
        `).join('')}

      </div>

      <div class="fact-section">
        <h2 class="content-section-heading">Facts</h2>

        ${data.facts.map(f => `
          <div class="fact-item">
            <strong>${f.label}</strong>
            <p>${f.description}</p>
          </div>
        `).join('')}

      </div>

    </div>
  `;
}