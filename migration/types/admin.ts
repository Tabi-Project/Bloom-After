export interface AdminSubmissionItem {
  id: string;
  name: string;
  description?: string;
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  coordinates?: [number, number];
  providerType: string;
  consultationMode: string;
  costType: string;
  focusAreas?: string[];
  status: string;
  services?: string[];
  languages?: string[];
  acceptingNewPatients?: boolean;
  moderatorNote?: string;
  openingHours?: string;
  updatedAt?: string;
  createdAt?: string;
  isOpen247: boolean;
  website?: string;
  coverImage?: string;
  credentials?: string;
  feeRange?: string;
  rating?: number;
  reviewCount?: number;
  state?: string;
  city?: string;
};
export interface AdminData {
  clinic?: AdminSubmissionItem;
  specialist?: AdminSubmissionItem;
}

export interface AdminAPiResponse {
  data: AdminData;
  status: string;
}