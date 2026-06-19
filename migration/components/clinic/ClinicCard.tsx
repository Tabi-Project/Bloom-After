import { MapPin } from 'lucide-react';

interface ClinicCardProps {
  clinic: {
    id: string | number;
    name: string;
    provider_type: string;
    city: string;
    state: string;
    coordinates: [number, number];
    fee_range: string;
    cost_type: string;
    focus_areas: string[];
    accepting_new_patients?: boolean;
  };
  onClick: () => void;
}

function formatTag(tag: string): string {
  return tag.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function ClinicCard({ clinic, onClick }: ClinicCardProps) {
  const specialtyTags = clinic.focus_areas.slice(0, 2).map(formatTag);
  const isFreeOrSubsidised = clinic.cost_type === 'free' || clinic.cost_type === 'subsidised';
  const providerLabel = clinic.provider_type.replace(/_/g, ' ');

  return (
    <article className="clinic-card" onClick={onClick}>

      {/* Avatar */}
      <div className="card-avatar" aria-hidden="true">
        <MapPin size={32} />
      </div>

      {/* Header */}
      <header className="card-header">
        <div className="card-header-row">
          <span className="card-provider-type">{providerLabel}</span>

          {/* Status badge */}
          {typeof clinic.accepting_new_patients === 'boolean' && (
            <span
              className={`status-badge ${
                clinic.accepting_new_patients ? 'status-accepting' : 'status-full'
              }`}
            >
              {clinic.accepting_new_patients ? 'Accepting patients' : 'Currently full'}
            </span>
          )}
        </div>

        <h3 className="card-title">{clinic.name}</h3>
        <p className="card-subtitle">{clinic.city}, {clinic.state}</p>
      </header>

      {/* Specialty + cost tags */}
      <ul className="card-tags" aria-label="Specialties and pricing">
        {isFreeOrSubsidised && (
          <li className="tag-pill tag-pill--highlight">Free / Subsidised</li>
        )}
        {specialtyTags.map((tag) => (
          <li key={tag} className="tag-pill">{tag}</li>
        ))}
      </ul>

      {/* Fee */}
      <p className="card-fee">
        {clinic.fee_range} <span>per session</span>
      </p>

      {/* Actions */}
      <footer className="card-actions">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.coordinates[0]},${clinic.coordinates[1]}`}
          target="_blank"
          rel="noreferrer"
          className="btn-outline"
          onClick={(e) => e.stopPropagation()}
        >
          Directions
        </a>
        <button className="btn-solid">View details</button>
      </footer>

    </article>
  );
}