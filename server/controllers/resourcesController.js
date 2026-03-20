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
  const status = typeof resource.status === "string"
    ? resource.status
    : (resource.published ? "published" : "draft");

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
    published: status === "published",
    status,
    ...(resource.file_url || resource.sourceUrl
      ? { file_url: getString(resource.file_url, getString(resource.sourceUrl)) }
      : {}),
    ...(structuredContent !== null ? { structured_content: structuredContent } : {}),
  };
};

const buildFilter = (query) => {
  const and = [];
  const published = toPublishedFilter(query.published);
  if (published) {
    and.push({
      $or: [
        { status: "published" },
        { $and: [{ status: { $exists: false } }, { published: true }] },
      ],
    });
  }

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
      $or: [
        { status: "published" },
        { $and: [{ status: { $exists: false } }, { published: true }] },
      ],
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

const parseAdminStatus = (value) => {
  const status = getString(value).toLowerCase();
  if (["draft", "published", "archived"].includes(status)) return status;
  return "";
};

const toAdminResourcePayload = (body, existing = null) => {
  const incomingStatus = parseAdminStatus(body?.status);
  const status = incomingStatus || (existing?.status || (existing?.published ? "published" : "draft"));

  return {
    title: getString(body?.title, existing?.title || ""),
    summary: getString(body?.summary, existing?.summary || ""),
    content: getString(body?.content, existing?.content || ""),
    theme: getString(body?.theme, existing?.theme || "general"),
    contentType: getString(body?.contentType || body?.content_type, existing?.contentType || "article"),
    imageUrl: getString(body?.imageUrl || body?.image_url, existing?.imageUrl || ""),
    sourceUrl: getString(body?.sourceUrl || body?.source_url, existing?.sourceUrl || ""),
    readTime: getString(body?.readTime || body?.read_time, existing?.readTime || ""),
    ctaLabel: getString(body?.ctaLabel || body?.cta_label, existing?.ctaLabel || "Read more"),
    status,
    published: status === "published",
  };
};

export const getAdminResources = async (req, res) => {
  try {
    const status = parseAdminStatus(req.query?.status);
    const filter = status ? { status } : {};

    const resources = await Resource.collection
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    return res.status(200).json({
      status: "success",
      data: {
        resources: resources.map(normalizeResource),
      },
    });
  } catch (error) {
    console.error("Error fetching admin resources:", error);
    return res.status(500).json({ status: "error", error: "Server error" });
  }
};

export const getAdminResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: "error", error: "Resource not found" });
    }

    const resource = await Resource.findById(id).lean();
    if (!resource) {
      return res.status(404).json({ status: "error", error: "Resource not found" });
    }

    return res.status(200).json({
      status: "success",
      data: {
        resource: normalizeResource(resource),
      },
    });
  } catch (error) {
    console.error("Error fetching admin resource by ID:", error);
    return res.status(500).json({ status: "error", error: "Server error" });
  }
};

export const createAdminResource = async (req, res) => {
  try {
    const payload = toAdminResourcePayload(req.body);

    const requiredFields = ["title", "summary", "content", "theme", "contentType", "imageUrl", "sourceUrl", "readTime"];
    const missingField = requiredFields.find((field) => !payload[field]);
    if (missingField) {
      return res.status(400).json({ status: "error", error: `Missing required field: ${missingField}` });
    }

    const created = await Resource.create({
      ...payload,
      reviewedBy: req.user?._id || null,
    });

    return res.status(201).json({
      status: "success",
      data: {
        resource: normalizeResource(created),
      },
    });
  } catch (error) {
    console.error("Error creating admin resource:", error);
    return res.status(500).json({ status: "error", error: "Server error" });
  }
};

export const updateAdminResource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: "error", error: "Resource not found" });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ status: "error", error: "Resource not found" });
    }

    const payload = toAdminResourcePayload(req.body, resource);

    resource.title = payload.title;
    resource.summary = payload.summary;
    resource.content = payload.content;
    resource.theme = payload.theme;
    resource.contentType = payload.contentType;
    resource.imageUrl = payload.imageUrl;
    resource.sourceUrl = payload.sourceUrl;
    resource.readTime = payload.readTime;
    resource.ctaLabel = payload.ctaLabel;
    resource.status = payload.status;
    resource.published = payload.published;
    resource.reviewedBy = req.user?._id || resource.reviewedBy;

    await resource.save();

    return res.status(200).json({
      status: "success",
      data: {
        resource: normalizeResource(resource),
      },
    });
  } catch (error) {
    console.error("Error updating admin resource:", error);
    return res.status(500).json({ status: "error", error: "Server error" });
  }
};
