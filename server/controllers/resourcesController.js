import mongoose from "mongoose";
import Resource from "../models/resource.js";

const MAX_LIMIT = 24;
const DEFAULT_LIMIT = 9;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const getString = (value, fallback = "") =>
  typeof value === "string" && value.trim() ? value : fallback;

const toPublishedFilter = (value) => {
  if (value === "false") return false;
  if (value === "true") return true;
  return true;
};

const normalizeDate = (rawDate, createdAt) => {
  if (typeof rawDate === "string" && rawDate.trim()) {
    return rawDate;
  }

  if (!createdAt) return "";

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return "";
  return dateFormatter.format(parsed);
};

const normalizeStructuredContent = (resource) => {
  if (resource.structured_content !== undefined) {
    return resource.structured_content;
  }

  if (resource.structuredContent === undefined || resource.structuredContent === null) {
    return null;
  }

  if (Array.isArray(resource.structuredContent?.blocks)) {
    return resource.structuredContent.blocks;
  }

  if (typeof resource.structuredContent === "object") {
    const { language, ...rest } = resource.structuredContent;
    return Object.keys(rest).length ? rest : null;
  }

  return null;
};

const normalizeResource = (resource) => {
  const structuredContent = normalizeStructuredContent(resource);

  return {
    id: String(resource._id),
    title: getString(resource.title),
    summary: getString(resource.summary, getString(resource.content)),
    theme: getString(resource.theme),
    content_type: getString(resource.content_type, getString(resource.contentType, "article")),
    image_url: getString(resource.image_url, getString(resource.imageUrl)),
    date: normalizeDate(resource.date, resource.createdAt),
    read_time: getString(resource.read_time, getString(resource.readTime)),
    cta_label: getString(resource.cta_label, getString(resource.ctaLabel, "Read more")),
    published: typeof resource.published === "boolean" ? resource.published : true,
    ...(resource.file_url || resource.sourceUrl
      ? { file_url: getString(resource.file_url, getString(resource.sourceUrl)) }
      : {}),
    ...(structuredContent !== null ? { structured_content: structuredContent } : {}),
  };
};

const buildFilter = (query) => {
  const and = [];
  const published = toPublishedFilter(query.published);
  and.push({ published });

  const theme = getString(query.theme);
  if (theme) {
    and.push({ theme });
  }

  const contentType = getString(query.content_type);
  if (contentType) {
    and.push({
      $or: [{ content_type: contentType }, { contentType }],
    });
  }

  const q = getString(query.q);
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    and.push({
      $or: [{ title: regex }, { summary: regex }, { content: regex }],
    });
  }

  const excludeId = getString(query.exclude_id);
  if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    and.push({ _id: { $ne: new mongoose.Types.ObjectId(excludeId) } });
  }

  return and.length === 1 ? and[0] : { $and: and };
};

export const getALLResources = async (req, res) => {
  try {
    const parsedPage = Number.parseInt(req.query.page, 10);
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;
    const skip = (page - 1) * limit;
    const filter = buildFilter(req.query);

    const [totalResources, resources] = await Promise.all([
      Resource.collection.countDocuments(filter),
      Resource.collection
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    const totalPages = totalResources > 0 ? Math.ceil(totalResources / limit) : 0;

    res.status(200).json({
      status: "success",
      data: resources.map(normalizeResource),
      pagination: {
        totalResources,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPrevPage: page > 1 && totalPages > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

export const getResourceById = async (req, res) => {
  try {
    const resourceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(404).json({ status: "error", error: "Resource not found" });
    }

    const resource = await Resource.collection.findOne({
      _id: new mongoose.Types.ObjectId(resourceId),
      published: true,
    });

    if (!resource) {
      return res.status(404).json({ status: "error", error: "Resource not found" });
    }

    res.status(200).json({ status: "success", data: normalizeResource(resource) });
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};
