document.addEventListener('DOMContentLoaded', () => {
  const submittedJson = sessionStorage.getItem('submittedStory');
  const imgEl = document.getElementById('success-image');
  const imgWrap = document.getElementById('success-image-wrap');
  const titleEl = document.getElementById('success-title');
  const excerptEl = document.getElementById('success-excerpt');
  const tagsWrap = document.getElementById('success-tags-wrap');
  const authorNameEl = document.querySelector('.review-author-name');
  const authorMetaEl = document.querySelector('.review-author-meta');

  if (submittedJson) {
    try {
      const s = JSON.parse(submittedJson);
      const displayName = s.privacy === 'anonymous' ? 'Anonymous' : (s.name || 'Shared story');
      const date = s.confirmedAt
        ? new Date(s.confirmedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

      if (s.image && imgEl) {
        imgEl.src = s.image;
      } else if (imgWrap) {
        imgWrap.hidden = true;
      }

      if (titleEl) titleEl.textContent = displayName;
      const storyText = s.storyText || (s.story || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (excerptEl) excerptEl.textContent = storyText
        ? (storyText.length > 300 ? storyText.slice(0, 300) + '\u2026' : storyText)
        : '';

      if (tagsWrap) {
        if (Array.isArray(s.tags) && s.tags.length > 0) {
          s.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'review-tag';
            span.textContent = tag;
            tagsWrap.appendChild(span);
          });
        } else {
          tagsWrap.hidden = true;
        }
      }

      if (authorNameEl) authorNameEl.textContent = displayName;
      if (authorMetaEl) authorMetaEl.textContent = [s.location, date].filter(Boolean).join(' \u00b7 ');

    } catch (e) {
      console.warn('Could not parse submittedStory', e);
    }
  } else {
    if (imgWrap) imgWrap.hidden = true;
    if (tagsWrap) tagsWrap.hidden = true;
  }

  const submitAnotherBtn = document.getElementById('submit-another');
  if (submitAnotherBtn) {
    submitAnotherBtn.addEventListener('click', () => {
      sessionStorage.removeItem('submittedStory');
      window.location.href = 'submit-story.html';
    });
  }
});
