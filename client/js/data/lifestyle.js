import { icons } from '../components/icons.js';
import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

const cardsData = [
  {
    icon: icons.sleep,
    title: 'Sleep Strategies',
    description: 'Prioritize rest through "shifts" with a partner or restorative nap techniques.',
    citation: 'Harvard Health'
  },
  {
    icon: icons.nutrition,
    title: 'Nutrition',
    description: 'Focus on anti-inflammatory foods, omega-3s, and hydration for hormonal balance.',
    citation: 'WHO'
  },
  {
    icon: icons.movement,
    title: 'Movement',
    description: 'Gentle activities like walking or restorative yoga release endorphins.',
    citation: 'Mayo Clinic'
  },
  {
    icon: icons.social,
    title: 'Social Connection',
    description: 'Engage with peers to reduce isolation and buffer against depression.',
    citation: 'APA'
  },
  {
    icon: icons.journalling,
    title: 'Journalling',
    description: 'Expressive writing helps process emotions and track mood patterns.',
    citation: 'Cambridge Medicine'
  },
  {
    icon: icons.therapy,
    title: 'Therapy (CBT/IPT)',
    description: 'CBT and IPT restructure negative thoughts and manage life transitions.',
    citation: 'Consult a doctor'
  },
  {
    icon: icons.medication,
    title: 'Medication Overview',
    description: 'SSRIs and other interventions can be vital for moderate to severe postpartum depression.',
    citation: 'Consult a doctor'
  }
];

function renderCards() {
  const container = document.getElementById('cards-container');
  container.innerHTML = cardsData.map(card => `
    <div class="card">
      <div class="card-icon">${card.icon}</div>
      <h3>${card.title}</h3>
      <p>${card.description}</p>
      <span class="card-citation">${card.citation}</span>
    </div>
  `).join('');
}

function initPage() {
  // Render Navbar and Footer
  const navbarRoot = document.getElementById('navbar-root');
  navbarRoot.innerHTML = renderNavbar('lifestyle');
  initNavbar();

  const footerRoot = document.getElementById('footer-root');
  footerRoot.innerHTML = renderFooter();

  // Render Cards
  renderCards();
}

document.addEventListener('DOMContentLoaded', initPage);