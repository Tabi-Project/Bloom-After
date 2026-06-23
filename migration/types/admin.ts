export interface AdminSubmissionItem {
  clinic: DataClinic;
}
export interface DataClinic {
  id: string;
  title: string;
  description?: string;
  email?: string;
  location?: string;
  link?: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'removed' | 'deleted';
  moderatorNote?: string;
  submittedAt: string;
  
  // Specialist 
  speciality?: string;
  consultationTypes?: string;
  
  // Media 
  mediaType?: string;
}