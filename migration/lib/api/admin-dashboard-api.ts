import api, { ApiError } from "../api";
import {
  AdminStats,
  AdminStatsApiResponse,
  AdminStoriesListApiResponse,
  AdminNgosListApiResponse,
  AdminSuggestionsListApiResponse,
  AdminQueueItem,
  AdminQueueItemType,
} from "@/types/admin-dashboard";

export class AdminAuthError extends Error {
  constructor() {
    super("Admin session expired or unauthorized.");
    this.name = "AdminAuthError";
  }
}

const isAuthError = (error: unknown): boolean =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const res = await api.get<AdminStatsApiResponse>("/api/v1/admin/stats");
    return res.data;
  } catch (error) {
    if (isAuthError(error)) throw new AdminAuthError();
    throw error;
  }
}

const stripHtml = (value: string): string => value.replace(/<[^>]+>/g, " ").trim();

const REVIEW_HREF: Record<AdminQueueItemType, (id: string) => string> = {
  story: (id) => `/admin/moderation/stories?id=${encodeURIComponent(id)}`,
  ngo: (id) => `/admin/moderation?type=ngo&id=${encodeURIComponent(id)}`,
  suggestion: (id) => `/admin/moderation?type=media&id=${encodeURIComponent(id)}`,
};

const normalizeQueueItem = (
  item: Record<string, unknown>,
  type: AdminQueueItemType
): AdminQueueItem => {
  const id = String(item._id || item.id || "");
  const content = typeof item.content === "string" ? item.content : "";
  const story = typeof item.story === "string" ? item.story : "";
  const storyText = typeof item.story_text === "string" ? item.story_text : "";

  const title =
    (typeof item.title === "string" && item.title) ||
    (typeof item.name === "string" && item.name) ||
    (content && content.slice(0, 80)) ||
    (story && stripHtml(story).slice(0, 80)) ||
    (storyText && storyText.slice(0, 80)) ||
    "Untitled";

  const contact = (item.contact as { email?: string } | undefined) || undefined;
  const submittedBy =
    (typeof item.submittedBy === "string" && item.submittedBy) ||
    (typeof item.email === "string" && item.email) ||
    contact?.email ||
    (item.privacy === "named" && typeof item.name === "string" ? item.name : null) ||
    (type === "story" ? "Anonymous" : null);

  return {
    id,
    type,
    title: title || "Untitled",
    submittedBy: submittedBy || null,
    submittedAt:
      (typeof item.submittedAt === "string" && item.submittedAt) ||
      (typeof item.createdAt === "string" && item.createdAt) ||
      null,
    status: (typeof item.status === "string" && item.status) || "pending",
    reviewHref: REVIEW_HREF[type](id),
  };
};

const rejectsWithAuthError = (results: PromiseSettledResult<unknown>[]): boolean =>
  results.some((r) => r.status === "rejected" && isAuthError(r.reason));

/**
 * Pulls the unified "needs review" queue. Only stories, NGOs, and suggestions
 * have a pending-approval workflow on the backend — clinics are admin-authored
 * (draft/published/archived) so they're excluded here, see types/admin-dashboard.ts.
 */
export async function fetchAdminModerationQueue(): Promise<AdminQueueItem[]> {
  const [storiesRes, ngosRes, suggestionsRes] = await Promise.allSettled([
    api.get<AdminStoriesListApiResponse>("/api/v1/admin/stories", {
      query: { status: "pending" },
    }),
    api.get<AdminNgosListApiResponse>("/api/v1/admin/ngos", {
      query: { status: "pending", limit: 50 },
    }),
    api.get<AdminSuggestionsListApiResponse>("/api/v1/admin/suggestions", {
      query: { status: "pending", limit: 50 },
    }),
  ]);

  if (rejectsWithAuthError([storiesRes, ngosRes, suggestionsRes])) {
    throw new AdminAuthError();
  }

  const items: AdminQueueItem[] = [];

  if (storiesRes.status === "fulfilled") {
    (storiesRes.value.data?.stories || []).forEach((item) =>
      items.push(normalizeQueueItem(item, "story"))
    );
  }
  if (ngosRes.status === "fulfilled") {
    (ngosRes.value.data?.ngos || []).forEach((item) =>
      items.push(normalizeQueueItem(item, "ngo"))
    );
  }
  if (suggestionsRes.status === "fulfilled") {
    (suggestionsRes.value.data?.suggestions || []).forEach((item) =>
      items.push(normalizeQueueItem(item, "suggestion"))
    );
  }

  return items.sort(
    (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
  );
}

/**
 * Lightweight pending count for the sidebar badge, shown on every admin page.
 * Filters server-side by status so it doesn't pull full submission payloads.
 */
export async function fetchAdminPendingCount(): Promise<number> {
  const [storiesRes, ngosRes, suggestionsRes] = await Promise.allSettled([
    api.get<AdminStoriesListApiResponse>("/api/v1/admin/stories", {
      query: { status: "pending" },
    }),
    api.get<{ pagination?: { totalNgos?: number } }>("/api/v1/admin/ngos", {
      query: { status: "pending", limit: 1 },
    }),
    api.get<{ pagination?: { totalSuggestions?: number } }>("/api/v1/admin/suggestions", {
      query: { status: "pending", limit: 1 },
    }),
  ]);

  if (rejectsWithAuthError([storiesRes, ngosRes, suggestionsRes])) {
    throw new AdminAuthError();
  }

  let total = 0;
  if (storiesRes.status === "fulfilled") {
    total += storiesRes.value.data?.stories?.length || 0;
  }
  if (ngosRes.status === "fulfilled") {
    total += ngosRes.value.pagination?.totalNgos || 0;
  }
  if (suggestionsRes.status === "fulfilled") {
    total += suggestionsRes.value.pagination?.totalSuggestions || 0;
  }

  return total;
}
