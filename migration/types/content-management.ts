import {
  ArticleBlock,
  ContentType as ResourceContentType,
  InfographicContent,
  MediaContent,
  MediaFormat,
  MythBustingContent,
} from "./resource";

export type ContentDestination = "resource" | "lifestyle" | "ngo" | "clinic";

// draft/published/archived — what resources, lifestyle, and clinics use.
export type ContentStatus = "draft" | "published" | "archived";

// pending/approved/rejected — what NGOs use (see server/models/ngo.js).
// The content-manager UI maps this to ContentStatus for display/filtering
// (approved->published, rejected->archived, pending->draft); see
// lib/content-management.ts mapNgoStatusToContentStatus / mapContentStatusToNgoStatus.
export type NgoStatus = "pending" | "approved" | "rejected";

export type FieldType = "text" | "textarea" | "select" | "checkbox" | "url" | "email" | "tel";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  label: string;
  type: FieldType;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
  options?: SelectOption[];
}

export interface DestinationConfig {
  id: ContentDestination;
  label: string;
  desc: string;
  color: string;
  bgColor: string;
  /** Field keys (into FIELD_DEFS) shown in the editor for this type. */
  fields: string[];
  apiBase: string;
  backUrl: string;
  /**
   * Undefined when the backend has no admin "create" endpoint for this type
   * (NGOs are only created via public submission — see adminNgosRouter.js).
   */
  newUrl?: string;
}

// Unified row shown in the "All Content" table and used for destination
// card counts + published/draft/archived stat pills.
export interface ContentListItem {
  id: string;
  title: string;
  type: ContentDestination;
  status: ContentStatus;
  updatedAt: string | null;
}

// Dynamic editor form state. Field values are always string (text/textarea/
// select/url/email/tel inputs) or boolean (checkboxes) — see FieldType above.
export interface ContentFormData {
  type: ContentDestination;
  status: ContentStatus;
  featured: boolean;
  updatedAt?: string | null;
  [key: string]: string | boolean | ContentDestination | ContentStatus | null | undefined;
}

// ---- Raw admin list/detail API response shapes ----
// See server/controllers/{resources,lifestyle,ngos,clinics}Controller.js

export interface AdminResourceRaw {
  id: string;
  title: string;
  summary: string;
  content: string;
  theme: string;
  content_type: ResourceContentType;
  imageUrl: string;
  image_url: string;
  source_url?: string;
  file_url?: string;
  media_format?: MediaFormat;
  read_time: string;
  cta_label: string;
  structured_content?: ArticleBlock[] | InfographicContent | MythBustingContent | MediaContent | null;
  status: ContentStatus;
  published: boolean;
  featured?: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminLifestyleTip {
  title: string;
  desc: string;
}

export interface AdminLifestyleRaw {
  id: string; // slug, falls back to _id — see normalizeLifestyle in lifestyleController.js
  title: string;
  category: "lifestyle" | "medical";
  subtitle: string;
  summary: string;
  foundation: string[];
  tips: AdminLifestyleTip[];
  evidence: string[];
  status: ContentStatus;
  updatedAt: string | null;
}

export interface AdminNgoRaw {
  id: string;
  name: string;
  mission: string;
  services: string[];
  geographic_coverage: string;
  website: string;
  contact: { phone?: string; email?: string };
  cover_image: string;
  status: NgoStatus;
  updatedAt: string | null;
}

export interface AdminClinicRaw {
  id: string;
  name: string;
  provider_type: string;
  description: string;
  services: string[];
  city: string;
  state: string;
  opening_hours: string;
  fee_range: string;
  website: string;
  cover_image: string;
  accepting_new_patients: boolean;
  contact: { phone?: string; email?: string; address?: string };
  status: ContentStatus;
  updatedAt: string | null;
}

export interface AdminResourcesListResponse {
  status: string;
  data: { resources: AdminResourceRaw[] };
}

export interface AdminLifestyleListResponse {
  status: string;
  data: { lifestyle: AdminLifestyleRaw[] };
}

export interface AdminNgosListResponse {
  status: string;
  data: { ngos: AdminNgoRaw[] };
}

export interface AdminClinicsListResponse {
  status: string;
  data: { clinics: AdminClinicRaw[] };
}

export interface AdminResourceDetailResponse {
  status: string;
  data: { resource: AdminResourceRaw };
}

export interface AdminLifestyleDetailResponse {
  status: string;
  data: { lifestyle: AdminLifestyleRaw };
}

export interface AdminNgoDetailResponse {
  status: string;
  data: { ngo: AdminNgoRaw };
}

export interface AdminClinicDetailResponse {
  status: string;
  data: { clinic: AdminClinicRaw };
}

export interface AdminImageUploadResponse {
  status: string;
  data: { imageUrl: string; image_url: string };
}
