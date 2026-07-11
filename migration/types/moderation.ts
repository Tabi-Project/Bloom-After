export type SubmissionStatus = "pending" | "approved" | "rejected" | "removed" | "deleted";

export interface Submission {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  email?: string;
  link?: string;
  image_url?: string | null;
  status: SubmissionStatus;
  submittedAt?: string;
  speciality?: string;
  mediaType?: string;
  location?: string;
}

export interface TypeConfig {
  label: string;
  singular: string;
  subtitle: string;
  activePageId: string;
  editPage: string;
  apiEndpoint: string;
  hasImage: boolean;
  hasLink: boolean;
  mockItems: Submission[];
}

export type ModerationType = "clinic" | "specialist" | "media" | "request";