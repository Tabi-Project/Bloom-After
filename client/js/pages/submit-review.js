import api from '../api.js';
import { richTextToPlainText, toRichTextHtml } from '../richText.js';

document.addEventListener('DOMContentLoaded', () => {
  const pendingJson = sessionStorage.getItem('pendingStory');
  if (!pendingJson) {
    window.location.href = '/stories/editor'; // Redirect to submission page if no pending story found
    return;
  }

  let pending;
  try { pending = JSON.parse(pendingJson); } catch (e) { window.location.href = '/stories/editor'; return; }

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
  if (storyEl) {
    storyEl.innerHTML = toRichTextHtml(pending.story || '');
  }

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
  if (editBtn) editBtn.addEventListener('click', () => { window.location.href = '/stories/editor'; });

  const confirmBtn  = document.getElementById('confirm-btn');

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Submitting…';

      const submitError = document.getElementById('submit-error');
      if (submitError) submitError.hidden = true;

      try {
        const payload = {
          name: pending.name || '',
          email: pending.email || '',
          privacy: pending.privacy || 'named',
          story: toRichTextHtml(pending.story || ''),
          location: pending.location || '',
          consent: !!pending.consent,
          what_helped: Array.isArray(pending.tags) ? pending.tags : [],
          image: pending.image || '',
        };

        const response = await api.post('/api/v1/stories', payload);
        const submitted = response?.data || response?.story || null;
        
        pending.confirmedAt = Date.now();
        pending.storyId = submitted?._id || null;
        pending.storyText = richTextToPlainText(pending.story || '');
        sessionStorage.setItem('submittedStory', JSON.stringify(pending));
        sessionStorage.removeItem('pendingStory');
        window.location.href = '/stories/success'; // Redirect to success page after submission
      } catch (error) {
        console.error('[StorySubmit][Review] submit failed', {
          message: error?.message,
          status: error?.status,
          data: error?.data,
        });
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `
          Submit for Moderation
          <span class="material-symbols-outlined" aria-hidden="true">send</span>
        `;
        if (submitError) submitError.hidden = false;
      }
    });
  }
});
