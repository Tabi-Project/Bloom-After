export const adminConfig = {
  activePage: "overview",
  totalPending: 0,
  currentRole: "Super Admin",
};

export const statsData = [
  {
    id: "total-resources-card",
    label: "Total Resources",
    value: "0",
    meta: "Library size",
    muted: true,
  },
  {
    id: "published-resources-card",
    label: "Published Resources",
    value: "0",
    meta: "Live on Bloom After",
    muted: true,
  },
  {
    id: "draft-resources-card",
    label: "Draft Resources",
    value: "0",
    meta: "Needs review",
    muted: true,
  },
  {
    id: "pending-stories-card",
    label: "Stories Pending Review",
    value: "0",
    meta: "Awaiting moderation",
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
