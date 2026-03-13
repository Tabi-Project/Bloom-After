export const adminConfig = {
  activePage: "overview",
  totalPending: 0,
  currentRole: "Super Admin",
};

export const adminIcons = {
  overview: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>`,
  queues: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>`,
  content: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>`,
  roles: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
</svg>`,
  trendingUp: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>`,
  chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <polyline points="9 18 15 12 9 6"/>
  </svg>`,
};

export const queueIcons = {
  "clinic-queue": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
  </svg>`,
  "specialist-queue": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
  </svg>`,
  "stories-queue": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <path d="M12 8v4"/><path d="M10 10h4"/>
  </svg>`,
  "podcast-queue": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
  </svg>`,
};

export const contentIcons = {
  create: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>`,
  directory: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>`,
  featured: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>`,
};

export const statsData = [
  {
    id: "page-views-card",
    label: "Page Views",
    value: "12.4K",
    meta: "+14% this week",
  },
  {
    id: "users-card",
    label: "Active Users",
    value: "842",
    meta: "+5% this week",
  },
  {
    id: "searches-card",
    label: "Most Searched Term",
    value: '"Therapist in Lagos"',
    meta: "340 searches",
    muted: true,
  },
  {
    id: "clinics-card",
    label: "Top Visited Clinic",
    value: "MindCare Hospital",
    meta: "128 views today",
    muted: true,
  },
];

export const queuesData = [
  {
    id: "clinic-queue",
    title: "Clinic Submissions",
    subtitle: "Pending approval and edits",
    count: 3,
  },
  {
    id: "specialist-queue",
    title: "Specialist Onboardings",
    subtitle: "Credentials waiting for review",
    count: 5,
  },
  {
    id: "stories-queue",
    title: "Community Stories",
    subtitle: "Needs moderation before publish",
    count: 12,
  },
  {
    id: "podcast-queue",
    title: "Podcast Suggestions",
    subtitle: "User submitted media ideas",
    count: 0,
  },
];

export const draftData = {
  title: "Understanding postpartum warning signs",
  description:
    "Review title, refine summary text, update clinic references, and send for final approval.",
};

export const rolesData = [
  {
    id: "super-admin-role",
    name: "Super Admin",
    desc: "Manage approvals, users, publishing rules, and analytics visibility.",
  },
  {
    id: "content-editor-role",
    name: "Content Editor",
    desc: "Create, edit, archive, and prepare resource hub and directory content.",
  },
  {
    id: "moderator-role",
    name: "Moderator",
    desc: "Review stories, submissions, flagged content, and podcast suggestions.",
  },
];
