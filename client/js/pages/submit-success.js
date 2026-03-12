document.addEventListener('DOMContentLoaded', () => {
  const submittedJson = sessionStorage.getItem('submittedStory');
  const imgEl = document.getElementById('success-image');
  const nameEl = document.getElementById('success-name');
  const excerptEl = document.getElementById('success-excerpt');

  if (submittedJson) {
    try {
      const s = JSON.parse(submittedJson);
      if (s.image) imgEl.src = s.image; else imgEl.style.display = 'none';
      nameEl.textContent = (s.privacy === 'anonymous') ? 'Anonymous' : (s.name || '');
      excerptEl.textContent = s.story ? (s.story.length > 300 ? s.story.slice(0, 300) + '…' : s.story) : '';
    } catch (e) {
      console.warn('Could not parse submittedStory', e);
    }
  } else {
    imgEl.style.display = 'none';
  }

  document.getElementById('submit-another').addEventListener('click', () => {
    // allow user to submit another story
    sessionStorage.removeItem('submittedStory');
    window.location.href = 'submit-story.html';
  });
});
