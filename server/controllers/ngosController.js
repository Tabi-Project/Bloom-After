import mongoose from 'mongoose';
import NGO from '../models/ngo.js';

const MAX_LIMIT = 24;
const DEFAULT_LIMIT = 6;

const getString = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

const parseLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
};

const parsePage = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return parsed;
};

const toFocusArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeNgo = (ngo) => ({
  id: String(ngo._id),
  name: getString(ngo.name),
  cover_image: getString(ngo.cover_image),
  mission: getString(ngo.mission),
  focus_areas: Array.isArray(ngo.focus_areas) ? ngo.focus_areas.join(', ') : '',
  focus_tags: Array.isArray(ngo.focus_areas) ? ngo.focus_areas : [],
  services: Array.isArray(ngo.services) ? ngo.services : [],
  geographic_coverage: getString(ngo.geographic_coverage),
  coverage_type: getString(ngo.coverage_type),
  contact: {
    phone: getString(ngo.contact?.phone),
    email: getString(ngo.contact?.email),
  },
  website: getString(ngo.website),
  status: getString(ngo.status, 'pending'),
  createdAt: ngo.createdAt || null,
  updatedAt: ngo.updatedAt || null,
});

const buildFilter = (query) => {
  const and = [{ status: 'approved' }];

  const coverageType = getString(query?.coverage_type).toLowerCase();
  if (coverageType && ['local', 'regional', 'national', 'international', 'other'].includes(coverageType)) {
    and.push({ coverage_type: coverageType });
  }

  const focus = getString(query?.focus);
  if (focus) {
    and.push({
      focus_areas: { $elemMatch: { $regex: new RegExp(escapeRegex(focus), 'i') } },
    });
  }

  const q = getString(query?.q);
  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    and.push({
      $or: [
        { name: regex },
        { mission: regex },
        { geographic_coverage: regex },
        { services: { $elemMatch: { $regex: regex } } },
        { focus_areas: { $elemMatch: { $regex: regex } } },
      ],
    });
  }

  return and.length === 1 ? and[0] : { $and: and };
};

export const getAllNgos = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;
    const filter = buildFilter(req.query);

    const [totalNgos, ngos] = await Promise.all([
      NGO.countDocuments(filter),
      NGO.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = totalNgos > 0 ? Math.ceil(totalNgos / limit) : 0;

    res.status(200).json({
      status: 'success',
      data: ngos.map(normalizeNgo),
      pagination: {
        totalResources: totalNgos,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPrevPage: page > 1 && totalPages > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const getNgoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: 'error', error: 'NGO not found' });
    }

    const ngo = await NGO.findOne({
      _id: new mongoose.Types.ObjectId(id),
      status: 'approved',
    }).lean();

    if (!ngo) {
      return res.status(404).json({ status: 'error', error: 'NGO not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: normalizeNgo(ngo),
    });
  } catch (error) {
    console.error('Error fetching NGO:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const submitNgo = async (req, res) => {
  try {
    const name = getString(req.body?.name);
    const website = getString(req.body?.website || req.body?.link);
    const mission = getString(req.body?.mission);
    const focus_areas = toFocusArray(req.body?.focus_areas);
    const services = toFocusArray(req.body?.services);
    const geographic_coverage = getString(req.body?.geographic_coverage);
    const coverage_type = getString(req.body?.coverage_type, 'other').toLowerCase();
    const contactPhone = getString(req.body?.contact?.phone || req.body?.phone);
    const contactEmail = getString(req.body?.contact?.email || req.body?.email);
    const cover_image = getString(req.body?.cover_image);

    if (!name) {
      return res.status(400).json({ status: 'error', error: 'Organisation name is required.' });
    }

    if (!website) {
      return res.status(400).json({ status: 'error', error: 'Website or social link is required.' });
    }

    try {
      new URL(website);
    } catch {
      return res.status(400).json({ status: 'error', error: 'Provide a valid website URL.' });
    }

    const created = await NGO.create({
      name,
      website,
      mission,
      focus_areas,
      services,
      geographic_coverage,
      coverage_type: ['local', 'regional', 'national', 'international', 'other'].includes(coverage_type)
        ? coverage_type
        : 'other',
      contact: {
        phone: contactPhone,
        email: contactEmail,
      },
      cover_image,
      status: 'pending',
    });

    return res.status(201).json({
      status: 'success',
      data: normalizeNgo(created),
    });
  } catch (error) {
    console.error('Error submitting NGO:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};
