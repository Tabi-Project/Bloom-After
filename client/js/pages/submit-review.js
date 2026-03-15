document.addEventListener('DOMContentLoaded', () => {
  const pendingJson = sessionStorage.getItem('pendingStory');
  if (!pendingJson) {
    window.location.href = 'submit-story.html';
    return;
  }

  let pending;
  try { pending = JSON.parse(pendingJson); } catch (e) { window.location.href = 'submit-story.html'; return; }

  const displayName = pending.privacy === 'anonymous' ? 'Anonymous' : (pending.name || 'Shared story');
  const date = pending.savedAt
    ? new Date(pending.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  // Image
  const imgEl = document.getElementById('review-image');
  const imgWrap = document.getElementById('review-image-wrap');
  if (pending.image && imgEl) {
    imgEl.src = pending.image;
  } else if (imgWrap) {
    imgWrap.hidden = true;
  }

  // Card title
  const nameEl = document.querySelector('.review-name');
  if (nameEl) nameEl.textContent = displayName;

  // Story text
  const storyEl = document.getElementById('review-story');
  if (storyEl) storyEl.textContent = pending.story || '';

  // What helped tags
  const tagsWrap = document.getElementById('review-tags-wrap');
  if (tagsWrap) {
    if (Array.isArray(pending.tags) && pending.tags.length > 0) {
      pending.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'review-tag';
        span.textContent = tag;
        tagsWrap.appendChild(span);
      });
    } else {
      tagsWrap.hidden = true;
    }
  }

  // Author row
  const authorNameEl = document.querySelector('.review-author-name');
  if (authorNameEl) authorNameEl.textContent = displayName;
  const authorMetaEl = document.querySelector('.review-author-meta');
  if (authorMetaEl) authorMetaEl.textContent = [pending.location, date].filter(Boolean).join(' · ');

  // Privacy & Consent summary
  const pcPrivacy = document.querySelector('.pc-privacy');
  if (pcPrivacy) pcPrivacy.textContent = pending.privacy === 'anonymous' ? 'Anonymous' : 'Named';
  const pcConsent = document.querySelector('.pc-consent');
  if (pcConsent) pcConsent.textContent = pending.consent ? 'Accepted' : 'Pending';

  // Navigation
  const editBtn = document.getElementById('edit-btn');
  if (editBtn) editBtn.addEventListener('click', () => { window.location.href = 'submit-story.html'; });

  const confirmBtn  = document.getElementById('confirm-btn');

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Submitting…';

      pending.confirmedAt = Date.now();
      pending.storyId = null;
      sessionStorage.setItem('submittedStory', JSON.stringify(pending));
      sessionStorage.removeItem('pendingStory');
      window.location.href = 'submit-success.html';
    });
  }
});
