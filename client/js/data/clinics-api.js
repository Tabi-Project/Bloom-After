import api from "../api.js";

const normalizeClinic = (clinic) => ({
  id: clinic?.id || clinic?._id || "",
  name: clinic?.name || "",
  provider_type: clinic?.provider_type || "clinic",
  city: clinic?.city || "",
  state: clinic?.state || "",
  coordinates: clinic?.coordinates || clinic?.location?.coordinates || [0, 0],
  rating: clinic?.rating ?? 0,
  reviewCount: clinic?.reviewCount ?? clinic?.review_count ?? 0,
  fee_range: clinic?.fee_range || "",
  cost_type: clinic?.cost_type || "private",
  is_open_247: Boolean(clinic?.is_open_247),
  opening_hours: clinic?.opening_hours || "",
  consultation_mode: clinic?.consultation_mode || "both",
  focus_areas: clinic?.focus_areas || [],
  contact: clinic?.contact || {},
  services: clinic?.services || [],
  ...(clinic?.distance !== undefined ? { distance: clinic.distance } : {}),
});

export async function fetchClinics(
  {
    q = "",
    lat,
    lng,
    radius_km,
    provider_type = "",
    cost_type = "",
    consultation_mode = "",
    focus = [],
    page = 1,
    limit = 50,
  } = {},
  requestOptions = {}
) {
  const query = {
    page,
    limit,
  };

  if (q) query.q = q;
  if (typeof lat === "number") query.lat = lat;
  if (typeof lng === "number") query.lng = lng;
  if (radius_km) query.radius_km = radius_km;
  if (provider_type) query.provider_type = provider_type;
  if (cost_type) query.cost_type = cost_type;
  if (consultation_mode) query.consultation_mode = consultation_mode;
  if (focus && focus.length) query.focus = focus;

  const response = await api.get("/api/v1/clinics", {
    query,
    signal: requestOptions.signal,
  });

  const data = Array.isArray(response?.data)
    ? response.data.map(normalizeClinic)
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

export async function fetchClinicById(id, requestOptions = {}) {
  const response = await api.get(`/api/v1/clinics/${encodeURIComponent(id)}`, {
    signal: requestOptions.signal,
  });

  return response?.data ? normalizeClinic(response.data) : null;
}

export async function submitClinicReview(id, payload, requestOptions = {}) {
  return api.post(`/api/v1/clinics/${encodeURIComponent(id)}/reviews`, payload, {
    signal: requestOptions.signal,
  });
}
