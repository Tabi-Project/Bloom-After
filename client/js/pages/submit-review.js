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
  const submitError  = document.getElementById('submit-error');

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Submitting…';
      if (submitError) submitError.hidden = true;

      try {
        const formData = new FormData();
        formData.append('name',     pending.name     || '');
        formData.append('story',    pending.story    || '');
        formData.append('location', pending.location || '');
        formData.append('privacy',  pending.privacy  || 'named');
        formData.append('consent',  pending.consent ? 'true' : 'false');
        // repeated key — multer collects these as req.body.what_helped array
        (pending.tags || []).forEach(t => formData.append('what_helped', t));

        if (pending.image && pending.image.startsWith('data:')) {
          const blob = base64ToBlob(pending.image);
          formData.append('image', blob, 'story-image.jpg');
        }

        const res = await fetch('/api/v1/stories', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const json = await res.json();

        pending.confirmedAt = Date.now();
        pending.storyId     = json.data?._id ?? null;
        sessionStorage.setItem('submittedStory', JSON.stringify(pending));
        sessionStorage.removeItem('pendingStory');
        window.location.href = 'submit-success.html';

      } catch (err) {
        console.error('Submission error:', err);
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Submit for Moderation <span class="material-symbols-outlined" aria-hidden="true">send</span>';
        if (submitError) submitError.hidden = false;
      }
    });
  }
});

function base64ToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',');
  const mime  = header.match(/:(.*?);/)[1];
  const bytes = atob(data);
  const arr   = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
