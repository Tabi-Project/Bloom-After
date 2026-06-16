export interface NgoContact {
  phone?: string;
  email?: string;
}

export interface Ngo {
  id: string | number;
  name: string;
  cover_image: string;
  mission: string;
  focus_areas: string;
  focus_tags: string[];
  services: string[];
  geographic_coverage: string;
  coverage_type: string;
  contact: NgoContact;
  website: string;
  status: string;
}