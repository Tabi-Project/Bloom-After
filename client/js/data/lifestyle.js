import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

/* ─────────────────────────────────────────────────────────
   Inline SVG icons — sized to fit each context via CSS
   ───────────────────────────────────────────────────────── */
const icon = {
  sleep: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`,

  nutrition: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>`,

  movement: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" aria-hidden="true">
    <circle cx="12" cy="5" r="2"/>
    <path d="M5.5 10h13l-2 7H7.5l-2-7z"/>
    <path d="M12 7v3"/>
  </svg>`,

  social: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,

  journalling: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>`,

  therapy: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>`,

  medication: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18M9 21V9"/>
  </svg>`,

  breastfeeding: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
    <path d="M12 8v4l3 3"/>
  </svg>`,

  warning: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`,
};

/* ─────────────────────────────────────────────────────────
   Data
   ───────────────────────────────────────────────────────── */
export const lifestyleCards = [
  {
    id: 'sleep',
    icon: icon.sleep,
    title: 'Sleep Strategies',
    description: 'Prioritise rest through shift-based schedules with a partner or restorative nap techniques. Sleep deprivation is a key physiological trigger for mood disturbances.',
    citation: 'Harvard Health',
    filter: 'lifestyle',
  },
  {
    id: 'nutrition',
    icon: icon.nutrition,
    title: 'Nutrition',
    description: 'Focus on anti-inflammatory whole foods, omega-3 fatty acids, and consistent hydration to support hormonal stabilisation and sustained energy levels.',
    citation: 'WHO',
    filter: 'lifestyle',
  },
  {
    id: 'movement',
    icon: icon.movement,
    title: 'Movement',
    description: 'Gentle, consistent activity like walking or restorative yoga releases natural endorphins and helps regulate the nervous system after childbirth.',
    citation: 'Mayo Clinic',
    filter: 'lifestyle',
  },
  {
    id: 'social',
    icon: icon.social,
    title: 'Social Connection',
    description: 'Reducing isolation by engaging with peers who understand the transition to parenthood. Shared experience is a powerful buffer against depression.',
    citation: 'APA',
    filter: 'lifestyle',
  },
  {
    id: 'journalling',
    icon: icon.journalling,
    title: 'Journalling',
    description: 'Using expressive writing to process complex emotions and track mood patterns provides a private space for honest reflection without judgement.',
    citation: 'Cambridge Medicine',
    filter: 'lifestyle',
  },
];

export const medicalCards = [
  {
    id: 'therapy',
    icon: icon.therapy,
    badge: 'Clinical Priority',
    title: 'Therapy (CBT / IPT)',
    description: 'Cognitive Behavioural Therapy (CBT) and Interpersonal Psychotherapy (IPT) are the gold standards for postpartum care. They focus on restructuring negative thought patterns and managing life transitions.',
    warning: 'Consult a doctor for personalised medical advice.',
    filter: 'medical',
    wide: false,
  },
  {
    id: 'medication',
    icon: icon.medication,
    badge: 'Evidence Based',
    title: 'Medication Overview',
    description: 'SSRIs and other pharmacological interventions can be vital for moderate to severe postpartum depression. Modern medications are increasingly refined for safety and effectiveness in postpartum populations.',
    warning: 'Consult a doctor for personalised medical advice.',
    filter: 'medical',
    wide: false,
  },
  {
    id: 'breastfeeding',
    icon: icon.breastfeeding,
    badge: 'Safety Guideline',
    title: 'Breastfeeding Considerations',
    description: 'Many therapeutic options are compatible with breastfeeding. Medical professionals use databases like LactMed to ensure that any prescribed medication has minimal impact on infant development while supporting maternal health.',
    warning: 'Consult a doctor for personalised medical advice.',
    filter: 'medical',
    wide: true,
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80',
    imageAlt: 'Supportive healthcare consultation environment',
  },
];

/* ─────────────────────────────────────────────────────────
   Render helpers
   ───────────────────────────────────────────────────────── */
function renderLifestyleCard(card) {
  return `
    <a href="/lifestyle/detail?id=${card.id}" class="lm-card" data-filter="${card.filter}" data-id="${card.id}" style="text-decoration:none;">
      <div class="lm-card-icon">${card.icon}</div>
      <h3 class="lm-card-title">${card.title}</h3>
      <p class="lm-card-desc">${card.description}</p>
      <div class="lm-card-footer">
        <span class="lm-card-citation-label">Clinical Citation</span>
        <span class="lm-card-citation">${card.citation}</span>
      </div>
    </a>
  `;
}

function renderMedicalCard(card) {
  const warningBlock = `
    <div class="lm-med-warning">
      ${icon.warning}
      <p>${card.warning}</p>
    </div>`;

  if (card.wide) {
    return `
      <a href="/lifestyle/detail?id=${card.id}" class="lm-med-card lm-med-card--wide" data-filter="${card.filter}" data-id="${card.id}" style="text-decoration:none;">
        ${card.image ? `
          <div class="lm-med-card-image">
            <img src="${card.image}" alt="${card.imageAlt}" loading="lazy" width="260" height="240" />
          </div>` : ''}
        <div class="lm-med-card-body">
          <div class="lm-med-card-header">
            <div class="lm-med-card-icon">${card.icon}</div>
            <span class="lm-med-badge">${card.badge}</span>
          </div>
          <h3 class="lm-med-card-title">${card.title}</h3>
          <p class="lm-med-card-desc">${card.description}</p>
          ${warningBlock}
        </div>
      </a>`;
  }

  return `
    <a href="/lifestyle/detail?id=${card.id}" class="lm-med-card" data-filter="${card.filter}" data-id="${card.id}" style="text-decoration:none;">
      <div class="lm-med-card-header">
        <div class="lm-med-card-icon">${card.icon}</div>
        <span class="lm-med-badge">${card.badge}</span>
      </div>
      <h3 class="lm-med-card-title">${card.title}</h3>
      <p class="lm-med-card-desc">${card.description}</p>
      ${warningBlock}
    </a>`;
}

/* ─────────────────────────────────────────────────────────
   Filter + search
   ───────────────────────────────────────────────────────── */
function applyFilters(filterValue, rawQuery) {
  const q = rawQuery.toLowerCase().trim();

  function matches(card) {
    const categoryOk = filterValue === 'all' || card.filter === filterValue;
    const searchOk   = !q
      || card.title.toLowerCase().includes(q)
      || card.description.toLowerCase().includes(q);
    return categoryOk && searchOk;
  }

  const lifestyleGrid    = document.getElementById('lm-lifestyle-grid');
  const medicalGrid      = document.getElementById('lm-medical-grid');
  const lifestyleSection = document.getElementById('lm-lifestyle-section');
  const medicalSection   = document.getElementById('lm-medical-section');
  const emptyState       = document.getElementById('lm-empty');

  const visibleLifestyle = lifestyleCards.filter(matches);
  const visibleMedical   = medicalCards.filter(matches);

  lifestyleGrid.innerHTML = visibleLifestyle.map(renderLifestyleCard).join('');
  medicalGrid.innerHTML   = visibleMedical.map(renderMedicalCard).join('');

  lifestyleSection.hidden = visibleLifestyle.length === 0;
  medicalSection.hidden   = visibleMedical.length === 0;
  emptyState.hidden       = visibleLifestyle.length > 0 || visibleMedical.length > 0;
}

/* ─────────────────────────────────────────────────────────
   Init
   ───────────────────────────────────────────────────────── */
function initPage() {
  // Mount shared components
  const navbarRoot = document.getElementById('navbar-root');
  if (navbarRoot) { navbarRoot.innerHTML = renderNavbar('lifestyle'); initNavbar(); }

  const footerRoot = document.getElementById('footer-root');
  if (footerRoot) { footerRoot.innerHTML = renderFooter(); }

  // First render — show everything
  applyFilters('all', '');

  // Filter tabs
  let activeFilter = 'all';
  let activeQuery  = '';

  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-filter]').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeFilter = btn.dataset.filter;
      applyFilters(activeFilter, activeQuery);
    });
  });

  // Search (debounced 250 ms)
  const searchInput = document.getElementById('lm-search');
  let debounce;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      activeQuery = searchInput.value;
      applyFilters(activeFilter, activeQuery);
    }, 250);
  });
}

document.addEventListener('DOMContentLoaded', initPage);