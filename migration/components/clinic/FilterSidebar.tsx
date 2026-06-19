import React from 'react';
import { X } from 'lucide-react';

export interface FilterState {
  providerType: string;
  cost: string[];
  focus: string[];
  mode: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({ filters, setFilters, isOpen, onClose }: FilterSidebarProps) {
  const handleCheckboxChange = (key: 'cost' | 'focus', value: string) => {
    setFilters(prev => {
      const current = prev[key];
      const updated = current.includes(value) ? current.filter(i => i !== value) : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  return (
    <aside className={`directory-sidebar ${isOpen ? 'open' : ''}`} id="filter-sidebar">
      <header className="sidebar-header mobile-only">
        <h2>Filters</h2>
        <button className="btn-close" onClick={onClose} aria-label="Close filters">
          <X size={24} />
        </button>
      </header>
      
      <h2 className="filter-heading">FILTERS</h2>
      
      <fieldset className="filter-group">
        <legend className="filter-group-title">PROVIDER TYPE</legend>
        {[
          { val: 'all', label: 'All types' },
          { val: 'clinic', label: 'Clinic / Hospital' },
          { val: 'therapist', label: 'Therapist' },
          { val: 'psychiatrist', label: 'Psychiatrist' },
          { val: 'support_group', label: 'Support Group' }
        ].map(type => (
          <label className="custom-radio" key={type.val}>
            <input 
              type="radio" 
              name="provider_type" 
              value={type.val} 
              checked={filters.providerType === type.val}
              onChange={(e) => setFilters(p => ({ ...p, providerType: e.target.value }))}
            />
            <span className="radio-mark"></span>{type.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-group">
        <legend className="filter-group-title">COST</legend>
        <label className="custom-checkbox">
          <input type="checkbox" checked={filters.cost.includes('subsidised')} onChange={() => handleCheckboxChange('cost', 'subsidised')} />
          <span className="checkmark"></span>Free / Subsidised
        </label>
        <label className="custom-checkbox">
          <input type="checkbox" checked={filters.cost.includes('private')} onChange={() => handleCheckboxChange('cost', 'private')} />
          <span className="checkmark"></span>Private (all fees)
        </label>
      </fieldset>

      <fieldset className="filter-group">
        <legend className="filter-group-title">FOCUS AREA</legend>
        {[
          { val: 'perinatal_anxiety', label: 'Perinatal / Pregnancy Anxiety' },
          { val: 'pregnancy_loss', label: 'Pregnancy & Infant Loss' },
          { val: 'birth_trauma', label: 'Birth Trauma' },
          { val: 'relationship_support', label: 'Relationship & Family Support' },
          { val: 'psychiatric_medication', label: 'Psychiatric Medication' }
        ].map(focus => (
          <label className="custom-checkbox" key={focus.val}>
            <input type="checkbox" checked={filters.focus.includes(focus.val)} onChange={() => handleCheckboxChange('focus', focus.val)} />
            <span className="checkmark"></span>{focus.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-group">
        <legend className="filter-group-title">CONSULTATION MODE</legend>
        {[
          { val: 'all', label: 'Both' },
          { val: 'remote', label: 'Remote only' },
          { val: 'in_person', label: 'In-person only' }
        ].map(mode => (
          <label className="custom-radio" key={mode.val}>
            <input type="radio" name="consultation_mode" value={mode.val} checked={filters.mode === mode.val} onChange={(e) => setFilters(p => ({ ...p, mode: e.target.value }))} />
            <span className="radio-mark"></span>{mode.label}
          </label>
        ))}
      </fieldset>
    </aside>
  );
}