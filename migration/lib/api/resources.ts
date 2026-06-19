import api from "../api";
import type { Resource } from "@/types/resource";

export type { Resource };

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

const normalizeStructuredContent = (
  resource: Record<string, unknown>
): Resource["structured_content"] => {
  if (resource.structured_content !== undefined) {
    return resource.structured_content as Resource["structured_content"];
  }

  const structuredContent = resource.structuredContent as
    | { blocks?: unknown; language?: unknown }
    | undefined;

  if (structuredContent === undefined || structuredContent === null) {
    return undefined;
  }

  if (Array.isArray(structuredContent.blocks)) {
    return structuredContent.blocks as Resource["structured_content"];
  }

  if (typeof structuredContent === "object") {
    const rest: Record<string, unknown> = { ...structuredContent };
    delete rest.language;
    return Object.keys(rest).length
      ? (rest as unknown as Resource["structured_content"])
      : undefined;
  }

  return undefined;
};

const normalizeResource = (resource: Record<string, unknown>): Resource => {
  const get = (key: string) => resource[key];
  const contentType = ((get("content_type") as string) ||
    (get("contentType") as string) ||
    "article") as Resource["content_type"];

  const normalized: Resource = {
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

  const sourceUrl = (get("source_url") as string) || (get("sourceUrl") as string) || "";
  const fileUrl =
    (get("file_url") as string) ||
    (get("fileUrl") as string) ||
    (contentType === "media" ? sourceUrl : "");
  if (fileUrl) {
    normalized.file_url = fileUrl;
  }

  if (contentType === "media") {
    normalized.media_format = ((get("media_format") as string) ||
      (get("mediaFormat") as string) ||
      "audio") as Resource["media_format"];
  }

  const structuredContent = normalizeStructuredContent(resource);
  if (structuredContent !== undefined) {
    normalized.structured_content = structuredContent;
  }

  return normalized;
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
  const result = await api.get<{ data: Record<string, unknown> }>(
    `/api/v1/resources/${id}`
  );
  return result?.data ? normalizeResource(result.data) : null;
}