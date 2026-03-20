import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['clinic', 'specialist', 'media', 'request'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'implemented', 'rejected'],
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

suggestionSchema.index({ status: 1, createdAt: -1 });

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

export default Suggestion;
