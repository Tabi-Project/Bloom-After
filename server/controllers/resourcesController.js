import mongoose from "mongoose";
import Resource from "../models/resource.js";

const MAX_LIMIT = 24;
const DEFAULT_LIMIT = 9;
const RESOURCE_CONTENT_TYPES = ["article", "infographic", "myth-busting", "media"];
const RESOURCE_MEDIA_FORMATS = ["audio", "podcast", "video"];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const getString = (value, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const toPublishedFilter = (value) => {
  if (value === "false") return false;
  if (value === "true") return true;
  return true;
};

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeContentType = (value, fallback = "article") => {
  const normalized = getString(value).toLowerCase();

  if (!normalized) return fallback;
  if (RESOURCE_CONTENT_TYPES.includes(normalized)) return normalized;

  if (["audio", "podcast", "video"].includes(normalized)) return "media";

  if (["myth_busting", "myth busters", "mythbusters", "mythbuster"].includes(normalized)) {
    return "myth-busting";
  }

  return fallback;
};

const normalizeMediaFormat = (value, fallback = "audio") => {
  const normalized = getString(value).toLowerCase();

  if (!normalized) return fallback;
  if (RESOURCE_MEDIA_FORMATS.includes(normalized)) return normalized;

  if (["audio-summary", "audio_summary"].includes(normalized)) return "audio";

  return fallback;
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

  if (Array.isArray(resource.structuredContent)) {
    return resource.structuredContent;
  }

  if (Array.isArray(resource.structuredContent?.blocks)) {
    return resource.structuredContent.blocks;
  }

  if (typeof resource.structuredContent === "object") {
    const { language, ...rest } = resource.structuredContent;
    if (!language) return resource.structuredContent;
    return Object.keys(rest).length ? rest : null;
  }

  return null;
};

const normalizeResource = (resource) => {
  const structuredContent = normalizeStructuredContent(resource);
  const status =
    typeof resource.status === "string"
      ? resource.status
      : resource.published
      ? "published"
      : "draft";

  const contentType = normalizeContentType(
    getString(resource.content_type, getString(resource.contentType, "article")),
    "article"
  );

  const sourceUrl = getString(resource.source_url, getString(resource.sourceUrl));
  const fileUrlFromRecord = getString(resource.file_url, getString(resource.fileUrl));
  const fileUrl = fileUrlFromRecord || (contentType === "media" ? sourceUrl : "");

  const mediaFormat = normalizeMediaFormat(
    getString(resource.media_format, getString(resource.mediaFormat)),
    "audio"
  );

  return {
    id: String(resource._id),
    title: getString(resource.title),
    summary: getString(resource.summary, getString(resource.content)),
    content: getString(resource.content),
    theme: getString(resource.theme),
    content_type: contentType,
    imageUrl: getString(resource.imageUrl, getString(resource.image_url, getString(resource.cover_image))),
    image_url: getString(resource.imageUrl, getString(resource.image_url, getString(resource.cover_image))),
    date: normalizeDate(resource.date, resource.createdAt),
    read_time: getString(resource.read_time, getString(resource.readTime)),
    cta_label: getString(resource.cta_label, getString(resource.ctaLabel, "Read more")),
    published: status === "published",
    status,
    createdAt: resource.createdAt || null,
    updatedAt: resource.updatedAt || null,
    ...(sourceUrl ? { source_url: sourceUrl } : {}),
    ...(fileUrl ? { file_url: fileUrl } : {}),
    ...(contentType === "media" ? { media_format: mediaFormat } : {}),
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

  const contentType = normalizeContentType(getString(query.content_type), "");
  if (contentType) {
    if (contentType === "media") {
      and.push({
        $or: [
          { content_type: { $in: ["media", "audio", "podcast", "video"] } },
          { contentType: { $in: ["media", "audio", "podcast", "video"] } },
        ],
      });
    } else {
      and.push({
        $or: [{ content_type: contentType }, { contentType }],
      });
    }
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

const parseAdminStatus = (value) => {
  const status = getString(value).toLowerCase();
  if (["draft", "published", "archived"].includes(status)) return status;
  return "";
};

const parseStructuredContentInput = (body, existing = null) => {
  if (body?.structured_content !== undefined) return body.structured_content;
  if (body?.structuredContent !== undefined) return body.structuredContent;
  return existing?.structuredContent ?? null;
};

const isValidBlock = (block) => {
  if (!block || typeof block !== "object") return false;
  if (!isNonEmptyString(block.type)) return false;

  if (block.type === "paragraph") {
    return isNonEmptyString(block.text);
  }

  if (["section-text-image", "section-image-text"].includes(block.type)) {
    return (
      isNonEmptyString(block.heading) &&
      isNonEmptyString(block.body) &&
      Array.isArray(block.items) &&
      block.items.length > 0 &&
      block.items.every(isNonEmptyString) &&
      isNonEmptyString(block.imageUrl || block.image_url)
    );
  }

  if (block.type === "bullet-list") {
    return Array.isArray(block.items) && block.items.length > 0 && block.items.every(isNonEmptyString);
  }

  if (block.type === "callout") {
    return isNonEmptyString(block.text);
  }

  return true;
};

const validateStructuredContentByType = (contentType, structuredContent) => {
  if (contentType === "article") {
    if (!Array.isArray(structuredContent) || structuredContent.length === 0) {
      return "Article resources require a non-empty structured_content array.";
    }

    if (!structuredContent.every(isValidBlock)) {
      return "Article structured_content includes invalid blocks.";
    }

    return "";
  }

  if (contentType === "infographic") {
    if (!structuredContent || typeof structuredContent !== "object" || Array.isArray(structuredContent)) {
      return "Infographic resources require structured_content as an object.";
    }

    const { title, tagline, items } = structuredContent;
    if (!isNonEmptyString(title)) {
      return "Infographic structured_content.title is required.";
    }

    if (!isNonEmptyString(tagline)) {
      return "Infographic structured_content.tagline is required.";
    }

    if (!Array.isArray(items) || items.length === 0) {
      return "Infographic structured_content.items must be a non-empty array.";
    }

    const invalidItem = items.find(
      (item) => !item || typeof item !== "object" || !isNonEmptyString(item.icon) || !isNonEmptyString(item.label)
    );

    if (invalidItem) {
      return "Each infographic item must include icon and label.";
    }

    return "";
  }

  if (contentType === "myth-busting") {
    if (!structuredContent || typeof structuredContent !== "object" || Array.isArray(structuredContent)) {
      return "Myth-busting resources require structured_content as an object.";
    }

    const { myths, facts } = structuredContent;

    const validItem = (item) =>
      item && typeof item === "object" && isNonEmptyString(item.label) && isNonEmptyString(item.description);

    if (!Array.isArray(myths) || myths.length === 0 || !myths.every(validItem)) {
      return "Myth-busting structured_content.myths must be a non-empty array of {label, description}.";
    }

    if (!Array.isArray(facts) || facts.length === 0 || !facts.every(validItem)) {
      return "Myth-busting structured_content.facts must be a non-empty array of {label, description}.";
    }

    return "";
  }

  if (contentType === "media") {
    if (!structuredContent || typeof structuredContent !== "object" || Array.isArray(structuredContent)) {
      return "Media resources require structured_content as an object.";
    }

    const summaries = structuredContent.summary_paragraphs;
    if (!Array.isArray(summaries) || summaries.length === 0 || !summaries.every(isNonEmptyString)) {
      return "Media structured_content.summary_paragraphs must be a non-empty array of strings.";
    }

    return "";
  }

  return "Unsupported resource content type.";
};

const validateAdminResourcePayload = (payload) => {
  const requiredFields = ["title", "summary", "content", "theme", "contentType", "imageUrl", "sourceUrl", "readTime", "ctaLabel"];
  const missingField = requiredFields.find((field) => !isNonEmptyString(payload[field]));
  if (missingField) {
    return `Missing required field: ${missingField}`;
  }

  if (!RESOURCE_CONTENT_TYPES.includes(payload.contentType)) {
    return `Invalid content type: ${payload.contentType}`;
  }

  const structuredError = validateStructuredContentByType(payload.contentType, payload.structuredContent);
  if (structuredError) {
    return structuredError;
  }

  if (payload.contentType === "media") {
    if (!isNonEmptyString(payload.fileUrl)) {
      return "Media resources require file_url.";
    }

    if (!RESOURCE_MEDIA_FORMATS.includes(payload.mediaFormat)) {
      return `Invalid media format: ${payload.mediaFormat}`;
    }
  }

  return "";
};

const toAdminResourcePayload = (body, existing = null) => {
  const incomingStatus = parseAdminStatus(body?.status);
  const status = incomingStatus || (existing?.status || (existing?.published ? "published" : "draft"));

  const existingType = normalizeContentType(
    getString(existing?.contentType, getString(existing?.content_type, "article")),
    "article"
  );

  const incomingTypeRaw = body?.contentType ?? body?.content_type;
  const contentType =
    incomingTypeRaw !== undefined
      ? normalizeContentType(incomingTypeRaw, existingType)
      : existingType;

  const sourceUrl = getString(body?.sourceUrl || body?.source_url, existing?.sourceUrl || "");

  const inferredMediaFormatFromLegacyType = normalizeMediaFormat(getString(incomingTypeRaw), "");
  const mediaFormatInput = getString(
    body?.mediaFormat || body?.media_format,
    inferredMediaFormatFromLegacyType || getString(existing?.mediaFormat, "")
  );

  const mediaFormat = normalizeMediaFormat(mediaFormatInput, "audio");

  const fileUrl = getString(
    body?.fileUrl || body?.file_url,
    existing?.fileUrl || existing?.file_url || (contentType === "media" ? sourceUrl : "")
  );

  const summary = getString(body?.summary, existing?.summary || "");
  const content = getString(body?.content, existing?.content || summary);

  return {
    title: getString(body?.title, existing?.title || ""),
    summary,
    content,
    theme: getString(body?.theme, existing?.theme || "general"),
    contentType,
    imageUrl: getString(
      body?.imageUrl || body?.image_url || body?.cover_image,
      existing?.imageUrl || existing?.image_url || existing?.cover_image || ""
    ),
    sourceUrl,
    fileUrl,
    mediaFormat,
    readTime: getString(body?.readTime || body?.read_time, existing?.readTime || ""),
    ctaLabel: getString(body?.ctaLabel || body?.cta_label, existing?.ctaLabel || "Read more"),
    structuredContent: parseStructuredContentInput(body, existing),
    status,
    published: status === "published",
  };
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
    const validationError = validateAdminResourcePayload(payload);

    if (validationError) {
      return res.status(400).json({ status: "error", error: validationError });
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
    const validationError = validateAdminResourcePayload(payload);

    if (validationError) {
      return res.status(400).json({ status: "error", error: validationError });
    }

    resource.title = payload.title;
    resource.summary = payload.summary;
    resource.content = payload.content;
    resource.theme = payload.theme;
    resource.contentType = payload.contentType;
    resource.imageUrl = payload.imageUrl;
    resource.sourceUrl = payload.sourceUrl;
    resource.fileUrl = payload.fileUrl;
    resource.mediaFormat = payload.mediaFormat;
    resource.readTime = payload.readTime;
    resource.ctaLabel = payload.ctaLabel;
    resource.structuredContent = payload.structuredContent;
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
