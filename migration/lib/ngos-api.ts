import api, { RequestOptions } from "./api";
import { Ngo } from "../types/ngo";

const normalizeNgo = (ngo: Record<string, unknown>): Ngo => {
  const get = (key: string) => ngo[key];
  
  const focusAreas = get("focus_areas") as string;
  const focusTags = get("focus_tags");
  
  let parsedFocusTags: string[] = [];
  if (Array.isArray(focusTags)) {
    parsedFocusTags = focusTags as string[];
  } else if (typeof focusAreas === 'string') {
    parsedFocusTags = focusAreas.split(',').map(item => item.trim()).filter(Boolean);
  }

  return {
    id: (get("id") || get("_id") || "") as string | number,
    name: (get("name") || "") as string,
    cover_image: (get("cover_image") || get("coverImage") || get("image_cover") || "") as string,
    mission: (get("mission") || "") as string,
    focus_areas: focusAreas || "",
    focus_tags: parsedFocusTags,
    services: Array.isArray(get("services")) ? (get("services") as string[]) : [],
    geographic_coverage: (get("geographic_coverage") || "") as string,
    coverage_type: (get("coverage_type") || "") as string,
    contact: {
      phone: (get("contact") as Record<string, string>)?.phone || "",
      email: (get("contact") as Record<string, string>)?.email || "",
    },
    website: (get("website") || "") as string,
    status: (get("status") || "pending") as string,
  };
};

interface FetchNgosParams {
  page?: number;
  limit?: number;
  q?: string;
  focus?: string;
  coverage_type?: string;
  status?: string;
}

export async function fetchNgos(
  params: FetchNgosParams = {},
  requestOptions: RequestOptions = {}
) {
  const query: Record<string, string | number> = {
    page: params.page || 1,
    limit: params.limit || 6,
    status: params.status || 'approved',
  };

  if (params.q) query.q = params.q;
  if (params.focus) query.focus = params.focus;
  if (params.coverage_type) query.coverage_type = params.coverage_type;

  const response = await api.get<{ data?: Record<string, unknown>[]; pagination?: unknown }>("/api/v1/ngos", {
    query,
    signal: requestOptions.signal,
  });

  const data: Ngo[] = Array.isArray(response?.data) ? response.data.map(normalizeNgo) : [];

  return {
    data,
    pagination: response?.pagination || {
      totalResources: data.length,
      totalPages: data.length ? 1 : 0,
      currentPage: query.page,
      pageSize: query.limit,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

export async function submitNgo(payload: { name: string; website: string }, requestOptions: RequestOptions = {}) {
  const body = {
    name: payload?.name || '',
    website: payload?.website || '',
  };

  return api.post('/api/v1/ngos/submissions', body, {
    signal: requestOptions.signal,
  });
}