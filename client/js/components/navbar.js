function resolveLogoImage(fileName) {
  return new URL(`../../assets/logo/${fileName}`, import.meta.url).href;
}

function renderNavbar(activePage = '') {
  return `
    <nav class="navbar" aria-label="Main navigation">

      <a href="/" class="navbar-logo" aria-label="Bloom After home">
        <img src="${resolveLogoImage('BLOOM LIGHT primary.png')}" alt="Bloom After logo" />
      </a>

      <nav class="navbar-links" aria-label="Desktop navigation">

        <a href="/resources" class="navbar-link ${activePage === 'resources' ? 'active' : ''}">
          Resources Hub
        </a>

        <span class="navbar-dropdown">
          <button class="navbar-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Get Support <span class="navbar-chevron" aria-hidden="true">▾</span>
          </button>
          <nav class="navbar-dropdown-menu" aria-label="Get Support">
            <a href="/clinics" class="${activePage === 'clinics' ? 'active' : ''}">Clinics & Hospitals</a>
            <a href="/ngos" class="${activePage === 'ngos' ? 'active' : ''}">NGO Directory</a>
             <a href="/crisis-handling" class="${activePage === 'crisis-handling' ? 'active' : ''}">Crisis Handling</a>
          </nav>
        </span>

        <span class="navbar-dropdown">
          <button class="navbar-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Community <span class="navbar-chevron" aria-hidden="true">▾</span>
          </button>
          <nav class="navbar-dropdown-menu" aria-label="Community">
            <a href="/stories" class="${activePage === 'stories' ? 'active' : ''}">Stories</a>
            <a href="/lifestyle" class="${activePage === 'lifestyle' ? 'active' : ''}">Lifestyle & Interventions</a>
          </nav>
        </span>

        <a href="/#team" class="navbar-link ${activePage === 'contributors' ? 'active' : ''}">
          The Team
        </a>

      </nav>

      <a href="/clinics" class="navbar-cta">Find care near you</a>

      <button
        class="navbar-hamburger"
        aria-label="Open menu"
        aria-expanded="false"
        aria-controls="mobile-menu"
      >
        <span></span><span></span><span></span>
      </button>

    </nav>

    <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation" aria-hidden="true">

      <span class="mobile-menu-group-label">Learn More</span>
      <a href="/resources" class="mobile-menu-link">Resources Hub</a>

      <span class="mobile-menu-group-label">Get Support</span>
      <a href="/clinics" class="mobile-menu-link">Clinics & Hospitals</a>
      <a href="/ngos" class="mobile-menu-link">NGO Directory</a>

      <span class="mobile-menu-group-label">Community</span>
      <a href="/stories" class="mobile-menu-link">Stories</a>
      <a href="/lifestyle" class="mobile-menu-link">Lifestyle & Interventions</a>

      <span class="mobile-menu-group-label">The Team</span>
      <a href="/#team" class="mobile-menu-link">Contributors</a>

      <aside class="mobile-menu-crisis" aria-label="Crisis support">
        <p>If you are in crisis:</p>
        <a href="tel:08001234567">0800 123 4567</a>
      </aside>

    </nav>
  `;
}

function initNavbar() {
  const hamburger = document.querySelector('.navbar-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  // hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.setAttribute('aria-hidden', String(isOpen));
  });

  // close on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.navbar-dropdown')) {
      document.querySelectorAll('.navbar-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.querySelector('.navbar-dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });

  // close on link click
  mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // close on escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.navbar-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.querySelector('.navbar-dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });
}

export { renderNavbar, initNavbar };