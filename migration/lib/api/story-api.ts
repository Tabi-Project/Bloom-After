import api from "../api";
import { Story, StoriesResponse, FetchStoriesParams } from "@/types/story";

const normalizeStory = (story: Record<string, unknown>): Story => {
  const get = (key: string) => story[key];

  return {
    _id: (get("_id") as string) || "",
    name: (get("name") as string) || "",
    email: (get("email") as string) || "",
    privacy: (get("privacy") as "named" | "anonymous") || "named",
    story: (get("story") as string) || "",
    story_text: (get("story_text") as string) || "",
    image_url: (get("image_url") as string) || "",
    what_helped: Array.isArray(get("what_helped"))
      ? (get("what_helped") as string[])
      : [],
    location: (get("location") as string) || "",
    consent: typeof get("consent") === "boolean" ? (get("consent") as boolean) : false,
    status: (get("status") as Story["status"]) || "pending",
    moderatorNote: (get("moderatorNote") as string) || "",
    createdAt: (get("createdAt") as string) || null,
    updatedAt: (get("updatedAt") as string) || null,
    submittedAt: (get("submittedAt") as string) || "",
  };
};

export interface FetchStoriesResult {
  stories: Story[];
  pagination: StoriesResponse["pagination"] | null;
}

export async function fetchStories({
  page = 1,
  limit = 9,
  status = "approved",
}: FetchStoriesParams = {}): Promise<FetchStoriesResult> {
  const query: Record<string, string | number> = { page, limit };
  if (status) query.status = status;

  const response = await api.get<StoriesResponse>("/api/v1/stories", { query });

  return {
    stories: Array.isArray(response?.data)
      ? response.data.map(normalizeStory)
      : [],
    pagination: response?.pagination ?? null,
  };
}

export async function fetchStoryById(id: string): Promise<Story | null> {
  const result = await api.get<{ data: Story }>(`/api/v1/stories/${id}`);
  return result?.data ?? null;
}