import mongoose from 'mongoose';
import validator from 'validator';
import NGO from '../models/ngo.js';
import { sendNgoModerationEmail } from '../utils/ngoModerationEmail.js';

const MAX_LIMIT = 24;
const DEFAULT_LIMIT = 6;
const ADMIN_MAX_LIMIT = 50;
const ADMIN_DEFAULT_LIMIT = 20;

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

const parseAdminLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return ADMIN_DEFAULT_LIMIT;
  return Math.min(parsed, ADMIN_MAX_LIMIT);
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeNgo = (ngo) => {
  const coverImage = getString(ngo.cover_image, getString(ngo.coverImage, getString(ngo.image_cover)));

  return {
    id: String(ngo._id),
    name: getString(ngo.name),
    cover_image: coverImage,
    coverImage,
    image_cover: coverImage,
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
  };
};

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
    const cover_image = getString(req.body?.cover_image || req.body?.coverImage || req.body?.image_cover);

    if (!name) {
      return res.status(400).json({ status: 'error', error: 'Organisation name is required.' });
    }

    if (!website) {
      return res.status(400).json({ status: 'error', error: 'Website or social link is required.' });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(website);
    } catch {
      return res.status(400).json({ status: 'error', error: 'Provide a valid website URL.' });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
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

export const getAdminNgos = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseAdminLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const filter = {};
    const status = getString(req.query?.status).toLowerCase();
    if (['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const q = getString(req.query?.q);
    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: regex }, { mission: regex }, { website: regex }];
    }

    const [totalNgos, ngos] = await Promise.all([
      NGO.countDocuments(filter),
      NGO.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = totalNgos > 0 ? Math.ceil(totalNgos / limit) : 0;

    return res.status(200).json({
      status: 'success',
      data: {
        ngos: ngos.map(normalizeNgo),
      },
      pagination: {
        totalNgos,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPrevPage: page > 1 && totalPages > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching admin NGOs:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const getAdminNgoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: 'error', error: 'NGO not found' });
    }

    const ngo = await NGO.findById(id).lean();
    if (!ngo) {
      return res.status(404).json({ status: 'error', error: 'NGO not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        ngo: normalizeNgo(ngo),
      },
    });
  } catch (error) {
    console.error('Error fetching admin NGO by ID:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const updateAdminNgo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: 'error', error: 'NGO not found' });
    }

    const ngo = await NGO.findById(id);
    if (!ngo) {
      return res.status(404).json({ status: 'error', error: 'NGO not found' });
    }

    const nextStatus = getString(req.body?.status).toLowerCase();
    const hasServicesInput = req.body?.services !== undefined;
    const name = getString(req.body?.name, ngo.name || '');
    const mission = getString(req.body?.mission, ngo.mission || '');
    const services = hasServicesInput
      ? toFocusArray(req.body?.services)
      : (Array.isArray(ngo.services) ? ngo.services : []);
    const geographicCoverage = getString(req.body?.geographic_coverage, ngo.geographic_coverage || '');
    const coverageTypeRaw = getString(req.body?.coverage_type, ngo.coverage_type || 'other').toLowerCase();
    const website = getString(req.body?.website, ngo.website || '');
    const focusAreas = req.body?.focus_areas !== undefined
      ? toFocusArray(req.body?.focus_areas)
      : (Array.isArray(ngo.focus_areas) ? ngo.focus_areas : []);
    const coverImage = getString(
      req.body?.cover_image || req.body?.coverImage || req.body?.image_cover,
      ngo.cover_image || ''
    );
    const contactPhone = getString(req.body?.contact?.phone || req.body?.phone, ngo.contact?.phone || '');
    const contactEmail = getString(req.body?.contact?.email || req.body?.email, ngo.contact?.email || '').toLowerCase();
    const moderatorNote = getString(req.body?.moderatorNote, ngo.moderatorNote || '');
    const rejectionMessage = getString(req.body?.rejectionMessage);
    const notificationEmail = getString(req.body?.notificationEmail, contactEmail || '').toLowerCase();

    if (nextStatus && !['pending', 'approved', 'rejected'].includes(nextStatus)) {
      return res.status(400).json({ status: 'error', error: 'Invalid status value.' });
    }

    if (nextStatus === 'approved') {
      if (!mission) {
        return res.status(400).json({ status: 'error', error: 'Description is required before approval.' });
      }

      if (!contactPhone) {
        return res.status(400).json({ status: 'error', error: 'Phone is required before approval.' });
      }

      if (!contactEmail) {
        return res.status(400).json({ status: 'error', error: 'Email is required before approval.' });
      }

      if (!validator.isEmail(contactEmail)) {
        return res.status(400).json({ status: 'error', error: 'Provide a valid email address.' });
      }
    }

    if (contactEmail && !validator.isEmail(contactEmail)) {
      return res.status(400).json({ status: 'error', error: 'Provide a valid email address.' });
    }

    ngo.name = name;
    ngo.mission = mission;
    ngo.services = services;
    ngo.focus_areas = focusAreas;
    ngo.geographic_coverage = geographicCoverage;
    ngo.coverage_type = ['local', 'regional', 'national', 'international', 'other'].includes(coverageTypeRaw)
      ? coverageTypeRaw
      : (ngo.coverage_type || 'other');
    ngo.website = website;
    ngo.cover_image = coverImage;
    ngo.contact = {
      ...(ngo.contact?.toObject ? ngo.contact.toObject() : ngo.contact || {}),
      phone: contactPhone,
      email: contactEmail,
    };
    ngo.moderatorNote = moderatorNote;

    let emailNotification = {
      attempted: false,
      sent: false,
      skipped: true,
      reason: 'status-unchanged',
    };

    const previousStatus = getString(ngo.status, 'pending').toLowerCase();
    const didStatusChange = nextStatus && nextStatus !== previousStatus;

    if (didStatusChange) {
      ngo.status = nextStatus;
      ngo.reviewedBy = req.user?._id || null;
    }

    await ngo.save();

    if (didStatusChange && ['approved', 'rejected'].includes(nextStatus)) {
      emailNotification = {
        attempted: true,
        sent: false,
        skipped: true,
        reason: 'no-recipient',
      };

      try {
        const result = await sendNgoModerationEmail({
          to: notificationEmail,
          ngoName: ngo.name,
          status: nextStatus,
          rejectionMessage,
        });
        emailNotification = {
          attempted: true,
          sent: Boolean(result?.sent),
          skipped: Boolean(result?.skipped),
          reason: result?.reason || null,
        };
      } catch (emailError) {
        console.error('NGO moderation email failed:', emailError);
        emailNotification = {
          attempted: true,
          sent: false,
          skipped: false,
          reason: 'send-failed',
        };
      }
    }

    return res.status(200).json({
      status: 'success',
      data: {
        ngo: normalizeNgo(ngo),
        emailNotification,
      },
    });
  } catch (error) {
    console.error('Error updating admin NGO:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};
