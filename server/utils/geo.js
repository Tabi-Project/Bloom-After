const DEFAULT_COUNTRY_CODE = 'ng';
const DEFAULT_LIMIT = 1;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

const cache = new Map();

const buildCacheKey = (query, countryCode) =>
  `${countryCode || DEFAULT_COUNTRY_CODE}:${query}`.toLowerCase().trim();

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const setCached = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

const buildHeaders = () => {
  const userAgent = process.env.GEO_USER_AGENT || 'Bloom After Clinics Backend';
  const email = process.env.GEO_CONTACT_EMAIL || process.env.SUPPORT_EMAIL || '';
  const headers = {
    'User-Agent': userAgent,
    Accept: 'application/json',
  };
  if (email) headers['From'] = email;
  return headers;
};

export const geocodeQuery = async ({ query, countryCode = DEFAULT_COUNTRY_CODE }) => {
  const trimmed = typeof query === 'string' ? query.trim() : '';
  if (!trimmed) return null;

  const cacheKey = buildCacheKey(trimmed, countryCode);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available. Use Node 18+ or add a fetch polyfill.');
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '0');
  url.searchParams.set('limit', String(DEFAULT_LIMIT));
  if (countryCode) url.searchParams.set('countrycodes', countryCode);

  const response = await fetch(url.toString(), {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}.`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    setCached(cacheKey, null, DEFAULT_TTL_MS / 4);
    return null;
  }

  const first = results[0];
  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const value = { lat, lng: lon, display_name: first.display_name || '' };
  setCached(cacheKey, value);
  return value;
};

export const metersFromKm = (value) => {
  const km = Number(value);
  if (!Number.isFinite(km) || km <= 0) return null;
  return km * 1000;
};
