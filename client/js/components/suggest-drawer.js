
const SUGGESTION_TYPES = [
  { id: 'clinic',     label: 'Clinic recommendation' },
  { id: 'specialist', label: 'Specialist onboarding' },
  { id: 'media',      label: 'Media suggestion'      },
  { id: 'request',    label: 'Other request'         },
];

const escHtml = (v = '') =>
  String(v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

// Template

function buildDrawerHTML() {
  const typePills = SUGGESTION_TYPES.map((t) => `
    <button
      type="button"
      class="suggest-type-pill"
      data-type="${t.id}"
      aria-pressed="false"
    >${t.label}</button>
  `).join('');

  return `
    <!-- Floating trigger button -->
    <div class="suggest-fab-wrap" id="suggest-fab-wrap" aria-live="polite">
      <div class="suggest-fab-pulse" aria-hidden="true"></div>
      <button
        class="suggest-fab"
        id="suggest-fab"
        aria-label="Make a suggestion"
        aria-expanded="false"
        aria-controls="suggest-drawer"
        type="button"
      >
        <svg class="suggest-fab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        <span class="suggest-fab-label">Make a suggestion</span>
      </button>

      <!-- Nudge tooltip -->
      <div class="suggest-nudge" id="suggest-nudge" role="tooltip" aria-hidden="true">
        <span>Know a clinic, specialist, or resource that could help?</span>
        <span class="suggest-nudge-cta">Tell us →</span>
      </div>
    </div>

    <!-- Overlay -->
    <div
      class="suggest-drawer-overlay"
      id="suggest-drawer-overlay"
      aria-hidden="true"
    ></div>

    <!-- Drawer -->
    <aside
      class="suggest-drawer"
      id="suggest-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Make a suggestion"
      aria-hidden="true"
      hidden
    >
      <div class="suggest-drawer-inner">

        <div class="suggest-drawer-header">
          <div>
            <h2 class="suggest-drawer-title">Make a suggestion</h2>
            <p class="suggest-drawer-subtitle">
              Help us grow our community resources. No account needed.
            </p>
          </div>
          <button
            class="suggest-drawer-close"
            id="suggest-drawer-close"
            type="button"
            aria-label="Close suggestion drawer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Success state — hidden until form submitted -->
        <div class="suggest-success" id="suggest-success" hidden>
          <div class="suggest-success-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3 class="suggest-success-title">Thank you!</h3>
          <p class="suggest-success-body">
            Your suggestion has been received. Our team will review it and
            add it to the platform if it's a good fit.
          </p>
          <button class="suggest-success-btn btn btn-primary" id="suggest-another" type="button">
            Suggest another
          </button>
        </div>

        <!-- Form — shown by default -->
        <form class="suggest-form" id="suggest-form" novalidate>

          <div class="suggest-field">
            <label class="suggest-label">
              Category
              <span class="suggest-label-hint">Choose the one that best fits your suggestion</span>
            </label>
            <div class="suggest-type-pills" role="group" aria-label="Suggestion category">
              ${typePills}
            </div>
            <input type="hidden" id="suggest-type-value" name="type" value="" />
            <p class="suggest-field-error" id="type-error" hidden>Please choose a category.</p>
          </div>

          <div class="suggest-field">
            <label class="suggest-label" for="suggest-content">
              Tell us about it
              <span class="suggest-label-hint">Name, location, link, or why you'd recommend it</span>
            </label>
            <textarea
              id="suggest-content"
              name="content"
              class="suggest-textarea"
              rows="4"
              placeholder="e.g. Grace Medical Centre in Lagos — great postpartum support, very empathetic staff."
            ></textarea>
            <p class="suggest-field-error" id="content-error" hidden>Please add a description.</p>
          </div>

          <div class="suggest-field">
            <label class="suggest-label" for="suggest-email">
              Your email
              <span class="suggest-label-hint">Optional — we'll let you know when it's added</span>
            </label>
            <input
              type="email"
              id="suggest-email"
              name="email"
              class="suggest-input"
              placeholder="you@example.com"
              autocomplete="email"
            />
          </div>

          <p class="suggest-form-error" id="suggest-form-error" hidden role="alert">
            Something went wrong. Please try again.
          </p>

          <button type="submit" class="btn btn-primary suggest-submit" id="suggest-submit">
            Send suggestion
          </button>

          <p class="suggest-privacy-note">
            Your suggestion goes to our moderation team only. It will never be
            published without review.
          </p>

        </form>

      </div>
    </aside>
  `;
}

// Init
export function initSuggestDrawer() {
  // Inject HTML into body
  const mount = document.createElement('div');
  mount.id = 'suggest-drawer-root';
  mount.innerHTML = buildDrawerHTML();
  document.body.appendChild(mount);

  // Refs
  const fab       = document.getElementById('suggest-fab');
  const nudge     = document.getElementById('suggest-nudge');
  const overlay   = document.getElementById('suggest-drawer-overlay');
  const drawer    = document.getElementById('suggest-drawer');
  const closeBtn  = document.getElementById('suggest-drawer-close');
  const form      = document.getElementById('suggest-form');
  const success   = document.getElementById('suggest-success');
  const another   = document.getElementById('suggest-another');
  const typeInput = document.getElementById('suggest-type-value');
  const pills     = document.querySelectorAll('.suggest-type-pill');
  // Guarantee success state is hidden on init regardless of HTML parsing
success.style.display = 'none';

  // Nudge animation 
  // Shows after 2.5s, disappears after 4s, never repeats in the same session

  const hasSeenNudge = sessionStorage.getItem('suggest_nudge_seen');
  if (!hasSeenNudge) {
    setTimeout(() => {
      nudge.removeAttribute('aria-hidden');
      nudge.classList.add('visible');

      setTimeout(() => {
        nudge.classList.remove('visible');
        nudge.setAttribute('aria-hidden', 'true');
        sessionStorage.setItem('suggest_nudge_seen', '1');
      }, 4000);
    }, 2500);
  }

  fab.addEventListener('mouseenter', dismissNudge);
  fab.addEventListener('focus', dismissNudge);

  function dismissNudge() {
    nudge.classList.remove('visible');
    nudge.setAttribute('aria-hidden', 'true');
    sessionStorage.setItem('suggest_nudge_seen', '1');
  }

  // Open / close

  function openDrawer() {
    dismissNudge();
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('visible');
    fab.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => drawer.classList.add('open'));
    setTimeout(() => {
      const first = drawer.querySelector('button, input, textarea, [tabindex]');
      if (first) first.focus();
    }, 50);
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
    fab.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { drawer.hidden = true; }, 300);
  }

  fab.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
  });

  // Type pills

  pills.forEach((pill) => {
    pill.addEventListener('click', () => selectType(pill.dataset.type));
  });

  function selectType(type) {
    pills.forEach((p) => {
      const active = p.dataset.type === type;
      p.classList.toggle('active', active);
      p.setAttribute('aria-pressed', String(active));
    });
    typeInput.value = type;
    document.getElementById('type-error').hidden = true;
  }

  // Form submission 

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const type      = typeInput.value.trim();
    const content   = document.getElementById('suggest-content').value.trim();
    const email     = document.getElementById('suggest-email').value.trim();
    const submitBtn = document.getElementById('suggest-submit');
    const formErr   = document.getElementById('suggest-form-error');

    // Validate
    let valid = true;
    if (!type) {
      document.getElementById('type-error').hidden = false;
      valid = false;
    }
    if (!content) {
      document.getElementById('content-error').hidden = false;
      valid = false;
    }
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    formErr.hidden = true;

    try {
      const res = await fetch('/api/v1/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, email: email || undefined }),
      });

      if (!res.ok) throw new Error('Request failed');
      showSuccess();
    } catch (_) {
      // Mock success on localhost so the full flow can be tested before the API is live
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showSuccess();
        return;
      }
      formErr.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send suggestion';
    }
  });

  // Clear individual field errors on input
  document.getElementById('suggest-content').addEventListener('input', () => {
    document.getElementById('content-error').hidden = true;
  });

  // Success state

  function showSuccess() {
  form.style.display = 'none';
  success.style.display = 'flex';
}

another.addEventListener('click', () => {
  form.reset();
  typeInput.value = '';
  pills.forEach((p) => {
    p.classList.remove('active');
    p.setAttribute('aria-pressed', 'false');
  });
  const submitBtn = document.getElementById('suggest-submit');
  submitBtn.disabled = false;
  submitBtn.textContent = 'Send suggestion';
  form.style.display = '';      
  success.style.display = 'none'; 
});
}