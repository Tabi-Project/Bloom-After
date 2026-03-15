import { icons } from '../components/icons.js';

function init() {
  // inject icons into elements that declare `data-icon`
  document.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.dataset.icon;
    if (name && icons && icons[name]) {
      el.innerHTML = icons[name];
      el.setAttribute('aria-hidden', 'true');
    }
  });

  // image upload zone
  const imageInput = document.getElementById('image');
  const preview = document.getElementById('image-preview');
  const livePreview = document.getElementById('upload-live-preview');
  const placeholder = document.getElementById('upload-placeholder');
  const zone = document.getElementById('upload-zone');
  const changeBtn = document.getElementById('upload-change-btn');

  function showPreview(src) {
    if (preview) preview.src = src;
    if (livePreview) livePreview.hidden = false;
    if (placeholder) placeholder.hidden = true;
    if (changeBtn) changeBtn.hidden = false;
  }

  function clearPreview() {
    if (preview) preview.src = '';
    if (livePreview) livePreview.hidden = true;
    if (placeholder) placeholder.hidden = false;
    if (changeBtn) changeBtn.hidden = true;
  }

  function readFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => showPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  if (zone && imageInput) {
    // click zone or change-btn → open file picker
    zone.addEventListener('click', e => {
      if (e.target === changeBtn || changeBtn?.contains(e.target)) return;
      imageInput.click();
    });
    if (changeBtn) changeBtn.addEventListener('click', () => imageInput.click());

    // keyboard: Enter / Space opens picker
    zone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); imageInput.click(); }
    });

    // drag & drop
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        // sync to input if possible (DataTransfer not assignable, just read)
        readFile(file);
      }
    });

    imageInput.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) readFile(file); else clearPreview();
    });
  }

  // prefill preview from sessionStorage if available (handled later in prefill block)

  // form and interactions
  const form = document.getElementById('submit-story-form');
  if (form) {
    // tag selection behavior: toggle tags, and 'All' clears tags
    const allBtn = document.querySelector('.filter-btn');
    const tagBtns = Array.from(document.querySelectorAll('.story-tag'));
    if (allBtn) {
      allBtn.addEventListener('click', () => {
        allBtn.classList.add('active');
        allBtn.setAttribute('aria-pressed', 'true');
        tagBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        // hide and clear other input when selecting All
        const otherInputClear = document.getElementById('other-tag-input');
        if (otherInputClear) {
          otherInputClear.hidden = true;
          otherInputClear.value = '';
        }
      });
    }

    const otherBtn = document.querySelector('.story-other');
    const otherInput = document.getElementById('other-tag-input');
    if (otherInput) otherInput.hidden = true;

    tagBtns.forEach(btn => {
      btn.setAttribute('aria-pressed', 'false');
      if (btn === otherBtn) {
        btn.addEventListener('click', () => {
          const isActive = btn.classList.toggle('active');
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          if (otherInput) {
            otherInput.hidden = !isActive;
            if (isActive) otherInput.focus();
            else otherInput.value = '';
          }
          if (allBtn) {
            allBtn.classList.remove('active');
            allBtn.setAttribute('aria-pressed', 'false');
          }
        });
      } else {
        btn.addEventListener('click', () => {
          // toggle this tag
          const isActive = btn.classList.toggle('active');
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          // unset the All button when selecting tags
          if (allBtn) {
            allBtn.classList.remove('active');
            allBtn.setAttribute('aria-pressed', 'false');
          }
        });
      }
    });

    // privacy button behavior (Named / Anonymous)
    const privacyButtons = Array.from(document.querySelectorAll('.privacy-btn'));
    const privacyValueEl = document.getElementById('privacy-value');
    if (privacyButtons.length > 0) {
      privacyButtons.forEach(pb => {
        pb.addEventListener('click', () => {
          privacyButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
          pb.classList.add('active');
          pb.setAttribute('aria-pressed', 'true');
          if (privacyValueEl) privacyValueEl.value = pb.dataset.value;
        });
      });
    }

    // prefill the form from sessionStorage if available
    const pendingJson = sessionStorage.getItem('pendingStory');
    if (pendingJson) {
      try {
        const pending = JSON.parse(pendingJson);
        if (pending.name) form.querySelector('#name').value = pending.name;
        if (pending.story) form.querySelector('#story').value = pending.story;
        if (pending.location) form.querySelector('#location').value = pending.location;
        if (typeof pending.consent !== 'undefined') form.querySelector('#consent').checked = !!pending.consent;
        if (pending.image) showPreview(pending.image);
        if (pending.privacy && privacyButtons.length > 0) {
          privacyButtons.forEach(pb => {
            if (pb.dataset && pb.dataset.value === pending.privacy) {
              pb.classList.add('active'); pb.setAttribute('aria-pressed','true');
              if (privacyValueEl) privacyValueEl.value = pending.privacy;
            } else { pb.classList.remove('active'); pb.setAttribute('aria-pressed','false'); }
          });
        }
        if (Array.isArray(pending.tags)) {
          const known = tagBtns.map(b => b.textContent.trim());
          tagBtns.forEach(btn => {
            const text = btn.textContent.trim();
            if (pending.tags.includes(text)) {
              btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
            } else {
              btn.classList.remove('active'); btn.setAttribute('aria-pressed','false');
            }
          });
          const unmatched = pending.tags.filter(t => !known.includes(t));
          if (unmatched.length > 0 && otherBtn && otherInput) {
            otherBtn.classList.add('active'); otherBtn.setAttribute('aria-pressed','true');
            otherInput.hidden = false; otherInput.value = unmatched[0];
          }
        }
      } catch (err) {
        console.warn('Could not parse pendingStory', err);
      }
    }

    // on submit: save pending story to sessionStorage and navigate to review
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const privacyValue = document.getElementById('privacy-value')?.value || 'named';
      const consent = !!form.querySelector('#consent')?.checked;

      // gather selected tags (excluding the 'Other' button text unless input provided)
      const selectedTags = Array.from(document.querySelectorAll('.story-tag.active'))
        .filter(t => !t.classList.contains('story-other'))
        .map(t => t.textContent.trim());
      const otherInputEl = document.getElementById('other-tag-input');
      if (otherInputEl && !otherInputEl.hidden) {
        const v = otherInputEl.value.trim();
        if (v) selectedTags.push(v);
      }

      const imageSrc = (livePreview && !livePreview.hidden && preview?.src?.startsWith('data:')) ? preview.src : '';

      const pending = {
        name: fd.get('name') || '',
        story: fd.get('story') || '',
        location: fd.get('location') || '',
        privacy: privacyValue,
        consent,
        tags: selectedTags,
        image: imageSrc,
        savedAt: Date.now(),
      };

      sessionStorage.setItem('pendingStory', JSON.stringify(pending));
      window.location.href = 'submit-review.html';
    });
  }
}

init();
