import { renderNavbar, initNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { crisisData } from "../data/crisis-handling.js";

document.getElementById("navbar-root").innerHTML = renderNavbar("crisis-handling");
initNavbar();
document.getElementById("footer-root").innerHTML = renderFooter();

const root = document.getElementById("crisis-root");

function renderSection(title, severityFilter) {
  const items = crisisData.filter(c => c.severity === severityFilter);
  if (!items.length) return '';

  return `
    <section class="ch-section">
      <h2 class="ch-section-title">${title}</h2>
      <div class="ch-grid">
        ${items.map(item => `
          <button class="ch-card ch-card--${item.severity}" data-crisis-id="${item.id}">
            <div class="ch-card-icon">${item.icon}</div>
            <h3 class="ch-card-title">${item.title}</h3>
            <p class="ch-card-desc">${item.description}</p>
            <div class="ch-card-cta">
              View Protocol &rarr;
            </div>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

if (root) {
  root.innerHTML = 
    renderSection("Critical Emergencies (Act Now)", "critical") +
    renderSection("Urgent Situations (Seek Help Today)", "urgent") +
    renderSection("High Distress (Reach Out)", "distress");
}

const modal = document.getElementById('crisis-modal');
const modalBody = document.getElementById('crisis-modal-body');
const modalContentShell = document.querySelector('.ch-modal-content');
const closeBtn = modal?.querySelector('.modal-close');

const severityColors = {
  'critical': { border: 'var(--color-danger)', bg: '#fdf2f1', text: 'var(--color-danger)' },
  'urgent':   { border: 'var(--color-warning)', bg: '#fff9e6', text: '#d99c00' },
  'distress': { border: 'var(--color-primary)', bg: 'var(--color-brand-50)', text: 'var(--color-primary)' }
};

function openModal(id) {
  const item = crisisData.find(c => c.id === id);
  if (!item || !modal || !modalBody) return;

  const colors = severityColors[item.severity];

  if (modalContentShell) {
    modalContentShell.style.borderTopColor = colors.border;
  }

  modalBody.innerHTML = `
    <header class="ch-modal-header">
      <span class="ch-modal-tag" style="background: ${colors.bg}; color: ${colors.text};">
        ${item.severityLabel}
      </span>
      <h2 class="ch-modal-title" id="modal-title">${item.title}</h2>
    </header>
    
    <ul class="ch-modal-steps">
      ${item.steps.map((step, index) => `
        <li class="ch-modal-step-item">
          <span class="ch-modal-step-number" style="color: ${colors.text};">${index + 1}</span>
          <p class="ch-modal-step-text">${step}</p>
        </li>
      `).join('')}
    </ul>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('click', (e) => {
  const card = e.target.closest('.ch-card');
  if (card) {
    const id = card.getAttribute('data-crisis-id');
    openModal(id);
  }
});

closeBtn?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeModal(); 
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
});