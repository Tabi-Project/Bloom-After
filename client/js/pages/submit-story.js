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

  // image preview for card image upload
  const imageInput = document.getElementById('image');
  const preview = document.getElementById('image-preview');
  if (imageInput && preview) {
    const previewDefaultSrc = preview.src || '';
    imageInput.addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        // restore the default placeholder image when no file selected
        preview.src = previewDefaultSrc;
        preview.hidden = false;
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        preview.src = String(reader.result);
        preview.hidden = false;
      };
      reader.readAsDataURL(file);
    });
  }

  // simple form submit handler (prevent default for now)
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

    // ensure other input hidden by default
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

      console.log('Submit story (local):', {
        name: fd.get('name'),
        story: fd.get('story'),
        location: fd.get('location'),
        privacy: privacyValue,
        consent,
        tags: selectedTags,
      });

      // placeholder behaviour: advance to next screen or show message
      alert('Story saved locally. Continue to review (placeholder).');
    });
  }
}

init();
