import api, { ApiError } from "../api";
import { getDestination, mapNgoStatusToContentStatus, normalizeStatus, toEditorFormData } from "../content-management";
import { AdminAuthError } from "./admin-dashboard-api";
import {
  AdminClinicDetailResponse,
  AdminClinicsListResponse,
  AdminImageUploadResponse,
  AdminLifestyleDetailResponse,
  AdminLifestyleListResponse,
  AdminNgoDetailResponse,
  AdminNgosListResponse,
  AdminResourceDetailResponse,
  AdminResourcesListResponse,
  ContentDestination,
  ContentFormData,
  ContentListItem,
} from "@/types/content-management";

const isAuthError = (error: unknown): boolean =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

const rejectsWithAuthError = (results: PromiseSettledResult<unknown>[]): boolean =>
  results.some((r) => r.status === "rejected" && isAuthError(r.reason));

export async function fetchAllContent(): Promise<ContentListItem[]> {
  const [resourcesRes, lifestyleRes, ngosRes, clinicsRes] = await Promise.allSettled([
    api.get<AdminResourcesListResponse>("/api/v1/admin/resources"),
    api.get<AdminLifestyleListResponse>("/api/v1/admin/lifestyle"),
    api.get<AdminNgosListResponse>("/api/v1/admin/ngos"),
    api.get<AdminClinicsListResponse>("/api/v1/admin/clinics"),
  ]);

  if (rejectsWithAuthError([resourcesRes, lifestyleRes, ngosRes, clinicsRes])) {
    throw new AdminAuthError();
  }

  const items: ContentListItem[] = [];

  if (resourcesRes.status === "fulfilled") {
    (resourcesRes.value.data?.resources || []).forEach((item) =>
      items.push({
        id: item.id,
        title: item.title,
        type: "resource",
        status: normalizeStatus(item.status),
        updatedAt: item.updatedAt,
      })
    );
  }

  if (lifestyleRes.status === "fulfilled") {
    (lifestyleRes.value.data?.lifestyle || []).forEach((item) =>
      items.push({
        id: item.id,
        title: item.title,
        type: "lifestyle",
        status: normalizeStatus(item.status),
        updatedAt: item.updatedAt,
      })
    );
  }

  if (ngosRes.status === "fulfilled") {
    (ngosRes.value.data?.ngos || []).forEach((item) =>
      items.push({
        id: item.id,
        title: item.name,
        type: "ngo",
        status: mapNgoStatusToContentStatus(item.status),
        updatedAt: item.updatedAt,
      })
    );
  }

  if (clinicsRes.status === "fulfilled") {
    (clinicsRes.value.data?.clinics || []).forEach((item) =>
      items.push({
        id: item.id,
        title: item.name,
        type: "clinic",
        status: normalizeStatus(item.status),
        updatedAt: item.updatedAt,
      })
    );
  }

  return items;
}

export async function patchContentStatus(
  type: ContentDestination,
  id: string,
  nextStatus: ContentFormData["status"]
): Promise<void> {
  const dest = getDestination(type);
  const payload =
    type === "ngo"
      ? { status: mapNgoStatusToContentStatus(nextStatus) }
      : { status: nextStatus };

  try {
    await api.patch(`${dest.apiBase}/${id}`, payload);
  } catch (error) {
    if (isAuthError(error)) throw new AdminAuthError();
    throw error;
  }
}

export async function fetchContentEntry(
  type: ContentDestination,
  id: string
): Promise<ContentFormData | null> {
  const dest = getDestination(type);

  try {
    const res = await api.get<
      | AdminResourceDetailResponse
      | AdminLifestyleDetailResponse
      | AdminNgoDetailResponse
      | AdminClinicDetailResponse
    >(`${dest.apiBase}/${id}`);

    const raw =
      (res.data as AdminResourceDetailResponse["data"]).resource ||
      (res.data as AdminLifestyleDetailResponse["data"]).lifestyle ||
      (res.data as AdminNgoDetailResponse["data"]).ngo ||
      (res.data as AdminClinicDetailResponse["data"]).clinic ||
      null;

    if (!raw) return null;
    return toEditorFormData(type, raw as unknown as Record<string, unknown>);
  } catch (error) {
    if (isAuthError(error)) throw new AdminAuthError();
    throw error;
  }
}

interface SaveContentResult {
  id: string;
  formData: ContentFormData;
}

export async function saveContentEntry(
  type: ContentDestination,
  id: string | null,
  payload: Record<string, unknown>
): Promise<SaveContentResult> {
  const dest = getDestination(type);

  try {
    const res = id
      ? await api.patch<
          | AdminResourceDetailResponse
          | AdminLifestyleDetailResponse
          | AdminNgoDetailResponse
          | AdminClinicDetailResponse
        >(`${dest.apiBase}/${id}`, payload)
      : await api.post<
          | AdminResourceDetailResponse
          | AdminLifestyleDetailResponse
          | AdminNgoDetailResponse
          | AdminClinicDetailResponse
        >(dest.apiBase, payload);

    const raw =
      (res.data as AdminResourceDetailResponse["data"]).resource ||
      (res.data as AdminLifestyleDetailResponse["data"]).lifestyle ||
      (res.data as AdminNgoDetailResponse["data"]).ngo ||
      (res.data as AdminClinicDetailResponse["data"]).clinic;

    return {
      id: raw.id,
      formData: toEditorFormData(type, raw as unknown as Record<string, unknown>),
    };
  } catch (error) {
    if (isAuthError(error)) throw new AdminAuthError();
    throw error;
  }
}

export async function uploadContentImage(dataUrl: string): Promise<string> {
  try {
    const res = await api.post<AdminImageUploadResponse>("/api/v1/admin/upload/image", {
      image: dataUrl,
    });
    const url = res.data?.imageUrl || res.data?.image_url;
    if (!url) throw new Error("Missing uploaded image URL.");
    return url;
  } catch (error) {
    if (isAuthError(error)) throw new AdminAuthError();
    throw error;
  }
}
