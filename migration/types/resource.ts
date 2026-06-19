export interface ParagraphBlock {
  type: "paragraph";
  text: string;
}

export interface SectionTextImageBlock {
  type: "section-text-image";
  heading: string;
  body: string;
  items: string[];
  image_url?: string;
  imageUrl?: string;
}

export interface SectionImageTextBlock {
  type: "section-image-text";
  heading: string;
  body: string;
  items: string[];
  image_url?: string;
  imageUrl?: string;
}

export interface BulletListBlock {
  type: "bullet-list";
  items: string[];
}

export interface CalloutBlock {
  type: "callout";
  text: string;
}

export type ArticleBlock =
  | ParagraphBlock
  | SectionTextImageBlock
  | SectionImageTextBlock
  | BulletListBlock
  | CalloutBlock;

export interface InfographicItem {
  icon: string;
  label: string;
}

export interface InfographicContent {
  title: string;
  items: InfographicItem[];
  tagline: string;
}

export interface MythFactItem {
  label: string;
  description: string;
}

export interface MythBustingContent {
  myths: MythFactItem[];
  facts: MythFactItem[];
}

export interface MediaContent {
  summary_paragraphs: string[];
}

export type ContentType = "article" | "infographic" | "media" | "myth-busting";

export type MediaFormat = "audio" | "podcast" | "video";

export interface Resource {
  id: string;
  title: string;
  summary: string;
  theme: string;
  content_type: ContentType;
  image_url?: string;
  imageUrl?: string;
  date: string;
  read_time: string;
  cta_label: string;
  published: boolean;
  file_url?: string;
  media_format?: MediaFormat;
  structured_content?:
    | ArticleBlock[]      
    | InfographicContent  
    | MythBustingContent  
    | MediaContent;       
}

export interface Pagination {
  totalResources: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ResourcesResponse {
  data: Resource[];
  pagination: Pagination;
}