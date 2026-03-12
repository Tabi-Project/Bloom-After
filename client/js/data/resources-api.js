import api from "../api.js";

const normalizeStructuredContent = (resource) => {
  if (resource?.structured_content !== undefined) {
    return resource.structured_content;
  }

  if (resource?.structuredContent === undefined || resource?.structuredContent === null) {
    return null;
  }

  if (Array.isArray(resource.structuredContent?.blocks)) {
    return resource.structuredContent.blocks;
  }

  if (typeof resource.structuredContent === "object") {
    const { language, ...rest } = resource.structuredContent;
    return Object.keys(rest).length ? rest : null;
  }

  return null;
};

const normalizeResource = (resource) => {
  const normalized = {
    id: resource?.id || resource?._id || "",
    title: resource?.title || "",
    summary: resource?.summary || resource?.content || "",
    theme: resource?.theme || "",
    content_type: resource?.content_type || resource?.contentType || "article",
    image_url: resource?.image_url || resource?.imageUrl || "",
    date: resource?.date || "",
    read_time: resource?.read_time || resource?.readTime || "",
    cta_label: resource?.cta_label || resource?.ctaLabel || "Read more",
    published: typeof resource?.published === "boolean" ? resource.published : true,
  };

  const fileUrl = resource?.file_url || resource?.sourceUrl;
  if (fileUrl) {
    normalized.file_url = fileUrl;
  }

  const structuredContent = normalizeStructuredContent(resource);
  if (structuredContent !== null) {
    normalized.structured_content = structuredContent;
  }

  return normalized;
};

export async function fetchResources(
  {
    page = 1,
    limit = 9,
    content_type = "",
    q = "",
    theme = "",
    exclude_id = "",
    published = true,
  } = {},
  requestOptions = {}
) {
  const query = {
    page,
    limit,
    published: String(Boolean(published)),
  };

  if (content_type) query.content_type = content_type;
  if (q) query.q = q;
  if (theme) query.theme = theme;
  if (exclude_id) query.exclude_id = exclude_id;

  const response = await api.get("/api/v1/resources", {
    query,
    signal: requestOptions.signal,
  });

  const data = Array.isArray(response?.data)
    ? response.data.map(normalizeResource)
    : [];

  return {
    data,
    pagination: response?.pagination || {
      totalResources: data.length,
      totalPages: data.length ? 1 : 0,
      currentPage: page,
      pageSize: limit,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

export async function fetchResourceById(id, requestOptions = {}) {
  const response = await api.get(`/api/v1/resources/${encodeURIComponent(id)}`, {
    signal: requestOptions.signal,
  });
  return response?.data ? normalizeResource(response.data) : null;
}

export async function fetchRelatedResources(id, theme, requestOptions = {}) {
  const { data } = await fetchResources(
    {
      page: 1,
      limit: 3,
      theme,
      exclude_id: id,
      published: true,
    },
    requestOptions
  );

  return data;
}
