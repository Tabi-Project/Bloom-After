import mongoose from 'mongoose';
import Lifestyle from '../models/lifestyle.js';
import slugify from '../utils/slug.js';

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

const parseStatus = (value) => {
  const status = getString(value).toLowerCase();
  if (['draft', 'published', 'archived'].includes(status)) return status;
  return '';
};

const parseCategory = (value) => {
  const category = getString(value).toLowerCase();
  if (['lifestyle', 'medical'].includes(category)) return category;
  return '';
};

const toPublishedFilter = (value) => {
  if (value === 'false') return false;
  if (value === 'true') return true;
  return true;
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => getString(item))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\n\s*\n|\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toTipsArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      title: getString(item?.title),
      desc: getString(item?.desc, getString(item?.description)),
    }))
    .filter((item) => item.title && item.desc);
};

const normalizeLifestyle = (item) => {
  const status = parseStatus(item.status) || (item.published ? 'published' : 'draft');

  return {
    id: getString(item.slug, String(item._id)),
    title: getString(item.title),
    category: parseCategory(item.category) || 'lifestyle',
    subtitle: getString(item.subtitle),
    summary: getString(item.summary),
    foundation: Array.isArray(item.foundation) ? item.foundation.filter(Boolean) : [],
    tips: Array.isArray(item.tips)
      ? item.tips.map((tip) => ({ title: getString(tip?.title), desc: getString(tip?.desc) })).filter((tip) => tip.title && tip.desc)
      : [],
    evidence: Array.isArray(item.evidence) ? item.evidence.filter(Boolean) : [],
    slug: getString(item.slug),
    status,
    published: status === 'published',
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const buildPublicFilter = (query = {}) => {
  const and = [];

  const published = toPublishedFilter(query.published);
  if (published) {
    and.push({
      $or: [
        { status: 'published' },
        { $and: [{ status: { $exists: false } }, { published: true }] },
      ],
    });
  }

  const category = parseCategory(query.category);
  if (category) {
    and.push({ category });
  }

  const q = getString(query.q);
  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    and.push({
      $or: [
        { title: regex },
        { subtitle: regex },
        { summary: regex },
        { foundation: { $elemMatch: { $regex: regex } } },
        { evidence: { $elemMatch: { $regex: regex } } },
      ],
    });
  }

  if (!and.length) return {};
  return and.length === 1 ? and[0] : { $and: and };
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

const findByIdOrSlug = async (id, extraFilter = {}) => {
  const raw = getString(id);
  if (!raw) return null;

  if (mongoose.Types.ObjectId.isValid(raw)) {
    const byId = await Lifestyle.findOne({ _id: new mongoose.Types.ObjectId(raw), ...extraFilter }).lean();
    if (byId) return byId;
  }

  return Lifestyle.findOne({ slug: raw.toLowerCase(), ...extraFilter }).lean();
};

const validatePayload = (payload) => {
  if (!payload.title) return 'Title is required.';
  if (!payload.summary) return 'Summary is required.';
  if (!payload.category) return 'Category must be either lifestyle or medical.';
  if (!payload.foundation.length) return 'At least one foundation paragraph is required.';
  if (!payload.tips.length) return 'At least one practical strategy is required.';
  if (!payload.evidence.length) return 'At least one evidence point is required.';
  return '';
};

const toAdminPayload = (body = {}, existing = null) => {
  const status = parseStatus(body.status) || parseStatus(existing?.status) || 'draft';
  const published = status === 'published';

  const tipsInput = Array.isArray(body.tips)
    ? body.tips
    : typeof body.tips === 'string'
    ? body.tips
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [left, ...rest] = line.split('|');
          return { title: getString(left), desc: getString(rest.join('|')) };
        })
    : [];

  return {
    title: getString(body.title, getString(existing?.title)),
    subtitle: getString(body.subtitle, getString(existing?.subtitle)),
    summary: getString(body.summary, getString(existing?.summary)),
    category: parseCategory(body.category) || parseCategory(existing?.category),
    foundation: toStringArray(body.foundation ?? existing?.foundation),
    tips: toTipsArray(tipsInput.length ? tipsInput : existing?.tips),
    evidence: toStringArray(body.evidence ?? existing?.evidence),
    status,
    published,
  };
};

const generateUniqueSlug = async (title, excludeId = null) => {
  const base = slugify(title) || `lifestyle-${Date.now()}`;
  let candidate = base;
  let index = 1;

  while (true) {
    const filter = excludeId
      ? { slug: candidate, _id: { $ne: excludeId } }
      : { slug: candidate };
    const exists = await Lifestyle.exists(filter);
    if (!exists) return candidate;
    index += 1;
    candidate = `${base}-${index}`;
  }
};

export const getAllLifestyle = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;
    const filter = buildPublicFilter(req.query);

    const [total, items] = await Promise.all([
      Lifestyle.countDocuments(filter),
      Lifestyle.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      status: 'success',
      data: items.map(normalizeLifestyle),
      pagination: buildPagination({ total, page, limit }),
    });
  } catch (error) {
    console.error('Error fetching lifestyle entries:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const getLifestyleById = async (req, res) => {
  try {
    const publicFilter = {
      $or: [
        { status: 'published' },
        { $and: [{ status: { $exists: false } }, { published: true }] },
      ],
    };

    const item = await findByIdOrSlug(req.params.id, publicFilter);
    if (!item) {
      return res.status(404).json({ status: 'error', error: 'Lifestyle entry not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: normalizeLifestyle(item),
    });
  } catch (error) {
    console.error('Error fetching lifestyle entry:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const getAdminLifestyle = async (req, res) => {
  try {
    const status = parseStatus(req.query?.status);
    const q = getString(req.query?.q);
    const filter = {};

    if (status) filter.status = status;
    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: regex }, { subtitle: regex }, { summary: regex }];
    }

    const items = await Lifestyle.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({
      status: 'success',
      data: {
        lifestyle: items.map(normalizeLifestyle),
      },
    });
  } catch (error) {
    console.error('Error fetching admin lifestyle entries:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const getAdminLifestyleById = async (req, res) => {
  try {
    const item = await findByIdOrSlug(req.params.id);
    if (!item) {
      return res.status(404).json({ status: 'error', error: 'Lifestyle entry not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        lifestyle: normalizeLifestyle(item),
      },
    });
  } catch (error) {
    console.error('Error fetching admin lifestyle entry:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const createAdminLifestyle = async (req, res) => {
  try {
    const payload = toAdminPayload(req.body);
    const validationError = validatePayload(payload);

    if (validationError) {
      return res.status(400).json({ status: 'error', error: validationError });
    }

    const slug = await generateUniqueSlug(payload.title);

    const created = await Lifestyle.create({
      ...payload,
      slug,
      reviewedBy: req.user?._id || null,
    });

    return res.status(201).json({
      status: 'success',
      data: {
        lifestyle: normalizeLifestyle(created),
      },
    });
  } catch (error) {
    console.error('Error creating admin lifestyle entry:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const updateAdminLifestyle = async (req, res) => {
  try {
    const existing = await findByIdOrSlug(req.params.id);
    if (!existing) {
      return res.status(404).json({ status: 'error', error: 'Lifestyle entry not found' });
    }

    const payload = toAdminPayload(req.body, existing);
    const validationError = validatePayload(payload);

    if (validationError) {
      return res.status(400).json({ status: 'error', error: validationError });
    }

    const nextSlug = await generateUniqueSlug(payload.title, existing._id);

    const updated = await Lifestyle.findByIdAndUpdate(
      existing._id,
      {
        ...payload,
        slug: nextSlug,
        reviewedBy: req.user?._id || existing.reviewedBy || null,
      },
      { new: true, runValidators: true }
    ).lean();

    return res.status(200).json({
      status: 'success',
      data: {
        lifestyle: normalizeLifestyle(updated),
      },
    });
  } catch (error) {
    console.error('Error updating admin lifestyle entry:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};
