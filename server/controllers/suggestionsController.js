import mongoose from 'mongoose';
import validator from 'validator';
import Suggestion from '../models/suggestion.js';

const ALLOWED_TYPES = new Set(['clinic', 'specialist', 'media', 'request']);
const ALLOWED_STATUSES = new Set(['pending', 'reviewed', 'rejected', 'implemented']);
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

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

const normalizeSuggestion = (suggestion) => ({
  id: String(suggestion._id),
  type: getString(suggestion.type),
  content: getString(suggestion.content),
  email: getString(suggestion.email),
  status: getString(suggestion.status, 'pending'),
  reviewedBy: suggestion.reviewedBy ? String(suggestion.reviewedBy) : null,
  moderatorNote: getString(suggestion.moderatorNote),
  createdAt: suggestion.createdAt || null,
  updatedAt: suggestion.updatedAt || null,
});

export const submitSuggestion = async (req, res) => {
  try {
    const type = getString(req.body?.type).toLowerCase();
    const content = getString(req.body?.content);
    const email = getString(req.body?.email).toLowerCase();

    if (!ALLOWED_TYPES.has(type)) {
      return res.status(400).json({
        status: 'error',
        error: 'Please choose a valid suggestion category.',
      });
    }

    if (!content) {
      return res.status(400).json({
        status: 'error',
        error: 'Suggestion description is required.',
      });
    }

    if (content.length > 3000) {
      return res.status(400).json({
        status: 'error',
        error: 'Suggestion is too long. Keep it under 3000 characters.',
      });
    }

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        error: 'Please provide a valid email address.',
      });
    }

    const created = await Suggestion.create({
      type,
      content,
      email,
      status: 'pending',
    });

    return res.status(201).json({
      status: 'success',
      data: normalizeSuggestion(created),
    });
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const getAdminSuggestions = async (req, res) => {
  try {
    const page = parsePage(req.query?.page);
    const limit = parseLimit(req.query?.limit);
    const skip = (page - 1) * limit;
    const incomingStatus = getString(req.query?.status).toLowerCase();

    const filter = {};
    if (incomingStatus && ALLOWED_STATUSES.has(incomingStatus)) {
      filter.status = incomingStatus;
    }

    const [totalSuggestions, suggestions] = await Promise.all([
      Suggestion.countDocuments(filter),
      Suggestion.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = totalSuggestions > 0 ? Math.ceil(totalSuggestions / limit) : 0;

    return res.status(200).json({
      status: 'success',
      data: {
        suggestions: suggestions.map(normalizeSuggestion),
      },
      pagination: {
        totalSuggestions,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPrevPage: page > 1 && totalPages > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching admin suggestions:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const getAdminSuggestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: 'error', error: 'Suggestion not found' });
    }

    const suggestion = await Suggestion.findById(id).lean();

    if (!suggestion) {
      return res.status(404).json({ status: 'error', error: 'Suggestion not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        suggestion: normalizeSuggestion(suggestion),
      },
    });
  } catch (error) {
    console.error('Error fetching admin suggestion by ID:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const updateAdminSuggestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: 'error', error: 'Suggestion not found' });
    }

    const suggestion = await Suggestion.findById(id);
    if (!suggestion) {
      return res.status(404).json({ status: 'error', error: 'Suggestion not found' });
    }

    const nextStatus = getString(req.body?.status).toLowerCase();
    const moderatorNote = getString(req.body?.moderatorNote, suggestion.moderatorNote || '');

    if (nextStatus && !ALLOWED_STATUSES.has(nextStatus)) {
      return res.status(400).json({ status: 'error', error: 'Invalid status value.' });
    }

    suggestion.moderatorNote = moderatorNote;

    if (nextStatus) {
      suggestion.status = nextStatus;
      suggestion.reviewedBy = req.user?._id || null;
    }

    await suggestion.save();

    return res.status(200).json({
      status: 'success',
      data: {
        suggestion: normalizeSuggestion(suggestion),
      },
    });
  } catch (error) {
    console.error('Error updating admin suggestion:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};
