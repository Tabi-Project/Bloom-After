import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function requiredName() {
        return this.status === 'active';
      },
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function requiredPassword() {
        return this.status === 'active';
      },
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['superadmin', 'editor', 'moderator'],
      default: 'moderator',
    },
    status: {
      type: String,
      enum: ['pending', 'active'],
      default: 'active',
      index: true,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    inviteTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    inviteTokenExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    inviteSentAt: {
      type: Date,
      default: null,
    },
    inviteAcceptedAt: {
      type: Date,
      default: null,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Hash password before saving
adminUserSchema.pre('save', async function () {
  if (this.role === 'superadmin') {
    this.isSuperAdmin = true;
  }

  if (this.isSuperAdmin && this.role !== 'superadmin') {
    this.role = 'superadmin';
  }

  if (this.status === 'pending') {
    this.lastLogin = null;
  }

  if (!this.isModified('password') || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
adminUserSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

const AdminUser = mongoose.model('AdminUser', adminUserSchema);

export default AdminUser;
