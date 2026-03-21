import crypto from 'crypto';
import validator from 'validator';
import AdminUser from '../models/adminUser.js';
import { sendAdminInviteEmail } from '../utils/adminInviteEmail.js';

const INVITE_TTL_MS = 24 * 60 * 60 * 1000;

const createInviteTokenBundle = () => {
  const inviteToken = crypto.randomBytes(32).toString('hex');
  const inviteTokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex');
  const inviteTokenExpiresAt = new Date(Date.now() + INVITE_TTL_MS);
  return { inviteToken, inviteTokenHash, inviteTokenExpiresAt };
};

const toRoleLabel = (role) => {
  if (role === 'superadmin') return 'Super Admin';
  if (role === 'editor') return 'Content Editor';
  return 'Moderator';
};

const normalizeRole = (role) => {
  const value = String(role || '').trim().toLowerCase();
  if (['superadmin', 'super_admin', 'super admin'].includes(value)) return 'superadmin';
  if (['editor', 'content editor', 'content_editor'].includes(value)) return 'editor';
  if (['moderator', 'mod'].includes(value)) return 'moderator';
  return null;
};

const serializeMember = (member) => ({
  id: String(member._id),
  name: member.name || 'Pending Member',
  email: member.email,
  role: toRoleLabel(member.role || (member.isSuperAdmin ? 'superadmin' : 'moderator')),
  initials: (member.name || member.email || 'AD')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
    || 'AD',
  lastActive: member.lastLogin || null,
  status: member.status || 'active',
  invitedAt: member.inviteSentAt || null,
  canResendInvite: (member.status || 'active') === 'pending',
});

const buildSettingsPayload = async () => {
  const members = await AdminUser.find({})
    .sort({ createdAt: -1, _id: -1 })
    .select('name email role isSuperAdmin status lastLogin inviteSentAt createdAt')
    .lean();

  return {
    inviteRoles: ['Super Admin', 'Content Editor', 'Moderator'],
    members: members.map(serializeMember),
    capabilities: [
      {
        capability: 'Invite New Members',
        superAdmin: true,
        contentEditor: false,
        moderator: false,
      },
      {
        capability: 'Manage Permissions',
        superAdmin: true,
        contentEditor: false,
        moderator: false,
      },
      {
        capability: 'Publish New Content',
        superAdmin: true,
        contentEditor: true,
        moderator: false,
      },
      {
        capability: 'Edit Existing Assets',
        superAdmin: true,
        contentEditor: true,
        moderator: false,
      },
      {
        capability: 'Review Submissions',
        superAdmin: true,
        contentEditor: true,
        moderator: true,
      },
      {
        capability: 'Audit System Logs',
        superAdmin: true,
        contentEditor: false,
        moderator: false,
      },
    ],
    appIdentity: {
      applicationName: 'PPD Targets Admin',
      systemEmail: process.env.RESEND_FROM_EMAIL || 'system@botanical-ledger.io',
      timezone: 'WAT (UTC+01:00)',
      dateFormat: 'DD/MM/YYYY',
    },
    securityProtocol: {
      twoFactorAuthentication: true,
      autoLogoutInactivity: true,
      forcePasswordReset: false,
    },
  };
};

export const getAdminSettings = async (_req, res) => {
  try {
    const data = await buildSettingsPayload();
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const inviteAdminUser = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const normalizedRole = normalizeRole(req.body?.role);

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ status: 'error', error: 'Valid email is required.' });
    }

    if (!normalizedRole) {
      return res.status(400).json({ status: 'error', error: 'Valid role is required.' });
    }

    const existing = await AdminUser.findOne({ email }).select('+inviteTokenHash').exec();

    if (existing && existing.status === 'active') {
      return res.status(409).json({
        status: 'error',
        error: 'This email already belongs to an active admin user.',
      });
    }

    const { inviteToken, inviteTokenHash, inviteTokenExpiresAt } = createInviteTokenBundle();

    const role = normalizedRole;
    const isSuperAdmin = role === 'superadmin';

    let user;
    if (existing) {
      existing.role = role;
      existing.isSuperAdmin = isSuperAdmin;
      existing.status = 'pending';
      existing.inviteTokenHash = inviteTokenHash;
      existing.inviteTokenExpiresAt = inviteTokenExpiresAt;
      existing.inviteSentAt = new Date();
      existing.invitedBy = req.user?._id || null;
      user = await existing.save();
    } else {
      user = await AdminUser.create({
        name: 'Pending Admin',
        email,
        role,
        isSuperAdmin,
        status: 'pending',
        password: crypto.randomBytes(24).toString('hex'),
        inviteTokenHash,
        inviteTokenExpiresAt,
        inviteSentAt: new Date(),
        invitedBy: req.user?._id || null,
      });
    }

    const emailResult = await sendAdminInviteEmail({
      to: email,
      role,
      inviteToken,
      invitedByName: req.user?.name,
    });

    if (!emailResult?.sent) {
      return res.status(500).json({
        status: 'error',
        error: 'Invitation record created but email delivery failed. Please retry.',
        details: emailResult?.details || emailResult?.reason || 'send-failed',
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Invitation sent successfully.',
      data: {
        invitedUser: serializeMember(user),
      },
    });
  } catch (error) {
    console.error('Error inviting admin user:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const resendAdminInvite = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: 'error', error: 'Invite target id is required.' });
    }

    const user = await AdminUser.findById(id).select('+inviteTokenHash').exec();
    if (!user) {
      return res.status(404).json({ status: 'error', error: 'Admin user not found.' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        error: 'Invite can only be resent for pending users.',
      });
    }

    const { inviteToken, inviteTokenHash, inviteTokenExpiresAt } = createInviteTokenBundle();
    user.inviteTokenHash = inviteTokenHash;
    user.inviteTokenExpiresAt = inviteTokenExpiresAt;
    user.inviteSentAt = new Date();
    user.invitedBy = req.user?._id || null;
    await user.save();

    const emailResult = await sendAdminInviteEmail({
      to: user.email,
      role: user.role,
      inviteToken,
      invitedByName: req.user?.name,
    });

    if (!emailResult?.sent) {
      return res.status(500).json({
        status: 'error',
        error: 'Invite was refreshed but email delivery failed.',
        details: emailResult?.details || emailResult?.reason || 'send-failed',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Invitation email resent successfully.',
      data: {
        invitedUser: serializeMember(user),
      },
    });
  } catch (error) {
    console.error('Error resending admin invite:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};
