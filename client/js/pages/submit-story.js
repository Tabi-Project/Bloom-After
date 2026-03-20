import { icons } from '../components/icons.js';
import { Editor } from 'https://esm.sh/@tiptap/core@2.11.5';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit@2.11.5';
import Link from 'https://esm.sh/@tiptap/extension-link@2.11.5';
import { richTextToPlainText, toRichTextHtml } from '../richText.js';

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
  const nameRow = document.getElementById('name-row');
  const nameInput = document.getElementById('name');
  const storyInput = document.getElementById('story');
  const storyEditorRoot = document.getElementById('story-editor');
  const editorButtons = Array.from(document.querySelectorAll('.story-editor-btn'));

  const storyEditor = storyEditorRoot
    ? new Editor({
        element: storyEditorRoot,
        extensions: [
          StarterKit.configure({
            heading: { levels: [2, 3] },
          }),
          Link.configure({
            openOnClick: false,
            autolink: true,
            linkOnPaste: true,
          }),
        ],
        content: '<p></p>',
        onUpdate: ({ editor }) => {
          if (storyInput) {
            storyInput.value = editor.getHTML();
          }
        },
        onSelectionUpdate: () => {
          updateEditorButtonState();
        },
      })
    : null;

  function updateEditorButtonState() {
    if (!storyEditor) return;

    editorButtons.forEach((button) => {
      const action = button.dataset.editorAction;
      const shouldBeActive =
        (action === 'bold' && storyEditor.isActive('bold')) ||
        (action === 'italic' && storyEditor.isActive('italic')) ||
        (action === 'heading2' && storyEditor.isActive('heading', { level: 2 })) ||
        (action === 'bulletList' && storyEditor.isActive('bulletList')) ||
        (action === 'orderedList' && storyEditor.isActive('orderedList')) ||
        (action === 'blockquote' && storyEditor.isActive('blockquote')) ||
        (action === 'link' && storyEditor.isActive('link'));

      button.classList.toggle('active', shouldBeActive);
      button.setAttribute('aria-pressed', shouldBeActive ? 'true' : 'false');
    });
  }

  function runEditorAction(action) {
    if (!storyEditor) return;

    switch (action) {
      case 'bold':
        storyEditor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        storyEditor.chain().focus().toggleItalic().run();
        break;
      case 'heading2':
        storyEditor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'bulletList':
        storyEditor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        storyEditor.chain().focus().toggleOrderedList().run();
        break;
      case 'blockquote':
        storyEditor.chain().focus().toggleBlockquote().run();
        break;
      case 'undo':
        storyEditor.chain().focus().undo().run();
        break;
      case 'redo':
        storyEditor.chain().focus().redo().run();
        break;
      case 'link': {
        const existing = storyEditor.getAttributes('link').href || '';
        const url = window.prompt('Enter a link URL', existing);
        if (url === null) break;
        if (!url.trim()) {
          storyEditor.chain().focus().unsetLink().run();
          break;
        }
        storyEditor.chain().focus().setLink({ href: url.trim() }).run();
        break;
      }
      default:
        break;
    }

    if (storyInput) {
      storyInput.value = storyEditor.getHTML();
    }
    updateEditorButtonState();
  }

  editorButtons.forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      runEditorAction(button.dataset.editorAction);
    });
  });

  if (storyInput && storyEditor) {
    storyInput.value = storyEditor.getHTML();
    updateEditorButtonState();
  }

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

    function toggleNameField(privacyValue) {
      if (!nameRow || !nameInput) return;
      const isNamed = privacyValue !== 'anonymous';
      nameRow.hidden = !isNamed;
      nameInput.disabled = !isNamed;
      if (!isNamed) {
        nameInput.value = '';
      }
    }

    if (privacyButtons.length > 0) {
      privacyButtons.forEach(pb => {
        pb.addEventListener('click', () => {
          privacyButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
          pb.classList.add('active');
          pb.setAttribute('aria-pressed', 'true');
          if (privacyValueEl) {
            privacyValueEl.value = pb.dataset.value;
            toggleNameField(privacyValueEl.value);
          }
        });
      });
    }

    toggleNameField(privacyValueEl?.value || 'named');

    // prefill the form from sessionStorage if available
    const pendingJson = sessionStorage.getItem('pendingStory');
    if (pendingJson) {
      try {
        const pending = JSON.parse(pendingJson);
        if (pending.name) form.querySelector('#name').value = pending.name;
        if (pending.story && storyEditor) {
          storyEditor.commands.setContent(toRichTextHtml(pending.story));
          if (storyInput) {
            storyInput.value = storyEditor.getHTML();
          }
        }
        if (pending.location) form.querySelector('#location').value = pending.location;
        if (pending.email) form.querySelector('#email').value = pending.email;
        if (typeof pending.consent !== 'undefined') form.querySelector('#consent').checked = !!pending.consent;
        if (pending.image) showPreview(pending.image);
        if (pending.privacy && privacyButtons.length > 0) {
          privacyButtons.forEach(pb => {
            if (pb.dataset && pb.dataset.value === pending.privacy) {
              pb.classList.add('active'); pb.setAttribute('aria-pressed','true');
              if (privacyValueEl) privacyValueEl.value = pending.privacy;
            } else { pb.classList.remove('active'); pb.setAttribute('aria-pressed','false'); }
          });
          toggleNameField(pending.privacy);
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

      if (storyEditor && storyInput) {
        storyInput.value = storyEditor.getHTML();
      }

      const storyHtml = String(fd.get('story') || '').trim();
      const storyText = richTextToPlainText(storyHtml);

      if (!storyText) {
        if (storyEditorRoot) storyEditorRoot.focus();
        return;
      }

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
        email: fd.get('email') || '',
        story: storyHtml,
        storyText,
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
