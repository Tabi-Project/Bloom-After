import { icons } from './icons.js';

const emergencyContacts = [
  {
    label: 'Nigeria Suicide Prevention Helpline',
    phone: '0806 210 6493',
  },
  {
    label: 'Mentally Aware Nigeria Initiative',
    phone: '0809 111 6264',
  },
];

const footerLinks = [
  {
    title: 'SUPPORT',
    items: [
      { text: 'Resources', href: '/resources' },
      { text: 'Find a Clinic', href: '/clinics' },
      // { text: 'Specialists', href: 'specialists.html' },
      { text: 'Lifestyle Guides', href: '/lifestyle' },
    ],
  },
  {
    title: 'COMMUNITY',
    items: [
      { text: 'Stories', href: '/stories' },
      { text: 'Share Your Story', href: '/submit-story' },
      // { text: 'Podcasts & Media', href: '/media' },
      { text: 'NGO Directory', href: '/ngos' },
    ],
  },
  {
    title: 'PROJECT',
    items: [
      { text: 'Our Team', href: '/#team' },
      // { text: 'Privacy Policy', href: '#' },
      { text: 'GitHub', href: 'https://github.com/Tabi-Project/Bloom-After.git' },
      { text: 'Contributing Guide', href: 'https://github.com/Tabi-Project/Bloom-After.git' },
    ],
  },
];

export const renderFooter = () => {
  return `
    <footer class="main-footer">
      <div class="emergency-banner">
        <h3>Need Immediate Help?</h3>
        <div class="contact-links">
          ${emergencyContacts
            .map(
              (c) =>
                `<a href="tel:${c.phone.replace(/\s/g, '')}" class="contact-item"><span class="icon">${icons.phone}</span><div><p class="label">${c.label}</p><p class="phone">${c.phone}</p></div></a>`
            )
            .join('')}
        </div>
      </div>

      <div class="footer-content">
        <div class="footer-brand">
          <h2>Bloom After</h2>
          <p>A safe, clinically grounded space for navigating postpartum depression.</p>
          <p class="partnership">A joint initiative by the Tabi Project and TEE Foundation.</p>
        </div>

        <div class="footer-links-grid">
          ${footerLinks
            .map(
              (col) =>
                `<div class="footer-column">
                  <h4>${col.title}</h4>
                  <ul>
                    ${col.items
                      .map((link) => {
                        const isExternal = link.href.startsWith('http');
                        const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
                        
                        return `<li><a href="${link.href}"${externalAttrs}>${link.text}</a></li>`;
                      })
                      .join('')}
                  </ul>
                </div>`
            )
            .join('')}
        </div>
      </div>

      <div class="footer-bottom">
        <p class="disclaimer">The content on Bloom After is strictly for informational purposes and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider.</p>
        <div class="bottom-flex">
          <p>&copy; 2026 Tabi Project - TEE Foundation - Open Source Initiative</p>
          <div class="crisis-badge">Crisis Line: 0800 123 4567</div>
        </div>
      </div>
    </footer>
  `;
};
