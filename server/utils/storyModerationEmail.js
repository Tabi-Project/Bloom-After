import { Resend } from 'resend';

const PRIMARY_COLOR = '#4f8a6f';
const BG_COLOR = '#f6f8f7';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const getBaseUrl = () =>
  (process.env.APP_BASE_URL || 'https://the-bloom-after.netlify.app').replace(/\/+$/, '');

const getFromAddress = () =>
  process.env.RESEND_FROM || 'Bloom After <noreply@chijioke.app>';

const buildFooterLinks = () => {
  const base = getBaseUrl();
  return [
    { label: 'Stories', href: `${base}/client/pages/stories.html` },
    { label: 'Resources', href: `${base}/client/pages/resources.html` },
    { label: 'Clinics', href: `${base}/client/pages/clinics.html` },
    { label: 'Community Guidelines', href: `${base}/community-guidelines` },
    { label: 'Support', href: `${base}/support` },
  ];
};

const getEmailCopy = ({ status, rejectionMessage }) => {
  if (status === 'approved') {
    return {
      title: 'Your story is now live',
      lead: 'Thank you for sharing your journey with Bloom After.',
      body: 'After review, we have approved your story and published it in the community library.',
      ctaLabel: 'View Stories',
      ctaPath: '/client/pages/stories.html',
    };
  }

  return {
    title: 'Update on your story submission',
    lead: 'Thank you for trusting Bloom After with your story.',
    body:
      rejectionMessage && rejectionMessage.trim()
        ? rejectionMessage.trim()
        : 'After review, we are unable to publish your submission at this time.',
    ctaLabel: 'Read Submission Tips',
    ctaPath: '/client/pages/submit-story.html',
  };
};

const buildHtml = ({ name, status, rejectionMessage }) => {
  const safeName = name?.trim() ? name.trim() : 'there';
  const copy = getEmailCopy({ status, rejectionMessage });
  const base = getBaseUrl();
  const ctaHref = `${base}${copy.ctaPath}`;
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
          <p style="margin:0 0 10px 0;font-size:16px;line-height:1.7;color:#2c3e37;">Hi ${safeName},</p>
          <p style="margin:0 0 10px 0;font-size:16px;line-height:1.7;color:#2c3e37;">${copy.lead}</p>
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

const buildText = ({ name, status, rejectionMessage }) => {
  const safeName = name?.trim() ? name.trim() : 'there';
  const copy = getEmailCopy({ status, rejectionMessage });
  const ctaHref = `${getBaseUrl()}${copy.ctaPath}`;

  return [
    `${copy.title}`,
    '',
    `Hi ${safeName},`,
    '',
    copy.lead,
    copy.body,
    '',
    `${copy.ctaLabel}: ${ctaHref}`,
    '',
    '— Bloom After Team',
  ].join('\n');
};

export const sendStoryModerationEmail = async ({
  to,
  name,
  status,
  rejectionMessage,
}) => {
  if (!to) {
    return { sent: false, skipped: true, reason: 'no-recipient' };
  }

  if (!resend) {
    return { sent: false, skipped: true, reason: 'service-unconfigured' };
  }

  const subject =
    status === 'approved'
      ? 'Your Bloom After story has been approved'
      : 'Update on your Bloom After story submission';

  await resend.emails.send({
    from: getFromAddress(),
    to,
    subject,
    html: buildHtml({ name, status, rejectionMessage }),
    text: buildText({ name, status, rejectionMessage }),
  });

  return { sent: true, skipped: false, reason: null };
};
