function renderNavbar(activePage = '') {
  return `
    <nav class="navbar" aria-label="Main navigation">

      <a href="../pages/index.html" class="navbar-logo" aria-label="Bloom After home">
        <img src="../assets/logo/BLOOM LIGHT primary.png" alt="Bloom After logo" />
      </a>

      <nav class="navbar-links" aria-label="Desktop navigation">

        <span class="navbar-dropdown">
          <button class="navbar-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Learn More <span class="navbar-chevron" aria-hidden="true">▾</span>
          </button>
          <nav class="navbar-dropdown-menu" aria-label="Learn More">
            <a href="resources.html" class="${activePage === 'resources' ? 'active' : ''}">Resources Hub</a>
            <a href="interventions.html" class="${activePage === 'interventions' ? 'active' : ''}">Lifestyle & Interventions</a>
          </nav>
        </span>

        <span class="navbar-dropdown">
          <button class="navbar-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Get Support <span class="navbar-chevron" aria-hidden="true">▾</span>
          </button>
          <nav class="navbar-dropdown-menu" aria-label="Get Support">
            <a href="clinics.html" class="${activePage === 'clinics' ? 'active' : ''}">Clinics & Hospitals</a>
            <a href="specialists.html" class="${activePage === 'specialists' ? 'active' : ''}">Specialists</a>
            <a href="ngos.html" class="${activePage === 'ngos' ? 'active' : ''}">NGO Directory</a>
          </nav>
        </span>

        <span class="navbar-dropdown">
          <button class="navbar-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Community <span class="navbar-chevron" aria-hidden="true">▾</span>
          </button>
          <nav class="navbar-dropdown-menu" aria-label="Community">
            <a href="stories.html" class="${activePage === 'stories' ? 'active' : ''}">Stories</a>
            <a href="media.html" class="${activePage === 'media' ? 'active' : ''}">Podcasts & Media</a>
          </nav>
        </span>

        <a href="index.html#team" class="navbar-link ${activePage === 'contributors' ? 'active' : ''}">
          The Team
        </a>

      </nav>

      <a href="clinics.html" class="navbar-cta">Start a Conversation</a>

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
      <a href="resources.html" class="mobile-menu-link">Educational Hub</a>
      <a href="interventions.html" class="mobile-menu-link">Lifestyle & Interventions</a>

      <span class="mobile-menu-group-label">Get Support</span>
      <a href="clinics.html" class="mobile-menu-link">Clinics & Hospitals</a>
      <a href="specialists.html" class="mobile-menu-link">Specialists</a>
      <a href="ngos.html" class="mobile-menu-link">NGO Directory</a>

      <span class="mobile-menu-group-label">Community</span>
      <a href="stories.html" class="mobile-menu-link">Stories</a>
      <a href="media.html" class="mobile-menu-link">Podcasts & Media</a>

      <span class="mobile-menu-group-label">The Team</span>
      <a href="index.html#team" class="mobile-menu-link">Contributors</a>

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
  // const dropdownToggles = document.querySelectorAll('.navbar-dropdown-toggle');

  // hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.setAttribute('aria-hidden', String(isOpen));
  });

  // desktop dropdowns
  // dropdownToggles.forEach(toggle => {
  //   toggle.addEventListener('click', () => {
  //     const parent = toggle.closest('.navbar-dropdown');
  //     const isOpen = parent.classList.contains('open');

  //     document.querySelectorAll('.navbar-dropdown.open').forEach(d => {
  //       d.classList.remove('open');
  //       d.querySelector('.navbar-dropdown-toggle').setAttribute('aria-expanded', 'false');
  //     });

  //     if (!isOpen) {
  //       parent.classList.add('open');
  //       toggle.setAttribute('aria-expanded', 'true');
  //     }
  //   });
  // });

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