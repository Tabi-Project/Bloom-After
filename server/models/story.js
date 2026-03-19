/**
 * Story model — user-submitted recovery stories.
 *
 * API contract expected by the frontend
 * ─────────────────────────────────────
 * POST /api/v1/stories          submit new story (multipart/form-data, needs multer)
 *   req.body.name               string  (optional)
 *   req.body.story              string  (required)
 *   req.body.location           string  (optional)
 *   req.body.privacy            'named' | 'anonymous'
 *   req.body.consent            'true' | 'false'  (comes as string from FormData)
 *   req.body.what_helped        string | string[]  (repeated field, multer collects as array)
 *   req.file                    uploaded image → run through cloudinaryUploader, store URL as image_url
 *   res  { status: 'success', data: { _id, ...story } }
 *
 * GET  /api/v1/stories?status=approved   public library list
 *   res  { status: 'success', data: Story[], pagination: { ... } }
 *
 * Admin-only moderation routes (backend to define as needed):
 *   GET  /api/v1/stories?status=pending   pending queue
 *   PATCH /api/v1/stories/:id/approve
 *   PATCH /api/v1/stories/:id/reject
 */
import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    // Author info ─ matches submit-story form fields
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    privacy: {
      type: String,
      enum: ['named', 'anonymous'],
      default: 'named',
    },

    // Core content
    story: {
      type: String,
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      default: '',
    },

    // What helped — multi-select tags from the form
    what_helped: {
      type: [String],
      default: [],
    },

    // Location (city, country free-text)
    location: {
      type: String,
      trim: true,
      default: '',
    },

    // User must tick consent before submitting
    consent: {
      type: Boolean,
      required: true,
    },

    // Admin moderation workflow
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
    reviewedAt: {
      type: Date,
      default: null,
    },
    moderatorNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true },
);

// Index so the library query (approved only) is fast
storySchema.index({ status: 1, createdAt: -1 });

const Story = mongoose.model('Story', storySchema);

export default Story;
