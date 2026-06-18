import api from "../api";

export interface Resource {
  id: string;
  title: string;
  summary: string;
  theme: string;
  content_type: string;
  imageUrl: string;
  image_url: string;
  date: string;
  read_time: string;
  cta_label: string;
  published: boolean;
}

interface ResourcesResponse {
  data?: Array<Record<string, unknown>>;
  pagination?: unknown;
}

interface FetchResourcesParams {
  page?: number;
  limit?: number;
  content_type?: string;
  q?: string;
  theme?: string;
  exclude_id?: string;
  published?: boolean;
}

const normalizeResource = (resource: Record<string, unknown>): Resource => {
  const get = (key: string) => resource[key];
  const contentType =
    (get("content_type") as string) || (get("contentType") as string) || "article";

  return {
    id: (get("id") as string) || (get("_id") as string) || "",
    title: (get("title") as string) || "",
    summary: (get("summary") as string) || (get("content") as string) || "",
    theme: (get("theme") as string) || "",
    content_type: contentType,
    imageUrl: (get("imageUrl") as string) || (get("image_url") as string) || "",
    image_url: (get("imageUrl") as string) || (get("image_url") as string) || "",
    date: (get("date") as string) || "",
    read_time: (get("read_time") as string) || (get("readTime") as string) || "",
    cta_label:
      (get("cta_label") as string) || (get("ctaLabel") as string) || "Read more",
    published:
      typeof get("published") === "boolean" ? (get("published") as boolean) : true,
  };
};

export async function fetchResources({
  page = 1,
  limit = 9,
  content_type = "",
  q = "",
  theme = "",
  exclude_id = "",
  published = true,
}: FetchResourcesParams = {}): Promise<Resource[]> {
  const query: Record<string, string | number> = {
    page,
    limit,
    published: String(Boolean(published)),
  };

  if (content_type) query.content_type = content_type;
  if (q) query.q = q;
  if (theme) query.theme = theme;
  if (exclude_id) query.exclude_id = exclude_id;

  const response = await api.get<ResourcesResponse>("/api/v1/resources", {
    query,
  });

  return Array.isArray(response?.data)
    ? response.data.map(normalizeResource)
    : [];
}

export async function fetchResourceById(id: string): Promise<Resource | null> {
  const result = await api.get<{ data: Resource }>(`/api/v1/resources/${id}`);
  return result?.data ?? null;
}