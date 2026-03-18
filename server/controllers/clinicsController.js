import mongoose from 'mongoose';
import Clinic from '../models/clinic.js';
import ClinicReview from '../models/clinicReview.js';
import { geocodeQuery, metersFromKm } from '../utils/geo.js';

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const DEFAULT_RADIUS_KM = 200;

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseLimit = (value) => {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num <= 0) return DEFAULT_LIMIT;
  return Math.min(num, MAX_LIMIT);
};

const parsePage = (value) => {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num <= 0) return 1;
  return num;
};

const parseFocus = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeClinic = (clinic, options = {}) => {
  const { distanceMeters } = options;
  const coords = clinic.location?.coordinates || [];
  const lng = coords[0];
  const lat = coords[1];

  return {
    id: clinic._id.toString(),
    name: clinic.name,
    provider_type: clinic.provider_type,
    city: clinic.city,
    state: clinic.state,
    coordinates: [lat, lng],
    rating: clinic.rating_avg || 0,
    reviewCount: clinic.review_count || 0,
    fee_range: clinic.fee_range || '',
    cost_type: clinic.cost_type,
    is_open_247: clinic.is_open_247,
    opening_hours: clinic.opening_hours || '',
    consultation_mode: clinic.consultation_mode,
    accepting_new_patients: typeof clinic.accepting_new_patients === 'boolean' ? clinic.accepting_new_patients : undefined,
    credentials: clinic.credentials || '',
    languages: clinic.languages || [],
    focus_areas: clinic.focus_areas || [],
    contact: clinic.contact || {},
    services: clinic.services || [],
    ...(distanceMeters !== undefined
      ? { distance: Math.round((distanceMeters / 1000) * 10) / 10 }
      : {}),
  };
};

const buildFilter = (query) => {
  const filter = {};
  const provider = typeof query.provider_type === 'string' ? query.provider_type : '';
  const cost = typeof query.cost_type === 'string' ? query.cost_type : '';
  const consultation = typeof query.consultation_mode === 'string' ? query.consultation_mode : '';
  const focus = parseFocus(query.focus);

  if (provider && provider !== 'all') {
    filter.provider_type = provider;
  }

  if (cost && cost !== 'all') {
    if (cost === 'free_subsidised') {
      filter.cost_type = { $in: ['free', 'subsidised'] };
    } else {
      filter.cost_type = cost;
    }
  }

  if (consultation && consultation !== 'all') {
    filter.consultation_mode = { $in: ['both', consultation] };
  }

  if (focus.length > 0) {
    filter.focus_areas = { $in: focus };
  }

  return filter;
};

const buildTextFilter = (query) => {
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (!q) return null;
  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return { $or: [{ name: regex }, { city: regex }, { state: regex }] };
};

const buildPagination = ({ total, page, limit }) => {
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
  return {
    totalResources: total,
    totalPages,
    currentPage: page,
    pageSize: limit,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPrevPage: page > 1 && totalPages > 0,
  };
};

const getGeoCenter = async (query) => {
  const lat = toNumber(query.lat);
  const lng = toNumber(query.lng);
  if (lat !== null && lng !== null) {
    return { lat, lng, source: 'coords' };
  }

  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q) {
    const geocoded = await geocodeQuery({ query: q });
    if (geocoded) return { ...geocoded, source: 'geocode' };
  }

  return null;
};

export const getClinics = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;
    const filter = buildFilter(req.query);

    const geoCenter = await getGeoCenter(req.query);
    const radiusKm = toNumber(req.query.radius_km) || DEFAULT_RADIUS_KM;
    const maxDistance = metersFromKm(radiusKm);

    if (geoCenter) {
      const geoQuery = {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [geoCenter.lng, geoCenter.lat],
          },
          distanceField: 'distance_m',
          spherical: true,
          ...(maxDistance ? { maxDistance } : {}),
          ...(Object.keys(filter).length ? { query: filter } : {}),
        },
      };

      const [totalAgg, clinics] = await Promise.all([
        Clinic.aggregate([geoQuery, { $count: 'total' }]),
        Clinic.aggregate([
          geoQuery,
          { $skip: skip },
          { $limit: limit },
        ]),
      ]);

      const total = totalAgg?.[0]?.total || 0;
      const data = clinics.map((clinic) =>
        normalizeClinic(clinic, { distanceMeters: clinic.distance_m }),
      );

      return res.status(200).json({
        status: 'success',
        data,
        pagination: buildPagination({ total, page, limit }),
      });
    }

    const textFilter = buildTextFilter(req.query);
    const finalFilter = textFilter ? { $and: [filter, textFilter] } : filter;

    const [total, clinics] = await Promise.all([
      Clinic.countDocuments(finalFilter),
      Clinic.find(finalFilter)
        .sort({ name: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const data = clinics.map((clinic) => normalizeClinic(clinic));

    return res.status(200).json({
      status: 'success',
      data,
      pagination: buildPagination({ total, page, limit }),
    });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const getClinicById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: 'error', error: 'Clinic not found' });
    }

    const clinic = await Clinic.findById(id).lean();
    if (!clinic) {
      return res.status(404).json({ status: 'error', error: 'Clinic not found' });
    }

    res.status(200).json({ status: 'success', data: normalizeClinic(clinic) });
  } catch (error) {
    console.error('Error fetching clinic:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const getClinicReviews = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: 'error', error: 'Clinic not found' });
    }

    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      ClinicReview.countDocuments({ clinic: id, status: 'approved' }),
      ClinicReview.find({ clinic: id, status: 'approved' })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.status(200).json({
      status: 'success',
      data: reviews.map((review) => ({
        id: review._id.toString(),
        rating: review.rating,
        text: review.text,
        created_at: review.createdAt,
      })),
      pagination: buildPagination({ total, page, limit }),
    });
  } catch (error) {
    console.error('Error fetching clinic reviews:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const submitClinicReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: 'error', error: 'Clinic not found' });
    }

    const rating = Number(req.body.rating);
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ status: 'error', error: 'Rating must be between 1 and 5.' });
    }

    if (!text || text.length < 10) {
      return res.status(400).json({ status: 'error', error: 'Review text must be at least 10 characters.' });
    }

    const clinic = await Clinic.findById(id);
    if (!clinic) {
      return res.status(404).json({ status: 'error', error: 'Clinic not found' });
    }

    const review = await ClinicReview.create({
      clinic: id,
      rating,
      text,
      status: 'pending',
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: review._id.toString(),
        status: review.status,
      },
    });
  } catch (error) {
    console.error('Error submitting clinic review:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

const updateClinicRating = async (clinicId) => {
  const stats = await ClinicReview.aggregate([
    { $match: { clinic: new mongoose.Types.ObjectId(clinicId), status: 'approved' } },
    {
      $group: {
        _id: '$clinic',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = stats?.[0]?.avgRating || 0;
  const count = stats?.[0]?.count || 0;

  await Clinic.findByIdAndUpdate(clinicId, {
    rating_avg: Math.round(avg * 10) / 10,
    review_count: count,
  });
};

export const listClinicReviewsForAdmin = async (req, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : 'pending';
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const filter = {
      status: ['pending', 'approved', 'rejected'].includes(status) ? status : 'pending',
    };

    const [total, reviews] = await Promise.all([
      ClinicReview.countDocuments(filter),
      ClinicReview.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate('clinic', 'name city state provider_type')
        .lean(),
    ]);

    res.status(200).json({
      status: 'success',
      data: reviews.map((review) => ({
        id: review._id.toString(),
        clinic: review.clinic
          ? {
              id: review.clinic._id?.toString?.() || '',
              name: review.clinic.name,
              city: review.clinic.city,
              state: review.clinic.state,
              provider_type: review.clinic.provider_type,
            }
          : null,
        rating: review.rating,
        text: review.text,
        status: review.status,
        created_at: review.createdAt,
      })),
      pagination: buildPagination({ total, page, limit }),
    });
  } catch (error) {
    console.error('Error fetching clinic reviews for admin:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const approveClinicReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: 'error', error: 'Review not found' });
    }

    const review = await ClinicReview.findById(id);
    if (!review) {
      return res.status(404).json({ status: 'error', error: 'Review not found' });
    }

    review.status = 'approved';
    review.reviewedBy = req.user?._id || null;
    review.reviewedAt = new Date();
    await review.save();

    await updateClinicRating(review.clinic);

    res.status(200).json({ status: 'success', data: { id: review._id.toString(), status: review.status } });
  } catch (error) {
    console.error('Error approving clinic review:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const rejectClinicReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: 'error', error: 'Review not found' });
    }

    const review = await ClinicReview.findById(id);
    if (!review) {
      return res.status(404).json({ status: 'error', error: 'Review not found' });
    }

    review.status = 'rejected';
    review.reviewedBy = req.user?._id || null;
    review.reviewedAt = new Date();
    await review.save();

    await updateClinicRating(review.clinic);

    res.status(200).json({ status: 'success', data: { id: review._id.toString(), status: review.status } });
  } catch (error) {
    console.error('Error rejecting clinic review:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};
