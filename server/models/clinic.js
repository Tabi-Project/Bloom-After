import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { _id: false },
);

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider_type: {
      type: String,
      enum: ['clinic', 'therapist', 'psychiatrist', 'support_group'],
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    rating_avg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    review_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    fee_range: {
      type: String,
      default: '',
    },
    cost_type: {
      type: String,
      enum: ['free', 'subsidised', 'private'],
      required: true,
    },
    is_open_247: {
      type: Boolean,
      default: false,
    },
    opening_hours: {
      type: String,
      default: '',
    },
    consultation_mode: {
      type: String,
      enum: ['both', 'remote', 'in_person'],
      required: true,
    },
    focus_areas: {
      type: [String],
      default: [],
    },
    contact: {
      type: contactSchema,
      default: () => ({}),
    },
    services: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

clinicSchema.index({ location: '2dsphere' });
clinicSchema.index({ provider_type: 1, cost_type: 1, consultation_mode: 1 });
clinicSchema.index({ name: 1, city: 1, state: 1 });

const Clinic = mongoose.model('Clinic', clinicSchema);

export default Clinic;
