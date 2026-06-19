import Link from 'next/link';
import { Phone, Link as LinkIcon } from 'lucide-react';

interface EmergencyContact {
  label: string;
  phone?: string;
  href?: string;
  text?: string;
}

interface FooterLink {
  text: string;
  href: string;
}

interface FooterColumn {
  title: string;
  items: FooterLink[];
}

const emergencyContacts: EmergencyContact[] = [
  { label: 'Nigeria Suicide Prevention Helpline', phone: '0806 210 6493' },
  { label: 'Mentally Aware Nigeria Initiative', phone: '0809 111 6264' },
  { label: 'Need More Information in case of Emergencies', href: '/crisis-handling', text: 'Visit our crisis handling hub today' },
];

const footerLinks: FooterColumn[] = [
  {
    title: 'SUPPORT',
    items: [
      { text: 'Resources', href: '/resources' },
      { text: 'Find a Clinic', href: '/clinics' },
      { text: 'NGO Directory', href: '/ngos' },
      { text: 'Crisis Handling Hub', href: '/crisis-handling' },
    ],
  },
  {
    title: 'COMMUNITY',
    items: [
      { text: 'Stories', href: '/stories' },
      { text: 'Share Your Story', href: '/stories/editor' },
      { text: 'Lifestyle Guides', href: '/lifestyle' },
    ],
  },
  {
    title: 'PROJECT',
    items: [
      { text: 'Our Team', href: '/#team' },
      { text: 'GitHub', href: 'https://github.com/Tabi-Project/Bloom-After.git' },
      { text: 'Contributing Guide', href: 'https://github.com/Tabi-Project/Bloom-After.git' },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="emergency-banner">
        <h3>Need Immediate Help?</h3>
        <div className="contact-links">
          {emergencyContacts.map((contact, index) => {
            if (contact.href) {
              return (
                <Link href={contact.href} key={index} className="contact-item">
                  <span className="icon"><LinkIcon size={14} /></span>
                  <div>
                    <p className="label">{contact.label}</p>
                    <p className="phone">{contact.text || contact.href}</p>
                  </div>
                </Link>
              );
            }

            return (
              <a href={`tel:${contact.phone?.replace(/\s/g, '')}`} key={index} className="contact-item">
                <span className="icon"><Phone size={14} /></span>
                <div>
                  <p className="label">{contact.label}</p>
                  <p className="phone">{contact.phone}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div className="footer-content">
        <div className="footer-brand">
          <h2>Bloom After</h2>
          <p>A safe, clinically grounded space for navigating postpartum depression.</p>
          <p className="partnership">A joint initiative by the Tabi Project and TEE Foundation.</p>
        </div>

        <div className="footer-links-grid">
          {footerLinks.map((column, colIndex) => (
            <div className="footer-column" key={colIndex}>
              <h4>{column.title}</h4>
              <ul>
                {column.items.map((link, linkIndex) => {
                  const isExternal = link.href.startsWith('http');
                  
                  return (
                    <li key={linkIndex}>
                      {isExternal ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                          {link.text}
                        </a>
                      ) : (
                        <Link href={link.href}>
                          {link.text}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p className="disclaimer">
          The content on Bloom After is strictly for informational purposes and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider.
        </p>
        <div className="bottom-flex">
          <p>&copy; {currentYear} Tabi Project - TEE Foundation - Open Source Initiative</p>
          <div className="crisis-badge">Crisis Line: 0800 123 4567</div>
        </div>
      </div>
    </footer>
  );
}