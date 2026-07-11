import { AdminSubmissionItem } from '@/types/admin';

/**
 * The admin clinics API (`normalizeClinic` in clinicsController.js) returns a
 * mix of snake_case and camelCase keys. Map defensively to both so this
 * doesn't silently break again if the backend shape shifts either way.
 */
export function normalizeAdminClinic(raw: Record<string, unknown>, fallbackId: string): AdminSubmissionItem {
  const get = <T,>(camel: string, snake: string, fallback: T): T =>
    (raw[camel] as T) ?? (raw[snake] as T) ?? fallback;

  return {
    id: (raw.id as string) || (raw._id as string) || fallbackId,
    name: (raw.name as string) || '',
    description: raw.description as string | undefined,
    contact: (raw.contact as AdminSubmissionItem['contact']) || {},
    coordinates: raw.coordinates as [number, number] | undefined,
    providerType: get('providerType', 'provider_type', ''),
    consultationMode: get('consultationMode', 'consultation_mode', ''),
    costType: get('costType', 'cost_type', ''),
    focusAreas: get('focusAreas', 'focus_areas', []),
    status: get('status', 'status', 'pending'),
    services: raw.services as string[] | undefined,
    languages: raw.languages as string[] | undefined,
    acceptingNewPatients: get('acceptingNewPatients', 'accepting_new_patients', undefined),
    moderatorNote: raw.moderatorNote as string | undefined,
    openingHours: get('openingHours', 'opening_hours', ''),
    updatedAt: raw.updatedAt as string | undefined,
    createdAt: raw.createdAt as string | undefined,
    isOpen247: get('isOpen247', 'is_open_247', false),
    website: raw.website as string | undefined,
    coverImage: get('coverImage', 'cover_image', ''),
    credentials: raw.credentials as string | undefined,
    feeRange: get('feeRange', 'fee_range', ''),
    rating: raw.rating as number | undefined,
    reviewCount: raw.reviewCount as number | undefined,
    state: raw.state as string | undefined,
    city: raw.city as string | undefined,
  };
}
