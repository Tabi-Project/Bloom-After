import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const PRIMARY_COLOR = '#4f8a6f';
const BG_COLOR = '#f6f8f7';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const getFromAddress = () => process.env.RESEND_FROM || 'Bloom After <noreply@chijioke.app>';

const getBaseUrl = () =>
  (process.env.APP_BASE_URL || 'https://the-bloom-after.netlify.app').replace(/\/+$/, '');

const buildFooterLinks = () => {
  const base = getBaseUrl();
  return [
    { label: 'Stories', href: `${base}/stories` },
    { label: 'Resources', href: `${base}/resources` },
    { label: 'Clinics', href: `${base}/clinics` },
    { label: 'Support', href: `${base}/support` },
  ];
};

const getCategoryLabel = (type) => {
  const normalized = String(type || '').toLowerCase();
  if (normalized === 'clinic') return 'Clinic recommendation';
  if (normalized === 'specialist') return 'Specialist onboarding';
  if (normalized === 'media') return 'Media suggestion';
  if (normalized === 'request') return 'Other request';
  return 'General suggestion';
};

const getCopy = ({ status, rejectionMessage }) => {
  if (status === 'approved') {
    return {
      subject: 'Your suggestion has been approved',
      title: 'Your suggestion is approved',
      lead: 'Thank you for helping Bloom After grow.',
      body: 'Our moderation team has reviewed your suggestion and approved it for implementation.',
      ctaLabel: 'Explore Bloom After',
      ctaPath: '/client/pages//',
    };
  }

  if (status === 'implemented') {
    return {
      subject: 'Your suggestion has been implemented',
      title: 'Your suggestion is now live',
      lead: 'Great news from the Bloom After team.',
      body: 'Your approved suggestion has now been implemented and is live on the platform.',
      ctaLabel: 'View Platform',
      ctaPath: '/client/pages//',
    };
  }

  return {
    subject: 'Update on your suggestion submission',
    title: 'Update on your suggestion',
    lead: 'Thank you for sharing your idea with us.',
    body:
      rejectionMessage && rejectionMessage.trim()
        ? rejectionMessage.trim()
        : 'After review, we are unable to move forward with this suggestion right now.',
    ctaLabel: 'Send Another Suggestion',
    ctaPath: '/client/pages//',
  };
};

const buildHtml = ({ status, type, rejectionMessage }) => {
  const copy = getCopy({ status, rejectionMessage });
  const ctaHref = `${getBaseUrl()}${copy.ctaPath}`;
  const categoryLabel = getCategoryLabel(type);
  const footerLinks = buildFooterLinks();

  const linksHtml = footerLinks
    .map(
      (link) =>
        `<a href="${link.href}" style="color:${PRIMARY_COLOR};text-decoration:none;font-weight:600;">${link.label}</a>`,
    )
    .join(' <span style="color:#9aa6a0;">•</span> ');

  return `
  <div style="margin:0;padding:32px 16px;background:${BG_COLOR};font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:28px 28px 10px 28px;">
          <p style="margin:0 0 14px 0;color:${PRIMARY_COLOR};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">Bloom After</p>
          <h1 style="margin:0 0 14px 0;font-size:24px;line-height:1.3;color:#0f1f19;">${copy.title}</h1>
          <p style="margin:0 0 10px 0;font-size:16px;line-height:1.7;color:#2c3e37;">${copy.lead}</p>
          <p style="margin:0 0 10px 0;font-size:16px;line-height:1.7;color:#2c3e37;">Category: <strong>${categoryLabel}</strong></p>
          <p style="margin:0 0 24px 0;font-size:16px;line-height:1.7;color:#2c3e37;">${copy.body}</p>
          <a href="${ctaHref}" style="display:inline-block;background:${PRIMARY_COLOR};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:700;">${copy.ctaLabel}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px 28px 28px;">
          <p style="margin:0 0 14px 0;font-size:12px;line-height:1.7;color:#5e7069;">Need help? Reply to this email and our team will get back to you.</p>
          <p style="margin:0;font-size:12px;line-height:1.8;color:#5e7069;">${linksHtml}</p>
        </td>
      </tr>
    </table>
  </div>`;
};

const buildText = ({ status, type, rejectionMessage }) => {
  const copy = getCopy({ status, rejectionMessage });
  const categoryLabel = getCategoryLabel(type);
  const ctaHref = `${getBaseUrl()}${copy.ctaPath}`;

  return [
    copy.title,
    '',
    copy.lead,
    `Category: ${categoryLabel}`,
    '',
    copy.body,
    '',
    `${copy.ctaLabel}: ${ctaHref}`,
    '',
    '— Bloom After Team',
  ].join('\n');
};

export const sendSuggestionModerationEmail = async ({ to, status, type, rejectionMessage }) => {
  if (!to) {
    return { sent: false, skipped: true, reason: 'no-recipient' };
  }

  if (!resend) {
    return { sent: false, skipped: true, reason: 'service-unconfigured' };
  }

  const copy = getCopy({ status, rejectionMessage });

  await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: copy.subject,
    html: buildHtml({ status, type, rejectionMessage }),
    text: buildText({ status, type, rejectionMessage }),
  });

  return { sent: true, skipped: false, reason: null };
};
