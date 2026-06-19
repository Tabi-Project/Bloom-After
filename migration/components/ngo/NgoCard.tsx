import Image from 'next/image'; 
import { Phone, Mail, Link as LinkIcon } from 'lucide-react';
import { Ngo } from '../../types/ngo';

interface NgoCardProps {
  ngo: Ngo;
}

export default function NgoCard({ ngo }: NgoCardProps) {
  const servicesText = ngo.services.length > 0 ? ngo.services.join(', ') : 'Not specified';
  const focusText = ngo.focus_areas || (ngo.focus_tags.length > 0 ? ngo.focus_tags.join(', ') : 'General support');
  const coverageText = ngo.geographic_coverage || 'Coverage not specified';
  const image = ngo.cover_image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80';

  return (
    <article className="ngo-card">
      <div className="ngo-card-image-wrapper">
        <Image 
          src={image} 
          alt={`Cover photo for ${ngo.name}`} 
          fill
          className="ngo-card-image" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="ngo-card-badges">
          <span className="badge-coverage">{coverageText}</span>
        </div>
      </div>
      
      <div className="ngo-card-body">
        <h3 className="ngo-card-title">{ngo.name}</h3>
        <p className="ngo-card-mission">{ngo.mission}</p>
        
        <ul className="ngo-contact-list">
          <li className="ngo-contact-item">
            <span className="ngo-icon"><Phone size={16} /></span> 
            {ngo.contact.phone ? <a href={`tel:${ngo.contact.phone.replace(/\s+/g, '')}`}>{ngo.contact.phone}</a> : <span>Not available</span>}
          </li>
          <li className="ngo-contact-item">
            <span className="ngo-icon"><Mail size={16} /></span> 
            {ngo.contact.email ? <a href={`mailto:${ngo.contact.email}`}>{ngo.contact.email}</a> : <span>Not available</span>}
          </li>
          <li className="ngo-contact-item">
            <span className="ngo-icon"><LinkIcon size={16} /></span> 
            {ngo.website && ngo.website !== '#' ? <a href={ngo.website} target="_blank" rel="noopener noreferrer">Visit Website</a> : <span>Not available</span>}
          </li>
        </ul>
      </div>
      
      <div className="ngo-card-footer">
        <div className="ngo-stat">
          <span className="ngo-stat-label">Focus</span>
          <span className="ngo-stat-value">{focusText}</span>
        </div>
        <div className="ngo-stat text-right">
          <span className="ngo-stat-label">Services</span>
          <span className="ngo-stat-value services-text">{servicesText}</span>
        </div>
      </div>
    </article>
  );
}