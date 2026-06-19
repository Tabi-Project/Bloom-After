export interface Story {
  _id: string;
  name: string;
  email: string;
  privacy: "named" | "anonymous";
  story: string;
  story_text: string;
  image_url: string;
  what_helped: string[];
  location: string;
  consent: boolean;
  status: "pending" | "approved" | "accepted" | "rejected" | "removed";
  moderatorNote: string;
  createdAt: string | null;
  updatedAt: string | null;
  submittedAt: string;
}

export interface StoriesResponse {
  data?: Array<Record<string, unknown>>;
  pagination?: {
    totalStories: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FetchStoriesParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected" | "removed" | "";
}