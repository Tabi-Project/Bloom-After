import { icons } from './icons.js';

const featuresData = [
  {
    svg: icons.learn,
    heading: "Learn",
    desc: "Understand the signs with bite-sized, clinically vetted articles.",
    linkText: "Explore Resources",
    linkUrl: "resources.html",
  },
  {
    svg: icons.find,
    heading: "Find Care",
    desc: "Locate vetted clinics, hospitals, and specialists near you.",
    linkText: "Search Directory",
    linkUrl: "clinics.html",
  },
  {
    svg: icons.connect,
    heading: "Connect",
    desc: "Read moderated, real stories from other mothers who have been there.",
    linkText: "Read Stories",
    linkUrl: "stories.html",
  },
];

const trustData = [
  {
    svg: icons.trustCheck,
    text: "Everything here has been reviewed by a qualified health professional.",
  },
  {
    svg: icons.trustShield,
    text: "Your privacy is absolute. Nothing is shared, sold, or tracked.",
  },
  {
    svg: icons.trustHeart,
    text: "This is a space to understand, not to compare.",
  },
];

const arrowSvg = icons.arrow;

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
