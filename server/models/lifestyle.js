import mongoose from 'mongoose';

const lifestyleTipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const lifestyleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['lifestyle', 'medical'],
      required: true,
    },
    foundation: {
      type: [String],
      default: [],
    },
    tips: {
      type: [lifestyleTipSchema],
      default: [],
    },
    evidence: {
      type: [String],
      default: [],
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
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  { timestamps: true }
);

lifestyleSchema.index({ status: 1, createdAt: -1 });
lifestyleSchema.index({ category: 1, createdAt: -1 });

const Lifestyle = mongoose.model('Lifestyle', lifestyleSchema);

export default Lifestyle;
