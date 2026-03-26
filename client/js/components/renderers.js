export function renderBulletItem(text) {
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

// Article renderer
export function renderBlock(block) {
  const blockImageUrl = block.imageUrl || block.image_url || '';
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
            <img src="${blockImageUrl}" alt="" loading="lazy" />
          </figure>
        </section>
      `;
    case 'section-image-text':
      return `
        <section class="content-section content-section-image-text">
          <figure class="content-section-image">
            <img src="${blockImageUrl}" alt="" loading="lazy" />
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

// Infographic renderer
const INFOGRAPHIC_ICONS = {
  'sad-face': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 16.2A7.94 7.94 0 0 0 22 12A10 10 0 1 0 12 22a7.94 7.94 0 0 0 4.2-.12"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  'sleep': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><path d="M8 12h4l-4 4h4"/><path d="M14 8h3l-3 3h3"/></svg>`,
  'energy': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  'baby': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2v5"/><path d="M14 2v5"/><path d="M8 7h8v15H8z"/><path d="M12 2v5"/></svg>`,
  'anxiety': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  'joy': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  'default': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>`
};

export function renderInfographic(resource) {
  if (!resource || !resource.structured_content) return `<p>Content unavailable.</p>`;
  const data = resource.structured_content;

  return `
    <article class="infographic-layout">
      <div class="content-canvas text-center">
        <h2 class="info-canvas-title">${data.title}</h2>
        <div class="info-grid">
          ${data.items.map(item => `
            <div class="info-card">
              <div class="info-icon">${INFOGRAPHIC_ICONS[item.icon] || INFOGRAPHIC_ICONS['default']}</div>
              <p class="info-label">${item.label}</p>
            </div>
          `).join('')}
        </div>
        <p class="info-tagline">
          ${data.tagline}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </p>
      </div>
    </article>
  `;
}


// Myth-Busting renderer 
export function renderMythBusting(resource) {
  if (!resource || !resource.structured_content) return `<p>Content unavailable.</p>`;
  const { myths, facts } = resource.structured_content;

  return `
    <article class="myth-layout content-canvas">
      <div class="mf-col">
        <h2 class="col-title">5 Myths</h2>
        ${myths.map(m => `
          <div class="mf-item">
            <span class="mf-icon-box">?</span>
            <h3 class="mf-label">${m.label}</h3>
            <p class="mf-desc">${m.description}</p>
          </div>
        `).join('')}
      </div>

      <div class="mf-col">
        <h2 class="col-title">5 Facts</h2>
        ${facts.map(f => `
          <div class="mf-item">
            <span class="mf-icon-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 21H15"/><path d="M12 11V17"/><path d="M12 2A6.5 6.5 0 0 0 5.5 8.5C5.5 11 8 13.5 8 16h8c0-2.5 2.5-5 2.5-7.5A6.5 6.5 0 0 0 12 2Z"/></svg>
            </span>
            <h3 class="mf-label">${f.label}</h3>
            <p class="mf-desc">${f.description}</p>
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

// Media renderer
// export function renderMedia(resource) {
//   if (!resource || !resource.structured_content) {
//     return `<p class="content-empty">Media unavailable.</p>`;
//   }

//   const { file_url, structured_content } = resource;

//   const paragraphs = structured_content.summary_paragraphs || [];

//   return `
//     <article class="media-layout content-canvas">

//       <div class="media-player-wrapper">
//         ${
//           file_url
//             ? `
//           <audio controls class="media-player">
//             <source src="${file_url}" type="audio/mpeg">
//             Your browser does not support the audio element.
//           </audio>
//         `
//             : `
//           <div class="media-fallback">
//             <p>Audio not available.</p>
//           </div>
//         `
//         }
//       </div>

//       <div class="media-content">
//         ${paragraphs
//           .map(
//             (text) => `
//           <p class="media-paragraph">${text}</p>
//         `
//           )
//           .join('')}
//       </div>

//     </article>
//   `;
// }

// Media renderer
export function renderMedia(resource) {
  if (!resource || !resource.structured_content) {
    return `<p class="content-empty">Media unavailable.</p>`;
  }

  // We are pulling the title out now too!
  const { title, file_url, imageUrl, image_url, structured_content } = resource;
  const mediaImageUrl = imageUrl || image_url || '';
  const mediaFormat = resource.media_format || 'audio'; 
  const paragraphs = structured_content.summary_paragraphs || [];

  let playerHTML = '';

  if (!file_url) {
    playerHTML = `<div class="media-fallback"><p>${mediaFormat} not available.</p></div>`;
  } else if (mediaFormat === 'video') {
    playerHTML = `
      <div class="video-player-wrapper">
        <video controls class="media-player video-player" poster="${mediaImageUrl}">
          <source src="${file_url}" type="video/mp4">
          Your browser does not support the video element.
        </video>
      </div>
    `;
  } else if (mediaFormat === 'podcast') {
    playerHTML = `
      <div class="podcast-player-wrapper">
        <img src="${mediaImageUrl}" alt="${title}" class="podcast-cover" loading="lazy" />
        <div class="podcast-info">
          <span class="podcast-badge">Podcast Episode</span>
          <h3 class="podcast-title">${title}</h3>
          <audio controls class="media-player audio-player">
            <source src="${file_url}" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    `;
  } else {
    // Standard Audio
    playerHTML = `
      <div class="audio-player-wrapper">
        <span class="podcast-badge">Audio Guide</span>
        <h3 class="podcast-title">${title}</h3>
        <audio controls class="media-player audio-player">
          <source src="${file_url}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      </div>
    `;
  }

  return `
    <article class="media-layout content-canvas">
      <div class="media-player-container">
        ${playerHTML}
      </div>
      <div class="media-content">
        ${paragraphs.map((text) => `<p class="media-paragraph">${text}</p>`).join('')}
      </div>
    </article>
  `;
}