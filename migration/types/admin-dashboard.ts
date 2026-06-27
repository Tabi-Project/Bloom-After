// Mirrors server/controllers/adminStatsController.js response shape.
export interface AdminStats {
  resources: {
    total: number;
    published: number;
    drafts: number;
  };
  stories: {
    total: number;
    pending: number;
    approved: number;
  };
  ngos: {
    total: number;
    pending: number;
    approved: number;
  };
}

export interface AdminStatsApiResponse {
  status: string;
  data: AdminStats;
}

// Raw admin list endpoints — each wraps its array under a type-named key.
// See server/controllers/{stories,ngos,clinics,suggestions}Controller.js getAdmin* handlers.
export interface AdminStoriesListApiResponse {
  status: string;
  data: { stories: Array<Record<string, unknown>> };
}

export interface AdminNgosListApiResponse {
  status: string;
  data: { ngos: Array<Record<string, unknown>> };
}

export interface AdminSuggestionsListApiResponse {
  status: string;
  data: { suggestions: Array<Record<string, unknown>> };
}

// Clinics are admin-authored (draft/published/archived) rather than public
// submissions awaiting moderation — server/models/clinic.js has no "pending"
// status, so clinics are intentionally excluded from the moderation queue.
export type AdminQueueItemType = "story" | "ngo" | "suggestion";

// Unified shape the dashboard's moderation queue renders, regardless of
// which submission type it came from.
export interface AdminQueueItem {
  id: string;
  type: AdminQueueItemType;
  title: string;
  submittedBy: string | null;
  submittedAt: string | null;
  status: string;
  reviewHref: string;
}
