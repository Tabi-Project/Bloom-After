document.addEventListener('DOMContentLoaded', () => {
  const pendingJson = sessionStorage.getItem('pendingStory');
  if (!pendingJson) {
    // nothing to review, go back to edit
    window.location.href = 'submit-story.html';
    return;
  }

  let pending;
  try { pending = JSON.parse(pendingJson); } catch (e) { window.location.href = 'submit-story.html'; return; }

  const imgEl = document.getElementById('review-image');
  const nameEl = document.querySelector('.review-name');
  const locEl = document.querySelector('.review-location');
  const privacyEl = document.querySelector('.review-privacy');
  const storyEl = document.getElementById('review-story');
  const badgePrivacy = document.getElementById('review-badge-privacy');

  if (pending.image) imgEl.src = pending.image; else imgEl.style.display = 'none';
  nameEl.textContent = (pending.privacy === 'anonymous') ? 'Anonymous' : (pending.name || 'Shared story');
  locEl.textContent = pending.location || '';
  privacyEl.textContent = pending.privacy === 'anonymous' ? 'Anonymous' : 'Named';
  badgePrivacy.textContent = pending.privacy === 'anonymous' ? 'AN' : '';
  storyEl.textContent = pending.story || '';

  // privacy & consent summary
  const pcPrivacy = document.querySelector('.pc-privacy');
  const pcConsent = document.querySelector('.pc-consent');
  if (pcPrivacy) pcPrivacy.textContent = pending.privacy === 'anonymous' ? 'Anonymous' : 'Named';
  if (pcConsent) pcConsent.textContent = pending.consent ? 'Yes' : 'No';

  // Final checks logic
  const checkAccuracy = document.getElementById('check-accuracy');
  const checkNoIdentifiers = document.getElementById('check-no-identifiers');
  const checkConsent = document.getElementById('check-consent');
  const confirmBtn = document.getElementById('confirm-btn');
  const editBtn = document.getElementById('edit-btn');

  // pre-check consent if user already consented on the submit form
  if (checkConsent && pending.consent) checkConsent.checked = true;

  function updateConfirmState() {
    const allChecked = [checkAccuracy, checkNoIdentifiers, checkConsent].every(cb => cb && cb.checked);
    if (confirmBtn) confirmBtn.disabled = !allChecked;
  }

  [checkAccuracy, checkNoIdentifiers, checkConsent].forEach(cb => {
    if (cb) cb.addEventListener('change', updateConfirmState);
  });

  // initialize state
  updateConfirmState();

  if (editBtn) editBtn.addEventListener('click', () => { window.location.href = 'submit-story.html'; });

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      // only proceed if final checks are all checked
      const allChecked = [checkAccuracy, checkNoIdentifiers, checkConsent].every(cb => cb && cb.checked);
      if (!allChecked) return;
      // attach a finalChecks record and mark as submitted
      pending.finalChecks = {
        accuracy: !!checkAccuracy.checked,
        noIdentifiers: !!checkNoIdentifiers.checked,
        consent: !!checkConsent.checked,
        confirmedAt: Date.now()
      };
      sessionStorage.setItem('submittedStory', JSON.stringify(pending));
      sessionStorage.removeItem('pendingStory');
      window.location.href = 'submit-success.html';
    });
  }
});
