import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const PRIMARY_COLOR = '#4f8a6f';
const BG_COLOR = '#f6f8f7';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const getFromAddress = () =>
  process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || 'Bloom After <noreply@chijioke.app>';

const getBaseUrl = () =>
  (process.env.APP_BASE_URL || 'https://the-bloom-after.netlify.app').replace(/\/+$/, '');

const roleLabel = (role) => {
  if (role === 'superadmin') return 'Super Admin';
  if (role === 'editor') return 'Content Editor';
  return 'Moderator';
};

const buildHtml = ({ recipientEmail, role, activationLink, invitedByName }) => {
  const senderName = invitedByName?.trim() || 'Bloom After Admin';
  return `
  <div style="margin:0;padding:32px 16px;background:${BG_COLOR};font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:28px 28px 10px 28px;">
          <p style="margin:0 0 14px 0;color:${PRIMARY_COLOR};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">Bloom After Admin</p>
          <h1 style="margin:0 0 14px 0;font-size:24px;line-height:1.3;color:#0f1f19;">You’ve been invited to join Bloom Admin</h1>
          <p style="margin:0 0 10px 0;font-size:16px;line-height:1.7;color:#2c3e37;">Hi,</p>
          <p style="margin:0 0 10px 0;font-size:16px;line-height:1.7;color:#2c3e37;">${senderName} invited you as <strong>${roleLabel(role)}</strong>.</p>
          <p style="margin:0 0 20px 0;font-size:16px;line-height:1.7;color:#2c3e37;">Use the secure link below to set your full name and password.</p>
          <a href="${activationLink}" style="display:inline-block;background:${PRIMARY_COLOR};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:700;">Activate Admin Access</a>
          <p style="margin:20px 0 0 0;font-size:13px;line-height:1.6;color:#5e7069;">This link expires in 24 hours and can only be used once.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 28px 28px 28px;">
          <p style="margin:0;font-size:12px;line-height:1.8;color:#5e7069;">Invited email: ${recipientEmail}</p>
        </td>
      </tr>
    </table>
  </div>`;
};

const buildText = ({ recipientEmail, role, activationLink, invitedByName }) => {
  const senderName = invitedByName?.trim() || 'Bloom After Admin';
  return [
    'You’ve been invited to join Bloom Admin',
    '',
    `${senderName} invited you as ${roleLabel(role)}.`,
    '',
    `Activate your account: ${activationLink}`,
    '',
    'This link expires in 24 hours and can only be used once.',
    `Invited email: ${recipientEmail}`,
  ].join('\n');
};

export const sendAdminInviteEmail = async ({ to, role, inviteToken, invitedByName }) => {
  if (!to) {
    return { sent: false, skipped: true, reason: 'no-recipient' };
  }

  if (!resend) {
    return { sent: false, skipped: true, reason: 'service-unconfigured' };
  }

  const activationLink = `${getBaseUrl()}/client/pages/admin-accept-invite.html?token=${encodeURIComponent(inviteToken)}`;

  try {
    const response = await resend.emails.send({
      from: getFromAddress(),
      to,
      subject: 'Bloom Admin invite: activate your account',
      html: buildHtml({ recipientEmail: to, role, activationLink, invitedByName }),
      text: buildText({ recipientEmail: to, role, activationLink, invitedByName }),
    });

    return {
      sent: true,
      skipped: false,
      reason: null,
      providerId: response?.data?.id || null,
    };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      reason: 'send-failed',
      details: error?.message || 'Unknown email delivery error',
    };
  }
};
