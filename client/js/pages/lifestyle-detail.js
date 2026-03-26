import { interventions } from '../data/lifestyle.js';
import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

document.getElementById('navbar-root').innerHTML = renderNavbar('lifestyle');
initNavbar();
document.getElementById('footer-root').innerHTML = renderFooter();

const params = new URLSearchParams(window.location.search);
const item = interventions.find(i => i.id === params.get('id'));
const heroEl = document.getElementById('lmd-hero');

if (item) {
  heroEl.style.backgroundColor = 'var(--color-brand-700)'; 
  
  heroEl.innerHTML = `
    <div class="resource-hero-overlay" aria-hidden="true"></div>
    <div class="resource-hero-content container">
      <span class="resource-hero-tag">${item.category}</span>
      <h1 class="resource-hero-title">${item.title}</h1>
      <p class="resource-hero-summary">${item.subtitle}</p>
    </div>
  `;

  document.getElementById('lmd-content').innerHTML = `
    <section class="lmd-section">
      <h2 class="lmd-section-title">The Foundation</h2>
      ${item.foundation.map(p => `<p>${p}</p>`).join('')}
    </section>

    <section class="lmd-section">
      <h2 class="lmd-section-title">Practical Strategies</h2>
      <ul class="lmd-tips-grid">
        ${item.tips.map(t => `
          <li class="lmd-tip-card">
            <h4>${t.title}</h4>
            <p>${t.desc}</p>
          </li>
        `).join('')}
      </ul>
    </section>

    <section class="lmd-section">
      <h2 class="lmd-section-title">Clinical Evidence</h2>
      <ul class="lmd-evidence-list">
        ${item.evidence.map(e => `<li>${e}</li>`).join('')}
      </ul>
    </section>
  `;
} else {
  document.getElementById('lmd-content').innerHTML = `
    <section class="error-state">
      <h2>Intervention Not Found</h2>
      <p>We couldn't find the strategy you were looking for.</p>
      <a href="/client/lifestyle/index.html" class="btn btn-primary">Back to Lifestyle Hub</a>
    </section>
  `;
}