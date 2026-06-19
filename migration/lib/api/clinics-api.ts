import api, { RequestOptions } from "../api";
import { Clinic } from "../../types/clinic"; 

const normalizeClinic = (clinic: Record<string, unknown>): Clinic => {
  const get = (key: string) => clinic[key];
  
  return {
    id: (get("id") || get("_id") || "") as string | number,
    name: (get("name") || "") as string,
    provider_type: (get("provider_type") || "clinic") as string,
    city: (get("city") || "") as string,
    state: (get("state") || "") as string,
    coordinates: (get("coordinates") || get("location") || [0, 0]) as [number, number],
    fee_range: (get("fee_range") || "") as string,
    cost_type: (get("cost_type") || "private") as string,
    is_open_247: Boolean(get("is_open_247")),
    opening_hours: (get("opening_hours") || "") as string,
    consultation_mode: (get("consultation_mode") || "both") as string,
    accepting_new_patients: typeof get("accepting_new_patients") === "boolean" ? (get("accepting_new_patients") as boolean) : undefined,
    credentials: (get("credentials") || "") as string,
    languages: (get("languages") || []) as string[],
    focus_areas: (get("focus_areas") || []) as string[],
    contact: (get("contact") || {}) as Clinic['contact'],
    services: (get("services") || []) as string[],
    ...(get("distance") !== undefined ? { distance: get("distance") as number } : {}),
  };
};

interface FetchClinicsParams {
  q?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  provider_type?: string;
  cost_type?: string;
  consultation_mode?: string;
  focus?: string[];
  page?: number;
  limit?: number;
}

export async function fetchClinics(
  params: FetchClinicsParams = {},
  requestOptions: RequestOptions = {}
) {
  const query: Record<string, string | number | string[]> = {
    page: params.page || 1,
    limit: params.limit || 50,
  };

  if (params.q) query.q = params.q;
  if (typeof params.lat === "number") query.lat = params.lat;
  if (typeof params.lng === "number") query.lng = params.lng;
  if (params.radius_km) query.radius_km = params.radius_km;
  if (params.provider_type) query.provider_type = params.provider_type;
  if (params.cost_type) query.cost_type = params.cost_type;
  if (params.consultation_mode) query.consultation_mode = params.consultation_mode;
  if (params.focus && params.focus.length) query.focus = params.focus;

  const response = await api.get<{ data?: Record<string, unknown>[]; pagination?: unknown }>("/api/v1/clinics", {
    query,
    signal: requestOptions.signal,
  });

  const data: Clinic[] = Array.isArray(response?.data) ? response.data.map(normalizeClinic) : [];

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

export async function submitClinicReview(id: string | number, payload: { rating: number, text: string }, requestOptions: RequestOptions = {}) {
  return api.post(`/api/v1/clinics/${encodeURIComponent(id)}/reviews`, payload, {
    signal: requestOptions.signal,
  });
}