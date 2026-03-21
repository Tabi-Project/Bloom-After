import mongoose from 'mongoose';

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cover_image: {
      type: String,
      default: '',
    },
    mission: {
      type: String,
      default: '',
      trim: true,
    },
    focus_areas: {
      type: [String],
      default: [],
    },
    services: {
      type: [String],
      default: [],
    },
    geographic_coverage: {
      type: String,
      default: '',
      trim: true,
    },
    coverage_type: {
      type: String,
      enum: ['local', 'regional', 'national', 'international', 'other'],
      default: 'local',
    },
    contact: {
      phone: {
        type: String,
        default: '',
        trim: true,
      },
      email: {
        type: String,
        default: '',
        trim: true,
      },
    },
    website: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
    },
    moderatorNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true },
);

ngoSchema.index({ status: 1, createdAt: -1 });
ngoSchema.index({ name: 1 });

const NGO = mongoose.model('NGO', ngoSchema);

export default NGO;
