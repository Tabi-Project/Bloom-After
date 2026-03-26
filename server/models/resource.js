import mongoose from 'mongoose';

const RESOURCE_CONTENT_TYPES = ['article', 'infographic', 'myth-busting', 'media'];
const RESOURCE_MEDIA_FORMATS = ['audio', 'podcast', 'video'];

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: RESOURCE_CONTENT_TYPES,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    readTime: {
      type: String,
      required: true,
    },
    ctaLabel: {
      type: String,
      required: true,
    },
    structuredContent: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    mediaFormat: {
      type: String,
      enum: RESOURCE_MEDIA_FORMATS,
      default: 'audio',
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    published: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
export { RESOURCE_CONTENT_TYPES, RESOURCE_MEDIA_FORMATS };
