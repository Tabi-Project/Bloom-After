const featuresData = [
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
    heading: "Learn",
    desc: "Understand the signs with bite-sized, clinically vetted articles.",
    linkText: "Explore Resources",
    linkUrl: "/resources.html",
  },
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    heading: "Find Care",
    desc: "Locate vetted clinics, hospitals, and specialists near you.",
    linkText: "Search Directory",
    linkUrl: "/clinics.html",
  },
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    heading: "Connect",
    desc: "Read moderated, real stories from other mothers who have been there.",
    linkText: "Read Stories",
    linkUrl: "/stories.html",
  },
];

const trustData = [
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="10"></circle>
<path d="M9 12l2 2 4-4"></path>
</svg>`,
    text: "Everything here has been reviewed by a qualified health professional.",
  },
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
<path d="M9 12l2 2 4-4"></path>
</svg>`,
    text: "Your privacy is absolute. Nothing is shared, sold, or tracked.",
  },
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M8 13l4 4 4-4"></path>
<path d="M5 11l3 2"></path>
<path d="M19 11l-3 2"></path>
<path d="M12 5c-2.5-2-6-1-7.5 1.5C3 9 4.5 12 8 14l4 3 4-3c3.5-2 5-5 3.5-7.5C18 4 14.5 3 12 5z"></path>
</svg>`,
    text: "This is a space to understand, not to compare.",
  },
];

const arrowSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;

export const renderFeaturesCards = () => {
  return featuresData
    .map(
      (item) => `
    <article class="features-card">
      <div class="features-card-icon" aria-hidden="true">
        ${item.svg}
      </div>
      <h3 class="features-card-heading">${item.heading}</h3>
      <p class="features-card-desc">${item.desc}</p>
      <a href="${item.linkUrl}" class="features-link">
        ${item.linkText}
        <span class="features-link-icon" aria-hidden="true">${arrowSvg}</span>
      </a>
    </article>
  `
    )
    .join("");
};

export const renderTrustBanner = () => {
  return `
    <ul class="grid-3 trust-grid">
      ${trustData
        .map(
          (item) => `
        <li class="trust-item">
          <div class="trust-icon" aria-hidden="true">
            ${item.svg}
          </div>
          <p class="trust-desc">${item.text}</p>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
};
