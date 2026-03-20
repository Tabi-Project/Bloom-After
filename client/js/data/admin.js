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

export const settingsData = {
  inviteRoles: ["Super Admin", "Content Editor", "Moderator"],
  members: [
    {
      id: "member-elena",
      name: "Elena Halvorsen",
      email: "elena@botanical.io",
      role: "Super Admin",
      initials: "EH",
      lastActive: "2 mins ago",
      status: "active",
    },
    {
      id: "member-julian",
      name: "Julian Moss",
      email: "j.moss@botanical.io",
      role: "Content Editor",
      initials: "JM",
      lastActive: "5 hours ago",
      status: "active",
    },
    {
      id: "member-aria",
      name: "Aria Rose",
      email: "aria@botanical.io",
      role: "Moderator",
      initials: "AR",
      lastActive: "Yesterday",
      status: "active",
    },
    {
      id: "member-iyo",
      name: "Iyo Nelson",
      email: "iyo@botanical.io",
      role: "Content Editor",
      initials: "IN",
      lastActive: "Pending",
      status: "pending",
    },
    {
      id: "member-sophia",
      name: "Sophia Ade",
      email: "sophia@botanical.io",
      role: "Moderator",
      initials: "SA",
      lastActive: "Pending",
      status: "pending",
    },
    {
      id: "member-kingsley",
      name: "Kingsley Duke",
      email: "kingsley@botanical.io",
      role: "Content Editor",
      initials: "KD",
      lastActive: "Pending",
      status: "pending",
    },
  ],
  capabilities: [
    {
      capability: "Invite New Members",
      superAdmin: true,
      contentEditor: false,
      moderator: false,
    },
    {
      capability: "Manage Permissions",
      superAdmin: true,
      contentEditor: false,
      moderator: false,
    },
    {
      capability: "Publish New Content",
      superAdmin: true,
      contentEditor: true,
      moderator: false,
    },
    {
      capability: "Edit Existing Assets",
      superAdmin: true,
      contentEditor: true,
      moderator: false,
    },
    {
      capability: "Review Submissions",
      superAdmin: true,
      contentEditor: true,
      moderator: true,
    },
    {
      capability: "Audit System Logs",
      superAdmin: true,
      contentEditor: false,
      moderator: false,
    },
  ],
  appIdentity: {
    applicationName: "PPD Targets Admin",
    systemEmail: "system@botanical-ledger.io",
    timezone: "WAT (UTC+01:00)",
    dateFormat: "DD/MM/YYYY",
  },
  securityProtocol: {
    twoFactorAuthentication: true,
    autoLogoutInactivity: true,
    forcePasswordReset: false,
  },
};
