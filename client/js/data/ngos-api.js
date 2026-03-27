import api from '../api.js';

const normalizeNgo = (ngo) => ({
  id: ngo?.id || ngo?._id || '',
  name: ngo?.name || '',
  cover_image: ngo?.cover_image || ngo?.coverImage || ngo?.image_cover || '',
  coverImage: ngo?.coverImage || ngo?.cover_image || ngo?.image_cover || '',
  image_cover: ngo?.image_cover || ngo?.cover_image || ngo?.coverImage || '',
  mission: ngo?.mission || '',
  focus_areas: ngo?.focus_areas || '',
  focus_tags: Array.isArray(ngo?.focus_tags)
    ? ngo.focus_tags
    : typeof ngo?.focus_areas === 'string'
      ? ngo.focus_areas
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
  services: Array.isArray(ngo?.services) ? ngo.services : [],
  geographic_coverage: ngo?.geographic_coverage || '',
  coverage_type: ngo?.coverage_type || '',
  contact: {
    phone: ngo?.contact?.phone || '',
    email: ngo?.contact?.email || '',
  },
  website: ngo?.website || '',
  status: ngo?.status || 'pending',
});

export async function fetchNgos(
  {
    page = 1,
    limit = 6,
    q = '',
    focus = '',
    coverage_type = '',
    status = 'approved',
  } = {},
  requestOptions = {}
) {
  const query = {
    page,
    limit,
    status,
  };

  if (q) query.q = q;
  if (focus) query.focus = focus;
  if (coverage_type) query.coverage_type = coverage_type;

  const response = await api.get('/api/v1/ngos', {
    query,
    signal: requestOptions.signal,
  });

  const data = Array.isArray(response?.data)
    ? response.data.map(normalizeNgo)
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

export async function submitNgo(payload, requestOptions = {}) {
  const body = {
    name: payload?.name || '',
    website: payload?.website || payload?.link || '',
  };

  return api.post('/api/v1/ngos/submissions', body, {
    signal: requestOptions.signal,
  });
}
