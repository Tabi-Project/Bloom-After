export interface ClinicContact {
  phone?: string;
  email?: string;
  address?: string;
}

export interface Clinic {
  id: string | number;
  name: string;
  provider_type: string;
  city: string;
  state: string;
  coordinates: [number, number];
  fee_range: string;
  cost_type: string;
  is_open_247: boolean;
  opening_hours: string;
  consultation_mode: string;
  focus_areas: string[];
  accepting_new_patients?: boolean;
  credentials?: string;
  languages?: string[];
  contact: ClinicContact;
  services: string[];
  distance?: number;
}