import {
  AdminClinicRaw,
  AdminLifestyleRaw,
  AdminNgoRaw,
  AdminResourceRaw,
  ContentDestination,
  ContentFormData,
  ContentStatus,
  DestinationConfig,
  FieldDef,
  NgoStatus,
} from "@/types/content-management";
import { ArticleBlock, InfographicContent, MediaContent, MythBustingContent } from "@/types/resource";

// ── Destinations ──────────────────────────────────────────────────────────────
// Mirrors client/js/pages/content-management.js DESTINATIONS + content-editor.js
// TYPE_CONFIG (merged — client kept these in two files with duplicated labels).
// NGO has no `newUrl`: there's no admin "create NGO" endpoint, only public
// submission + admin review (see server/routes/adminNgosRouter.js).
export const DESTINATIONS: DestinationConfig[] = [
  {
    id: "resource",
    label: "Resource Hub",
    desc: "Articles, infographics, audio summaries, podcasts, myth-busting guides.",
    color: "var(--color-brand-400)",
    bgColor: "var(--color-brand-50)",
    fields: [
      "title",
      "summary",
      "content_type",
      "theme",
      "image",
      "source_url",
      "read_time",
      "cta_label",
      "body",
      "article_blocks",
      "infographic_title",
      "infographic_tagline",
      "infographic_items",
      "myths",
      "facts",
      "media_format",
      "file_url",
      "summary_paragraphs",
    ],
    apiBase: "/api/v1/admin/resources",
    backUrl: "/admin/content-manager?filter=resource",
    newUrl: "/admin/content-manager/editor?type=resource",
  },
  {
    id: "lifestyle",
    label: "Lifestyle Hub",
    desc: "Lifestyle and medical interventions for postpartum support.",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    fields: ["title", "category", "subtitle", "summary", "foundation", "tips", "evidence"],
    apiBase: "/api/v1/admin/lifestyle",
    backUrl: "/admin/content-manager?filter=lifestyle",
    newUrl: "/admin/content-manager/editor?type=lifestyle",
  },
  {
    id: "ngo",
    label: "NGO Directory",
    desc: "NGOs and support organisations providing maternal health services.",
    color: "#0369a1",
    bgColor: "#f0f9ff",
    fields: ["title", "mission", "services", "coverage", "website", "email", "phone", "image"],
    apiBase: "/api/v1/admin/ngos",
    backUrl: "/admin/content-manager?filter=ngo",
  },
  {
    id: "clinic",
    label: "Clinic Directory",
    desc: "Verified healthcare providers offering postpartum mental health support.",
    color: "#15803d",
    bgColor: "#f0fdf4",
    fields: [
      "title",
      "provider_type",
      "description",
      "services",
      "city",
      "state",
      "address",
      "opening_hours",
      "fee_range",
      "contact_email",
      "contact_phone",
      "website",
      "image",
      "accepting_new_patients",
    ],
    apiBase: "/api/v1/admin/clinics",
    backUrl: "/admin/content-manager?filter=clinic",
    newUrl: "/admin/content-manager/editor?type=clinic",
  },
];

export const getDestination = (type: string): DestinationConfig =>
  DESTINATIONS.find((d) => d.id === type) || DESTINATIONS[0];

// ── Field definitions ─────────────────────────────────────────────────────────
// Mirrors content-editor.js FIELD_DEFS. Dropped a few entries client defined
// but never wired into any DESTINATIONS.fields list (tags, speciality,
// credentials, languages, consultation_types, location, source_label,
// is_medical) — they rendered nothing and matched no backend field.
export const FIELD_DEFS: Record<string, FieldDef> = {
  title: {
    label: "Title",
    type: "text",
    required: true,
    placeholder: "Enter a clear, descriptive title",
  },
  summary: {
    label: "Summary",
    type: "textarea",
    rows: 2,
    placeholder: "Short description shown on cards (150 chars max)",
    hint: "Shown on resource cards in the hub.",
  },
  foundation: {
    label: "Foundation paragraphs",
    type: "textarea",
    rows: 6,
    required: true,
    placeholder: "One paragraph per line",
    hint: "Each line becomes a paragraph in the Foundation section.",
  },
  tips: {
    label: "Practical strategies",
    type: "textarea",
    rows: 6,
    required: true,
    placeholder: "Tip title | Tip description",
    hint: "One tip per line in the format: title | description",
  },
  evidence: {
    label: "Clinical evidence",
    type: "textarea",
    rows: 6,
    required: true,
    placeholder: "One evidence point per line",
  },
  description: {
    label: "Description",
    type: "textarea",
    rows: 3,
    placeholder: "Describe this entry",
  },
  body: {
    label: "Full content",
    type: "textarea",
    rows: 10,
    placeholder: "Full article body…",
    hint: "Used for article resources as the main content.",
  },
  article_blocks: {
    label: "Article blocks",
    type: "textarea",
    rows: 8,
    placeholder: "One paragraph per block. Separate paragraphs with a blank line.",
    hint: "For article type. Each paragraph becomes a structured paragraph block.",
  },
  content_type: {
    label: "Content type",
    type: "select",
    required: true,
    options: [
      { value: "", label: "Choose type…" },
      { value: "article", label: "Article" },
      { value: "infographic", label: "Infographic" },
      { value: "media", label: "Media" },
      { value: "myth-busting", label: "Myth-Busting Guide" },
    ],
  },
  cta_label: {
    label: "CTA label",
    type: "text",
    required: true,
    placeholder: "e.g. Read more, Listen now, View guide",
    hint: "Button label shown on resource cards.",
  },
  infographic_title: {
    label: "Infographic title",
    type: "text",
    placeholder: "Main infographic headline",
  },
  infographic_tagline: {
    label: "Infographic tagline",
    type: "text",
    placeholder: "Short closing line",
  },
  infographic_items: {
    label: "Infographic items",
    type: "textarea",
    rows: 6,
    placeholder: "icon | label\nicon | label",
    hint: "One item per line in the format: icon | label",
  },
  myths: {
    label: "Myths",
    type: "textarea",
    rows: 6,
    placeholder: "Myth 1 | Description\nMyth 2 | Description",
    hint: "One myth per line in the format: label | description",
  },
  facts: {
    label: "Facts",
    type: "textarea",
    rows: 6,
    placeholder: "Fact 1 | Description\nFact 2 | Description",
    hint: "One fact per line in the format: label | description",
  },
  media_format: {
    label: "Media format",
    type: "select",
    required: true,
    options: [
      { value: "audio", label: "Audio" },
      { value: "podcast", label: "Podcast" },
      { value: "video", label: "Video" },
    ],
  },
  file_url: {
    label: "Media file URL",
    type: "url",
    required: true,
    placeholder: "https://…",
    hint: "Direct audio/video file URL used by the media player.",
  },
  summary_paragraphs: {
    label: "Media summary paragraphs",
    type: "textarea",
    rows: 6,
    required: true,
    placeholder: "One paragraph per line",
    hint: "Used beneath the media player. Enter one paragraph per line.",
  },
  theme: {
    label: "Theme",
    type: "select",
    required: true,
    options: [
      { value: "", label: "Choose theme…" },
      { value: "symptoms", label: "Symptoms" },
      { value: "causes", label: "Causes" },
      { value: "treatment", label: "Treatment" },
      { value: "recovery", label: "Recovery" },
      { value: "general", label: "General" },
    ],
  },
  category: {
    label: "Category",
    type: "select",
    required: true,
    options: [
      { value: "", label: "Choose category…" },
      { value: "lifestyle", label: "Lifestyle Change" },
      { value: "medical", label: "Medical Option" },
    ],
  },
  provider_type: {
    label: "Provider type",
    type: "select",
    required: true,
    options: [
      { value: "", label: "Choose type…" },
      { value: "clinic", label: "Clinic" },
      { value: "therapist", label: "Therapist" },
      { value: "psychiatrist", label: "Psychiatrist" },
      { value: "support_group", label: "Support Group" },
    ],
  },
  mission: {
    label: "Mission / Focus",
    type: "textarea",
    rows: 3,
    required: true,
    placeholder: "What does this organisation do?",
  },
  services: {
    label: "Services offered",
    type: "textarea",
    rows: 3,
    placeholder: "One service per line",
    hint: "Enter each service on a new line.",
  },
  coverage: {
    label: "Geographic coverage",
    type: "text",
    placeholder: "e.g. Lagos, South-West Nigeria, National",
  },
  city: {
    label: "City",
    type: "text",
    required: true,
    placeholder: "e.g. Lagos",
  },
  state: {
    label: "State",
    type: "text",
    required: true,
    placeholder: "e.g. Lagos State",
  },
  address: {
    label: "Full address",
    type: "text",
    placeholder: "Street address",
  },
  opening_hours: {
    label: "Opening hours",
    type: "text",
    placeholder: "e.g. Mon–Fri 8am–5pm",
  },
  fee_range: {
    label: "Fee range",
    type: "text",
    placeholder: "e.g. ₦5,000–₦15,000",
  },
  source_url: {
    label: "Source / reference URL",
    type: "url",
    required: true,
    placeholder: "https://…",
  },
  website: {
    label: "Website URL",
    type: "url",
    placeholder: "https://…",
  },
  email: {
    label: "Email",
    type: "email",
    placeholder: "contact@organisation.org",
  },
  contact_email: {
    label: "Contact email",
    type: "email",
    placeholder: "contact@example.com",
  },
  phone: {
    label: "Phone",
    type: "tel",
    placeholder: "+234 …",
  },
  contact_phone: {
    label: "Contact phone",
    type: "tel",
    placeholder: "+234 …",
  },
  read_time: {
    label: "Read time",
    type: "text",
    required: true,
    placeholder: "e.g. 5 min read",
  },
  image: {
    label: "Image URL",
    type: "url",
    required: true,
    placeholder: "https://… (paste image URL or upload via file)",
    hint: "Paste a URL or leave blank to upload a file.",
  },
  accepting_new_patients: {
    label: "Accepting new patients",
    type: "checkbox",
  },
};

// ── Resource sub-type visibility ──────────────────────────────────────────────

const RESOURCE_TYPE_SPECIFIC_FIELDS: Record<string, string[]> = {
  article: ["body", "article_blocks"],
  infographic: ["infographic_title", "infographic_tagline", "infographic_items"],
  "myth-busting": ["myths", "facts"],
  media: ["media_format", "file_url", "summary_paragraphs"],
};

const ALL_RESOURCE_TYPE_SPECIFIC_FIELDS = Object.values(RESOURCE_TYPE_SPECIFIC_FIELDS).flat();

export function getNormalizedResourceType(data: Record<string, unknown>): string {
  const raw = String(data.content_type || "").trim().toLowerCase();
  if (!raw) return "article";
  if (raw === "audio" || raw === "podcast" || raw === "video") return "media";
  if (raw === "myth_busting") return "myth-busting";
  return raw;
}

export function getVisibleFields(type: ContentDestination, fields: string[], data: ContentFormData): string[] {
  if (type !== "resource") return fields;

  const selectedType = getNormalizedResourceType(data);
  const sharedFields = fields.filter((field) => !ALL_RESOURCE_TYPE_SPECIFIC_FIELDS.includes(field));
  return [...sharedFields, ...(RESOURCE_TYPE_SPECIFIC_FIELDS[selectedType] || [])];
}

const RESOURCE_REQUIRED_BY_TYPE: Record<string, string[]> = {
  article: ["body", "article_blocks"],
  infographic: ["infographic_title", "infographic_tagline", "infographic_items"],
  "myth-busting": ["myths", "facts"],
  media: ["file_url", "summary_paragraphs", "media_format"],
};

const RESOURCE_BASE_REQUIRED = ["title", "summary", "content_type", "theme", "image", "source_url", "read_time", "cta_label"];

export function isFieldRequired(type: ContentDestination, key: string, data: ContentFormData): boolean {
  if (type !== "resource") {
    return Boolean(FIELD_DEFS[key]?.required);
  }

  if (RESOURCE_BASE_REQUIRED.includes(key)) return true;

  const selectedType = getNormalizedResourceType(data);
  return (RESOURCE_REQUIRED_BY_TYPE[selectedType] || []).includes(key);
}

// ── String <-> structured-value helpers ───────────────────────────────────────

export function splitLines(value: unknown = ""): string[] {
  return String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitParagraphs(value: unknown = ""): string[] {
  return String(value ?? "")
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFirstNonEmptyString(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

interface PipeItem {
  label: string;
  description: string;
}

function parsePipeList(value: unknown = ""): PipeItem[] {
  return splitLines(value)
    .map((line) => {
      const [left, ...rest] = line.split("|");
      const label = String(left || "").trim();
      const description = rest.join("|").trim();
      return label && description ? { label, description } : null;
    })
    .filter((item): item is PipeItem => item !== null);
}

interface InfographicItemInput {
  icon: string;
  label: string;
}

function parseInfographicItems(value: unknown = ""): InfographicItemInput[] {
  return splitLines(value)
    .map((line) => {
      const [left, ...rest] = line.split("|");
      const icon = String(left || "").trim();
      const label = rest.join("|").trim();
      return icon && label ? { icon, label } : null;
    })
    .filter((item): item is InfographicItemInput => item !== null);
}

function toPipeList(items: PipeItem[] | undefined): string {
  if (!Array.isArray(items)) return "";
  return items
    .map((item) => {
      const label = String(item?.label || "").trim();
      const description = String(item?.description || "").trim();
      return label && description ? `${label} | ${description}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

function toInfographicLines(items: InfographicItemInput[] | undefined): string {
  if (!Array.isArray(items)) return "";
  return items
    .map((item) => {
      const icon = String(item?.icon || "").trim();
      const label = String(item?.label || "").trim();
      return icon && label ? `${icon} | ${label}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

function toArticleBlocksText(structuredContent: unknown, fallbackBody = ""): string {
  if (!Array.isArray(structuredContent) || structuredContent.length === 0) {
    return fallbackBody || "";
  }

  const paragraphs = (structuredContent as ArticleBlock[])
    .filter((block) => block?.type === "paragraph" && typeof (block as { text?: unknown }).text === "string")
    .map((block) => (block as { text: string }).text.trim())
    .filter(Boolean);

  return paragraphs.join("\n\n") || fallbackBody || "";
}

function buildResourceStructuredContent(
  data: ContentFormData
): ArticleBlock[] | InfographicContent | MythBustingContent | MediaContent {
  const selectedType = getNormalizedResourceType(data);

  if (selectedType === "article") {
    return splitParagraphs(data.article_blocks || data.body).map((text) => ({
      type: "paragraph",
      text,
    }));
  }

  if (selectedType === "infographic") {
    return {
      title: String(data.infographic_title || "").trim(),
      tagline: String(data.infographic_tagline || "").trim(),
      items: parseInfographicItems(data.infographic_items),
    };
  }

  if (selectedType === "myth-busting") {
    return {
      myths: parsePipeList(data.myths),
      facts: parsePipeList(data.facts),
    };
  }

  return { summary_paragraphs: splitLines(data.summary_paragraphs) };
}

// ── Status mapping ────────────────────────────────────────────────────────────

export function normalizeStatus(value: unknown): ContentStatus {
  if (value === "published" || value === "draft" || value === "archived") return value;
  return "draft";
}

export function mapNgoStatusToContentStatus(status: NgoStatus | string | undefined): ContentStatus {
  if (status === "approved") return "published";
  if (status === "rejected") return "archived";
  return "draft";
}

export function mapContentStatusToNgoStatus(status: ContentStatus | string | undefined): NgoStatus {
  if (status === "published") return "approved";
  if (status === "archived") return "rejected";
  return "pending";
}

// ── raw API record -> editor form state ───────────────────────────────────────

export function toEditorFormData(type: ContentDestination, raw: Record<string, unknown>): ContentFormData {
  if (type === "resource") {
    const r = raw as unknown as AdminResourceRaw;
    const selectedType = getNormalizedResourceType({ content_type: r.content_type });
    const structured = r.structured_content ?? null;
    const articleBody = String(r.content || r.summary || "").trim();

    return {
      type: "resource",
      title: r.title || "",
      summary: r.summary || "",
      body: articleBody,
      article_blocks: toArticleBlocksText(structured, articleBody),
      content_type: selectedType,
      theme: r.theme || "",
      image: getFirstNonEmptyString(r.imageUrl, r.image_url),
      source_url: r.source_url || "",
      read_time: r.read_time || "",
      cta_label: r.cta_label || "Read more",
      infographic_title: (structured as InfographicContent)?.title || "",
      infographic_tagline: (structured as InfographicContent)?.tagline || "",
      infographic_items: toInfographicLines((structured as InfographicContent)?.items),
      myths: toPipeList((structured as MythBustingContent)?.myths),
      facts: toPipeList((structured as MythBustingContent)?.facts),
      media_format: r.media_format || "audio",
      file_url: r.file_url || r.source_url || "",
      summary_paragraphs: Array.isArray((structured as MediaContent)?.summary_paragraphs)
        ? (structured as MediaContent).summary_paragraphs.join("\n")
        : "",
      status: normalizeStatus(r.status ?? (r.published ? "published" : "draft")),
      featured: Boolean(r.featured),
      updatedAt: r.updatedAt,
    };
  }

  if (type === "lifestyle") {
    const r = raw as unknown as AdminLifestyleRaw;
    return {
      type: "lifestyle",
      title: r.title || "",
      category: r.category || "lifestyle",
      subtitle: r.subtitle || "",
      summary: r.summary || "",
      foundation: Array.isArray(r.foundation) ? r.foundation.join("\n") : "",
      tips: Array.isArray(r.tips)
        ? r.tips
            .map((tip) => {
              const title = String(tip?.title || "").trim();
              const desc = String(tip?.desc || "").trim();
              return title && desc ? `${title} | ${desc}` : "";
            })
            .filter(Boolean)
            .join("\n")
        : "",
      evidence: Array.isArray(r.evidence) ? r.evidence.join("\n") : "",
      status: normalizeStatus(r.status),
      featured: false,
      updatedAt: r.updatedAt,
    };
  }

  if (type === "ngo") {
    const r = raw as unknown as AdminNgoRaw;
    return {
      type: "ngo",
      title: r.name || "",
      mission: r.mission || "",
      services: Array.isArray(r.services) ? r.services.join("\n") : "",
      coverage: r.geographic_coverage || "",
      website: r.website || "",
      email: r.contact?.email || "",
      phone: r.contact?.phone || "",
      image: r.cover_image || "",
      status: mapNgoStatusToContentStatus(r.status),
      featured: false,
      updatedAt: r.updatedAt,
    };
  }

  const r = raw as unknown as AdminClinicRaw;
  return {
    type: "clinic",
    title: r.name || "",
    provider_type: r.provider_type || "clinic",
    description: r.description || "",
    services: Array.isArray(r.services) ? r.services.join("\n") : "",
    city: r.city || "",
    state: r.state || "",
    address: r.contact?.address || "",
    opening_hours: r.opening_hours || "",
    fee_range: r.fee_range || "",
    contact_email: r.contact?.email || "",
    contact_phone: r.contact?.phone || "",
    website: r.website || "",
    image: r.cover_image || "",
    accepting_new_patients: Boolean(r.accepting_new_patients),
    status: normalizeStatus(r.status),
    featured: false,
    updatedAt: r.updatedAt,
  };
}

// ── editor form state -> API payload ──────────────────────────────────────────

export function toApiPayload(type: ContentDestination, data: ContentFormData): Record<string, unknown> {
  if (type === "resource") {
    const selectedType = getNormalizedResourceType(data);
    const structuredContent = buildResourceStructuredContent(data);
    const articleContent =
      selectedType === "article"
        ? String(data.body || data.article_blocks || "").trim()
        : String(data.summary || "").trim();

    return {
      title: data.title,
      summary: data.summary,
      content: articleContent,
      theme: data.theme,
      contentType: selectedType,
      imageUrl: data.image,
      sourceUrl: data.source_url,
      fileUrl: data.file_url,
      mediaFormat: data.media_format || "audio",
      readTime: data.read_time,
      ctaLabel: data.cta_label || "Read more",
      structuredContent,
      status: normalizeStatus(data.status),
      featured: Boolean(data.featured),
    };
  }

  if (type === "lifestyle") {
    const tips = splitLines(data.tips)
      .map((line) => {
        const [left, ...rest] = line.split("|");
        const title = String(left || "").trim();
        const desc = rest.join("|").trim();
        return title && desc ? { title, desc } : null;
      })
      .filter((tip): tip is { title: string; desc: string } => tip !== null);

    return {
      title: data.title,
      category: data.category,
      subtitle: data.subtitle,
      summary: data.summary,
      foundation: splitLines(data.foundation),
      tips,
      evidence: splitLines(data.evidence),
      status: normalizeStatus(data.status),
    };
  }

  if (type === "ngo") {
    return {
      name: data.title,
      mission: data.mission,
      services: splitLines(data.services),
      geographic_coverage: data.coverage,
      website: data.website,
      email: data.email,
      phone: data.phone,
      cover_image: data.image,
      status: mapContentStatusToNgoStatus(data.status),
    };
  }

  return {
    name: data.title,
    provider_type: data.provider_type,
    description: data.description,
    services: splitLines(data.services),
    city: data.city,
    state: data.state,
    address: data.address,
    opening_hours: data.opening_hours,
    fee_range: data.fee_range,
    email: data.contact_email,
    phone: data.contact_phone,
    website: data.website,
    cover_image: data.image,
    accepting_new_patients: Boolean(data.accepting_new_patients),
    status: normalizeStatus(data.status),
  };
}
