import api, { RequestOptions } from "../api";
import {
  Tip,
  Lifestyle,
  LifestyleApiData,
  FetchLifestyleParams,
  LifestyleListResponse,
  LifestyleItemResponse,
} from "@/types/lifestyle";

type LifestyleRequestOptions = Pick<RequestOptions, "signal">;

const normalizeTip = (tip: Tip) => ({
  title: String(tip?.title || '').trim(),
  desc: String(tip?.desc || tip?.description || '').trim(),
});

const normalizeLifestyle = (item: LifestyleApiData): Lifestyle => ({
  id: item?.id || item?.slug || item?._id || '',
  title: item?.title || '',
  category: item?.category || 'lifestyle',
  subtitle: item?.subtitle || '',
  summary: item?.summary || '',
  foundation: Array.isArray(item?.foundation) ? item.foundation.filter(Boolean) : [],
  tips: Array.isArray(item?.tips) ? item.tips.map(normalizeTip).filter((tip: Tip) => tip.title && tip.desc) : [],
  evidence: Array.isArray(item?.evidence) ? item.evidence.filter(Boolean) : [],
  status: item?.status || (item?.published ? 'published' : 'draft'),
  published: typeof item?.published === 'boolean' ? item.published : item?.status === 'published',
  createdAt: item?.createdAt || null,
  updatedAt: item?.updatedAt || null,
});

export async function fetchLifestyle(
  {
    page = 1,
    limit = 6,
    category = '',
    q = '',
    published = true,
  }: FetchLifestyleParams = {},
  requestOptions: LifestyleRequestOptions = {}
) {
  const query = {
    page,
    limit,
    category: category || undefined,
    q: q || undefined,
    published: String(Boolean(published)),
  };

  if (category) query.category = category;
  if (q) query.q = q;

  const response = await api.get<LifestyleListResponse>('/api/v1/lifestyle', {
    query,
    signal: requestOptions.signal,
  });

  const data = Array.isArray(response?.data) ? response.data.map(normalizeLifestyle) : [];

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

export async function fetchLifestyleById(
  id: string,
  requestOptions: LifestyleRequestOptions = {}
) {
  const response = await api.get<LifestyleItemResponse>(
    `/api/v1/lifestyle/${encodeURIComponent(id)}`,
    {
      signal: requestOptions.signal,
    }
  );

  return response?.data ? normalizeLifestyle(response.data) : null;
}
