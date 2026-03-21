import mongoose from 'mongoose';

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
      language: {
        type: String,
        default: 'en',
      },
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
