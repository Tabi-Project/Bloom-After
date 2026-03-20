import mongoose from "mongoose";
import Story from "../models/story.js";
import cloudinaryUploader from "../utils/upload.js";
import { sendStoryModerationEmail } from "../utils/storyModerationEmail.js";

const MAX_LIMIT = 24;
const DEFAULT_LIMIT = 9;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const getString = (value, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return false;
};

const normalizeWhatHelped = (value) => {
  const items = Array.isArray(value) ? value : [value];
  return items
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
};

const getStoryText = (html) => {
  if (!isNonEmptyString(html)) return "";

  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const normalizeStory = (story) => {
  const contentHtml = getString(story.story, "");
  const storyText = getStoryText(contentHtml);

  return {
    _id: String(story._id),
    name: getString(story.name),
    email: getString(story.email),
    privacy: getString(story.privacy, "named"),
    story: contentHtml,
    story_text: storyText,
    image_url: getString(story.image_url),
    what_helped: Array.isArray(story.what_helped) ? story.what_helped : [],
    location: getString(story.location),
    consent: Boolean(story.consent),
    status: getString(story.status, "pending"),
    createdAt: story.createdAt || null,
    updatedAt: story.updatedAt || null,
    submittedAt: story.createdAt
      ? dateFormatter.format(new Date(story.createdAt))
      : "",
  };
};

export const submitStory = async (req, res) => {
  try {
    const name = getString(req.body?.name);
    const email = getString(req.body?.email);
    const privacy = req.body?.privacy === "anonymous" ? "anonymous" : "named";
    const story = getString(req.body?.story);
    const location = getString(req.body?.location);
    const what_helped = normalizeWhatHelped(req.body?.what_helped || req.body?.tags);
    const consent = toBoolean(req.body?.consent);
    const imageData = getString(req.body?.image);
    console.log("Started")

    if (!story) {
      console.log("NO STORY")
      return res.status(400).json({
        status: "error",
        error: "Story content is required.",
      });
    }

    if (!consent) {
      return res.status(400).json({
        status: "error",
        error: "Moderation consent is required.",
      });
    }

    let image_url = "";
    if (imageData) {
      image_url = await cloudinaryUploader(imageData);
    }

    const created = await Story.create({
      name,
      email,
      privacy,
      story,
      image_url,
      what_helped,
      location,
      consent,
      status: "pending",
    });

    res.status(201).json({
      status: "success",
      data: normalizeStory(created),
    });
  } catch (error) {
    console.error("Error submitting story:", error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

export const getAllStories = async (req, res) => {
  try {
    const status = getString(req.query?.status, "approved");
    const parsedPage = Number.parseInt(req.query?.page, 10);
    const parsedLimit = Number.parseInt(req.query?.limit, 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const filter = {};
    if (["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const [totalStories, stories] = await Promise.all([
      Story.collection.countDocuments(filter),
      Story.collection
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    const totalPages = totalStories > 0 ? Math.ceil(totalStories / limit) : 0;

    res.status(200).json({
      status: "success",
      data: stories.map(normalizeStory),
      pagination: {
        totalStories,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPrevPage: page > 1 && totalPages > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

export const getStoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: "error", error: "Story not found" });
    }

    const story = await Story.collection.findOne({
      _id: new mongoose.Types.ObjectId(id),
      status: "approved",
    });

    if (!story) {
      return res.status(404).json({ status: "error", error: "Story not found" });
    }

    res.status(200).json({
      status: "success",
      data: normalizeStory(story),
      story: normalizeStory(story),
    });
  } catch (error) {
    console.error("Error fetching story by ID:", error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

export const getAdminStories = async (req, res) => {
  try {
    const status = getString(req.query?.status, "");

    const filter = {};
    if (["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const stories = await Story.collection
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    res.status(200).json({
      status: "success",
      data: {
        stories: stories.map(normalizeStory),
      },
    });
  } catch (error) {
    console.error("Error fetching admin stories:", error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

export const getAdminStoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: "error", error: "Story not found" });
    }

    const story = await Story.collection.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!story) {
      return res.status(404).json({ status: "error", error: "Story not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        story: normalizeStory(story),
      },
    });
  } catch (error) {
    console.error("Error fetching admin story by ID:", error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

export const updateAdminStory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ status: "error", error: "Story not found" });
    }

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ status: "error", error: "Story not found" });
    }

    const incomingStatus = getString(req.body?.status);
    const nextStatus = ["pending", "approved", "rejected"].includes(incomingStatus)
      ? incomingStatus
      : "";

    const moderatorNote = getString(req.body?.moderatorNote, story.moderatorNote || "");
    const notificationEmail = getString(req.body?.notificationEmail, story.email || "");
    const rejectionMessage = getString(req.body?.rejectionMessage);
    const didStatusChange = nextStatus && nextStatus !== story.status;
    let emailNotification = {
      attempted: false,
      sent: false,
      skipped: true,
      reason: 'status-unchanged',
    };

    story.moderatorNote = moderatorNote;

    if (didStatusChange) {
      story.status = nextStatus;
      story.reviewedAt = new Date();
      story.reviewedBy = req.user?._id || null;
    }

    await story.save();

    if (didStatusChange && ["approved", "rejected"].includes(nextStatus)) {
      emailNotification = {
        attempted: true,
        sent: false,
        skipped: true,
        reason: 'no-recipient',
      };

      try {
        const emailResult = await sendStoryModerationEmail({
          to: notificationEmail,
          name: story.privacy === "named" ? story.name : "",
          status: nextStatus,
          rejectionMessage,
        });
        emailNotification = {
          attempted: true,
          sent: Boolean(emailResult?.sent),
          skipped: Boolean(emailResult?.skipped),
          reason: emailResult?.reason || null,
        };
      } catch (emailError) {
        console.error("Story moderation email failed:", emailError);
        emailNotification = {
          attempted: true,
          sent: false,
          skipped: false,
          reason: 'send-failed',
        };
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        story: normalizeStory(story),
        emailNotification,
      },
    });
  } catch (error) {
    console.error("Error updating admin story:", error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};
