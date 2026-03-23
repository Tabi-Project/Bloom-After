import {
  renderAdminSidebar,
  renderAdminTopbar,
  initAdminNavbar,
} from '../components/adminNavbar.js';
import { renderFooter } from '../components/footer.js';
import api from '../api.js';

const ADMIN_USER_KEY = 'adminUser';


const TYPE_CONFIG = {
  resource: {
    label:    'Resource Hub',
    backUrl:  '/admin/content-manager?filter=resource',
    fields:   ['title', 'summary', 'content_type', 'theme', 'body', 'image', 'source_url', 'read_time', 'tags'],
    apiBase:  '/api/v1/admin/resources',
  },
  ngo: {
    label:    'NGO Directory',
    backUrl:  '/admin/content-manager?filter=ngo',
    fields:   ['title', 'description', 'mission', 'services', 'coverage', 'website', 'email', 'phone', 'image'],
    apiBase:  '/api/v1/admin/ngos',
  },
  clinic: {
    label:    'Clinic Directory',
    backUrl:  '/admin/content-manager?filter=clinic',
    fields:   ['title', 'provider_type', 'description', 'services', 'city', 'state', 'address', 'opening_hours', 'fee_range', 'contact_email', 'contact_phone', 'website', 'image', 'accepting_new_patients'],
    apiBase:  '/api/v1/admin/clinics',
  },
};


const FIELD_DEFS = {
  title: {
    label: 'Title',
    type:  'text',
    required: true,
    placeholder: 'Enter a clear, descriptive title',
  },
  summary: {
    label: 'Summary',
    type:  'textarea',
    rows:  2,
    placeholder: 'Short description shown on cards (150 chars max)',
    hint:  'Shown on resource cards in the hub.',
  },
  description: {
    label: 'Description',
    type:  'textarea',
    rows:  3,
    placeholder: 'Describe this entry',
  },
  body: {
    label: 'Full content',
    type:  'textarea',
    rows:  10,
    placeholder: 'Full article or resource body…',
    hint:  'Supports plain text. Paragraphs separated by blank lines.',
  },
  content_type: {
    label:   'Content type',
    type:    'select',
    required: true,
    options: [
      { value: '',              label: 'Choose type…'       },
      { value: 'article',       label: 'Article'            },
      { value: 'infographic',   label: 'Infographic'        },
      { value: 'audio',         label: 'Audio Summary'      },
      { value: 'podcast',       label: 'Podcast / Media'    },
      { value: 'myth-busting',  label: 'Myth-Busting Guide' },
    ],
  },
  theme: {
    label:   'Theme',
    type:    'select',
    options: [
      { value: '',           label: 'Choose theme…'      },
      { value: 'symptoms',   label: 'Symptoms'           },
      { value: 'causes',     label: 'Causes'             },
      { value: 'treatment',  label: 'Treatment'          },
      { value: 'recovery',   label: 'Recovery'           },
      { value: 'general',    label: 'General'            },
    ],
  },
  category: {
    label:   'Category',
    type:    'select',
    required: true,
    options: [
      { value: '',           label: 'Choose category…'    },
      { value: 'lifestyle',  label: 'Lifestyle Change'    },
      { value: 'medical',    label: 'Medical Option'      },
    ],
  },
  provider_type: {
    label:   'Provider type',
    type:    'select',
    required: true,
    options: [
      { value: '',             label: 'Choose type…'       },
      { value: 'clinic',       label: 'Clinic'             },
      { value: 'therapist',    label: 'Therapist'          },
      { value: 'psychiatrist', label: 'Psychiatrist'       },
      { value: 'hospital',     label: 'Hospital'           },
    ],
  },
  speciality: {
    label:       'Speciality',
    type:        'text',
    placeholder: 'e.g. Perinatal Psychiatry',
  },
  credentials: {
    label:       'Credentials',
    type:        'text',
    placeholder: 'e.g. MBBS, MRCPsych',
  },
  mission: {
    label:       'Mission / Focus',
    type:        'textarea',
    rows:        2,
    placeholder: 'What does this organisation do?',
  },
  services: {
    label:       'Services offered',
    type:        'textarea',
    rows:        3,
    placeholder: 'One service per line',
    hint:        'Enter each service on a new line.',
  },
  coverage: {
    label:       'Geographic coverage',
    type:        'text',
    placeholder: 'e.g. Lagos, South-West Nigeria, National',
  },
  city: {
    label:       'City',
    type:        'text',
    placeholder: 'e.g. Lagos',
  },
  state: {
    label:       'State',
    type:        'text',
    placeholder: 'e.g. Lagos State',
  },
  location: {
    label:       'Location',
    type:        'text',
    placeholder: 'City, State, Country',
  },
  address: {
    label:       'Full address',
    type:        'text',
    placeholder: 'Street address',
  },
  opening_hours: {
    label:       'Opening hours',
    type:        'text',
    placeholder: 'e.g. Mon–Fri 8am–5pm',
  },
  fee_range: {
    label:       'Fee range',
    type:        'text',
    placeholder: 'e.g. ₦5,000–₦15,000',
  },
  languages: {
    label:       'Languages spoken',
    type:        'text',
    placeholder: 'e.g. English, Yoruba, Igbo',
  },
  consultation_types: {
    label:       'Consultation types',
    type:        'text',
    placeholder: 'e.g. In-person, Virtual',
  },
  source_label: {
    label:       'Source name',
    type:        'text',
    placeholder: 'e.g. WHO, NHS, ACOG',
  },
  source_url: {
    label:       'Source / reference URL',
    type:        'url',
    placeholder: 'https://…',
  },
  website: {
    label:       'Website URL',
    type:        'url',
    placeholder: 'https://…',
  },
  email: {
    label:       'Email',
    type:        'email',
    placeholder: 'contact@organisation.org',
  },
  contact_email: {
    label:       'Contact email',
    type:        'email',
    placeholder: 'contact@example.com',
  },
  phone: {
    label:       'Phone',
    type:        'tel',
    placeholder: '+234 …',
  },
  contact_phone: {
    label:       'Contact phone',
    type:        'tel',
    placeholder: '+234 …',
  },
  read_time: {
    label:       'Read time',
    type:        'text',
    placeholder: 'e.g. 5 min read',
  },
  tags: {
    label:       'Tags',
    type:        'text',
    placeholder: 'Comma-separated: anxiety, sleep, recovery',
    hint:        'Used for search and related content.',
  },
  image: {
    label: 'Image URL',
    type:  'url',
    placeholder: 'https://… (paste image URL or upload via file)',
    hint:  'Paste a URL or leave blank to upload a file.',
  },
  is_medical: {
    label: 'This is a medical option',
    type:  'checkbox',
    hint:  'Medical items will carry an individual disclaimer on the public page.',
  },
  accepting_new_patients: {
    label: 'Accepting new patients',
    type:  'checkbox',
  },
};


let formData    = {};
let contentType = '';
let contentId   = null;
let cfg         = null;
let isDirty     = false;
let isImageUploading = false;


async function init() {
  const stored = getStoredAdmin();
  const params = new URLSearchParams(window.location.search);
  contentType  = params.get('type') || 'resource';
  contentId    = params.get('id')   || null;
  cfg          = TYPE_CONFIG[contentType] || TYPE_CONFIG.resource;

  const urlTitle = params.get('_title');
if (urlTitle && !contentId) {
  // New entry being started from dashboard — seed formData with the title
  formData = { status: 'draft', type: contentType, title: urlTitle.trim() };
} else if (urlTitle && contentId) {
  // Existing draft — show title immediately, full data loads via fetchEntry
  formData = { status: 'draft', type: contentType, title: urlTitle.trim() };
}

  // Render chrome
  document.getElementById('sidebar-root').innerHTML = renderAdminSidebar({
    activePage: 'content-management',
    totalPending: 0,
    currentRole: stored.isSuperAdmin ? 'superadmin' : 'moderator',
  });
  document.getElementById('topbar-root').innerHTML = renderAdminTopbar({
    name: stored.name, email: stored.email,
  });
  document.getElementById('footer-root').innerHTML = renderFooter();
  initAdminNavbar();
  bindLogout();

  // Update breadcrumb + back link
  document.getElementById('cm-breadcrumb-current').textContent =
    contentId ? `Edit ${cfg.label}` : `New ${cfg.label}`;
  document.getElementById('cm-back-link').href = cfg.backUrl;
  document.title = `${contentId ? 'Edit' : 'New'} ${cfg.label} — Bloom Admin`;

  // Load existing data if editing
  if (contentId) {
    renderEditorSkeleton();
    const existing = await fetchEntry(contentId);
    if (!existing) { showError('Entry not found or has been removed.'); return; }
    formData = { ...existing };
  } else {
    formData = { status: 'draft', type: contentType };
  }

  renderEditor();
  bindEditorEvents();
  bindPreview();
}

// ── Data ───────────────────────────────────────────────────────────────────────

async function fetchEntry(id) {
  const res = await api.get(`${cfg.apiBase}/${id}`);
  const raw = res?.data?.resource || res?.data?.ngo || res?.data?.clinic || res?.data || null;
  if (!raw) return null;
  return toEditorFormData(raw);
}

// ── Render editor ──────────────────────────────────────────────────────────────

function renderEditor() {
  const root   = document.getElementById('cm-editor-root');
  const fields = cfg.fields;

  const fieldsHtml = fields.map((key) => {
    const def = FIELD_DEFS[key];
    if (!def) return '';
    return renderField(key, def, formData[key]);
  }).join('');

  root.innerHTML = `
    <div class="cm-editor-layout">

      <!-- Main form -->
      <div class="cm-editor-main">
        <div class="cm-editor-type-badge" style="--dest-color:${getDestColor()}">
          ${cfg.label}
        </div>

        <form id="cm-editor-form" class="cm-editor-form" novalidate>
          ${fieldsHtml}
        </form>
      </div>

      <!-- Right panel: meta + actions -->
      <aside class="cm-editor-sidebar" aria-label="Publishing options">

        <!-- Status -->
        <div class="cm-editor-panel">
          <h3 class="cm-editor-panel-title">Status</h3>
          <div class="cm-status-select-wrap">
            <select id="cm-status-select" class="cm-editor-select" aria-label="Content status">
              <option value="draft"     ${formData.status === 'draft'     ? 'selected' : ''}>Draft</option>
              <option value="published" ${formData.status === 'published' ? 'selected' : ''}>Published</option>
              <option value="archived"  ${formData.status === 'archived'  ? 'selected' : ''}>Archived</option>
            </select>
          </div>
        </div>

        <!-- Featured -->
        <div class="cm-editor-panel">
          <h3 class="cm-editor-panel-title">Visibility</h3>
          <label class="cm-checkbox-label">
            <input type="checkbox" id="cm-featured" class="cm-checkbox" ${formData.featured ? 'checked' : ''} />
            <span>Featured content</span>
          </label>
          <p class="cm-field-hint">Featured items are highlighted in the hub.</p>
        </div>

        <!-- Feedback -->
        <div id="cm-save-feedback" class="cm-save-feedback" hidden role="alert"></div>

        <!-- Action buttons -->
        <div class="cm-editor-actions">
          <button class="btn btn-primary cm-btn-save" id="cm-btn-save" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save
          </button>
          <button class="btn cm-btn-preview" id="cm-btn-preview" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Preview
          </button>
        </div>

        ${contentId ? `
          <div class="cm-editor-meta">
            <p class="cm-meta-line">
              <span class="cm-meta-label">ID</span>
              <span class="cm-meta-value">${escHtml(contentId)}</span>
            </p>
            ${formData.updatedAt ? `
              <p class="cm-meta-line">
                <span class="cm-meta-label">Last saved</span>
                <span class="cm-meta-value">${new Date(formData.updatedAt).toLocaleString('en-GB')}</span>
              </p>
            ` : ''}
          </div>
        ` : ''}

      </aside>
    </div>
  `;
}

function renderField(key, def, value = '') {
  const id       = `field-${key}`;
  const required = def.required ? 'required' : '';
  const reqMark  = def.required ? `<span class="cm-required" aria-hidden="true">*</span>` : '';
  const hint     = def.hint ? `<p class="cm-field-hint">${def.hint}</p>` : '';

  // Special handling for image field: allow URL or file upload with preview
  if (key === 'image') {
    return `
      <div class="cm-field cm-field-image">
        <label class="cm-field-label" for="${id}">${def.label}${reqMark}</label>
        <div class="cm-image-row">
          <input
            type="url"
            id="${id}"
            name="${key}"
            class="cm-field-input"
            value="${escHtml(String(value || ''))}"
            placeholder="${escHtml(def.placeholder || '')}"
            ${required}
          />
          <button type="button" class="btn cm-btn-upload" id="${id}-upload">Upload</button>
        </div>
        <input type="file" id="${id}-file" accept="image/*" hidden />
        <div class="cm-upload-status" id="${id}-upload-status" hidden>
          <span class="cm-upload-spinner" aria-hidden="true"></span>
          <span class="cm-upload-text">Uploading image…</span>
        </div>
        <div class="cm-image-preview-wrap" id="${id}-preview-wrap" ${!value ? 'hidden' : ''}>
          <img src="${escHtml(String(value || ''))}" id="${id}-preview" class="cm-image-preview" alt="" />
          <button type="button" class="btn cm-btn-remove-image" id="${id}-remove">Remove</button>
        </div>
        ${hint}
      </div>
    `;
  }
  if (def.type === 'textarea') {
    return `
      <div class="cm-field">
        <label class="cm-field-label" for="${id}">${def.label}${reqMark}</label>
        <textarea id="${id}" name="${key}" class="cm-field-input cm-field-textarea"
          rows="${def.rows || 4}" placeholder="${escHtml(def.placeholder || '')}"
          ${required}>${escHtml(String(value || ''))}</textarea>
        ${hint}
      </div>
    `;
  }

  if (def.type === 'select') {
    const opts = (def.options || []).map((o) =>
      `<option value="${escHtml(o.value)}" ${String(value) === o.value ? 'selected' : ''}>${escHtml(o.label)}</option>`
    ).join('');
    return `
      <div class="cm-field">
        <label class="cm-field-label" for="${id}">${def.label}${reqMark}</label>
        <select id="${id}" name="${key}" class="cm-field-input cm-field-select" ${required}>${opts}</select>
        ${hint}
      </div>
    `;
  }

  if (def.type === 'checkbox') {
    return `
      <div class="cm-field cm-field-check">
        <label class="cm-checkbox-label">
          <input type="checkbox" id="${id}" name="${key}" class="cm-checkbox" ${value ? 'checked' : ''} />
          <span>${def.label}</span>
        </label>
        ${hint}
      </div>
    `;
  }

  return `
    <div class="cm-field">
      <label class="cm-field-label" for="${id}">${def.label}${reqMark}</label>
      <input
        type="${def.type || 'text'}"
        id="${id}"
        name="${key}"
        class="cm-field-input"
        value="${escHtml(String(value || ''))}"
        placeholder="${escHtml(def.placeholder || '')}"
        ${required}
      />
      ${hint}
    </div>
  `;
}

function renderEditorSkeleton() {
  document.getElementById('cm-editor-root').innerHTML = `
    <div class="cm-editor-layout">
      <div class="cm-editor-main">
        <div class="skeleton-line" style="width:120px;height:28px;margin-bottom:24px"></div>
        ${Array.from({ length: 5 }).map(() => `
          <div class="cm-field">
            <div class="skeleton-line" style="width:100px;height:14px;margin-bottom:8px"></div>
            <div class="skeleton-block" style="width:100%;height:44px;border-radius:8px"></div>
          </div>
        `).join('')}
      </div>
      <div class="cm-editor-sidebar">
        <div class="skeleton-block" style="width:100%;height:120px;border-radius:8px;margin-bottom:16px"></div>
        <div class="skeleton-block" style="width:100%;height:80px;border-radius:8px"></div>
      </div>
    </div>
  `;
}

// ── Editor events ──────────────────────────────────────────────────────────────

function bindEditorEvents() {
  const form = document.getElementById('cm-editor-form');

  // Track dirty state
  form.addEventListener('input', () => { isDirty = true; });
  form.addEventListener('change', () => { isDirty = true; });

  // Save
  document.getElementById('cm-btn-save').addEventListener('click', saveEntry);

  // Unsaved changes warning
  window.addEventListener('beforeunload', (e) => {
    if (isDirty) { e.preventDefault(); e.returnValue = ''; }
  });

  // Image upload handling (if image field is present)
  const imageFileInput = document.getElementById('field-image-file');
  const imageUrlInput = document.getElementById('field-image');
  const imagePreviewWrap = document.getElementById('field-image-preview-wrap');
  const imagePreview = document.getElementById('field-image-preview');
  const imageUploadBtn = document.getElementById('field-image-upload');
  const imageRemoveBtn = document.getElementById('field-image-remove');
  const imageUploadStatus = document.getElementById('field-image-upload-status');

  if (imageUploadBtn && imageFileInput) {
    imageUploadBtn.addEventListener('click', () => imageFileInput.click());
  }

  if (imageFileInput) {
    imageFileInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file || !file.type.startsWith('image/')) return;

      const dataUrl = await readFileAsDataUrl(file);
      if (!dataUrl) return;

      if (imagePreview) imagePreview.src = dataUrl;
      if (imagePreviewWrap) imagePreviewWrap.hidden = false;

      setImageUploadState(true, imageUploadStatus);
      try {
        const res = await api.post('/api/v1/admin/upload/image', { image: dataUrl });
        const uploadedUrl = res?.data?.image_url || '';
        if (!uploadedUrl) {
          throw new Error('Missing uploaded URL');
        }
        if (imageUrlInput) imageUrlInput.value = uploadedUrl;
        if (imagePreview) imagePreview.src = uploadedUrl;
        isDirty = true;
      } catch (_) {
        showFeedback(document.getElementById('cm-save-feedback'), 'Image upload failed. Try again.', 'error');
      } finally {
        setImageUploadState(false, imageUploadStatus);
      }
    });
  }

  if (imageUrlInput) {
    imageUrlInput.addEventListener('change', () => {
      const value = imageUrlInput.value.trim();
      if (!value) {
        if (imagePreview) imagePreview.src = '';
        if (imagePreviewWrap) imagePreviewWrap.hidden = true;
        return;
      }
      if (imagePreview) imagePreview.src = value;
      if (imagePreviewWrap) imagePreviewWrap.hidden = false;
    });
  }

  if (imageRemoveBtn) {
    imageRemoveBtn.addEventListener('click', () => {
      if (imageUrlInput) imageUrlInput.value = '';
      if (imagePreview) imagePreview.src = '';
      if (imagePreviewWrap) imagePreviewWrap.hidden = true;
      if (imageFileInput) imageFileInput.value = '';
      isDirty = true;
    });
  }
}

function setImageUploadState(uploading, uploadStatusEl) {
  isImageUploading = uploading;

  const saveBtn = document.getElementById('cm-btn-save');
  if (saveBtn) {
    saveBtn.disabled = uploading;
  }

  if (uploadStatusEl) {
    uploadStatusEl.hidden = !uploading;
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function collectFormData() {
  const form    = document.getElementById('cm-editor-form');
  const data    = { type: contentType };
  const inputs  = form.querySelectorAll('input, textarea, select');

  inputs.forEach((el) => {
    if (!el.name) return;
    if (el.type === 'checkbox') {
      data[el.name] = el.checked;
    } else {
      data[el.name] = el.value.trim();
    }
  });

  // Status + featured from sidebar
  const statusSel = document.getElementById('cm-status-select');
  const featuredCb = document.getElementById('cm-featured');
  if (statusSel)  data.status   = statusSel.value;
  if (featuredCb) data.featured = featuredCb.checked;

  return data;
}

function splitLines(value = '') {
  return String(value)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toEditorFormData(raw) {
  if (contentType === 'resource') {
    return {
      type: 'resource',
      title: raw.title || '',
      summary: raw.summary || '',
      body: raw.content || raw.summary || '',
      content_type: raw.content_type || raw.contentType || '',
      theme: raw.theme || '',
      image: raw.image_url || raw.imageUrl || '',
      source_url: raw.source_url || raw.sourceUrl || '',
      read_time: raw.read_time || raw.readTime || '',
      status: normalizeStatus(raw.status || (raw.published ? 'published' : 'draft')),
      featured: Boolean(raw.featured),
      updatedAt: raw.updatedAt,
    };
  }

  if (contentType === 'ngo') {
    return {
      type: 'ngo',
      title: raw.name || '',
      description: raw.mission || '',
      mission: raw.mission || '',
      services: Array.isArray(raw.services) ? raw.services.join('\n') : '',
      coverage: raw.geographic_coverage || '',
      website: raw.website || '',
      email: raw.contact?.email || raw.email || '',
      phone: raw.contact?.phone || raw.phone || '',
      image: raw.cover_image || '',
      status: mapNgoStatusToContentStatus(raw.status),
      featured: false,
      updatedAt: raw.updatedAt,
    };
  }

  return {
    type: 'clinic',
    title: raw.name || '',
    provider_type: raw.provider_type || '',
    description: raw.description || '',
    services: Array.isArray(raw.services) ? raw.services.join('\n') : '',
    city: raw.city || '',
    state: raw.state || '',
    address: raw.contact?.address || raw.address || '',
    opening_hours: raw.opening_hours || '',
    fee_range: raw.fee_range || '',
    contact_email: raw.contact?.email || '',
    contact_phone: raw.contact?.phone || '',
    website: raw.website || '',
    image: raw.cover_image || '',
    accepting_new_patients: Boolean(raw.accepting_new_patients),
    status: normalizeStatus(raw.status || 'draft'),
    featured: false,
    updatedAt: raw.updatedAt,
  };
}

function toApiPayload(data) {
  if (contentType === 'resource') {
    return {
      title: data.title,
      summary: data.summary,
      content: data.body,
      theme: data.theme,
      content_type: data.content_type,
      image_url: data.image,
      source_url: data.source_url,
      read_time: data.read_time,
      status: normalizeStatus(data.status),
      featured: Boolean(data.featured),
    };
  }

  if (contentType === 'ngo') {
    return {
      name: data.title,
      mission: data.mission || data.description,
      services: splitLines(data.services),
      geographic_coverage: data.coverage,
      website: data.website,
      email: data.email,
      phone: data.phone,
      cover_image: data.image,
      status: mapContentStatusToNgoStatus(normalizeStatus(data.status)),
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

function normalizeStatus(value) {
  if (value === 'published' || value === 'draft' || value === 'archived') return value;
  return 'draft';
}

function mapNgoStatusToContentStatus(value) {
  if (value === 'approved') return 'published';
  if (value === 'rejected') return 'archived';
  return 'draft';
}

function mapContentStatusToNgoStatus(value) {
  if (value === 'published') return 'approved';
  if (value === 'archived') return 'rejected';
  return 'pending';
}

async function saveEntry() {
  const btn      = document.getElementById('cm-btn-save');
  const feedback = document.getElementById('cm-save-feedback');

  if (isImageUploading) {
    showFeedback(feedback, 'Please wait for image upload to finish.', 'error');
    return;
  }

  const data     = collectFormData();
  const payload  = toApiPayload(data);

  // Basic required field check
  const missing = cfg.fields.filter((key) => {
    const def = FIELD_DEFS[key];
    return def?.required && !data[key];
  });

  if (missing.length) {
    const labels = missing.map((k) => FIELD_DEFS[k]?.label || k).join(', ');
    showFeedback(feedback, `Please fill in required fields: ${labels}`, 'error');
    // Highlight first missing field
    document.getElementById(`field-${missing[0]}`)?.focus();
    return;
  }

  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = `<span>Saving…</span>`;

  try {
    let res;
    if (contentId) {
      res = await api.patch(`${cfg.apiBase}/${contentId}`, payload);
    } else {
      res = await api.post(cfg.apiBase, payload);
      // Redirect to edit URL after creation
      const newId = res?.data?.resource?.id || res?.data?.ngo?.id || res?.data?.clinic?.id || res?.data?.id;
      if (newId) {
        isDirty = false;
        window.location.replace(`editor?type=${contentType}&id=${newId}`);
        return;
      }
    }
    isDirty = false;
    formData = { ...formData, ...data };
    showFeedback(feedback, 'Saved successfully.', 'success');
  } catch (_) {
    showFeedback(feedback, 'Failed to save. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

// ── Preview ────────────────────────────────────────────────────────────────────

function bindPreview() {
  document.getElementById('cm-btn-preview')?.addEventListener('click', openPreview);
  document.getElementById('cm-preview-close')?.addEventListener('click', closePreview);
  document.getElementById('cm-preview-overlay')?.addEventListener('click', closePreview);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePreview();
  });
}

function openPreview() {
  const data   = collectFormData();
  const drawer = document.getElementById('cm-preview-drawer');
  const overlay = document.getElementById('cm-preview-overlay');
  const body   = document.getElementById('cm-preview-body');

  body.innerHTML = buildPreviewHtml(data);
  drawer.hidden  = false;
  overlay.hidden = false;
  drawer.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => drawer.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  const drawer  = document.getElementById('cm-preview-drawer');
  const overlay = document.getElementById('cm-preview-overlay');
  drawer.classList.remove('open');
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => { drawer.hidden = true; }, 300);
}

function buildPreviewHtml(data) {
  const title = escHtml(data.title || 'Untitled');
  const body  = escHtml(data.body || data.description || data.summary || '');
  const type  = escHtml(data.content_type || data.category || contentType);
  const src   = data.source_url
    ? `<p class="cm-preview-source"><a href="${escHtml(data.source_url)}" target="_blank" rel="noopener">Source: ${escHtml(data.source_label || data.source_url)}</a></p>`
    : '';
  const imgHtml = data.image
    ? `<img src="${escHtml(data.image)}" alt="" class="cm-preview-image" />`
    : '';
  const medical = data.is_medical || data.category === 'medical'
    ? `<div class="cm-preview-disclaimer">⚕ Always speak to a qualified healthcare professional before making any changes to your treatment or lifestyle.</div>`
    : '';

  return `
    <div class="cm-preview-entry">
      ${imgHtml}
      <div class="cm-preview-meta">
        <span class="cm-type-badge" style="--dest-color:${getDestColor()};--dest-bg:var(--color-brand-50)">${type}</span>
        ${data.status ? `<span class="cm-status-badge cm-status-${escHtml(data.status)}">${data.status}</span>` : ''}
      </div>
      <h2 class="cm-preview-entry-title">${title}</h2>
      ${data.summary ? `<p class="cm-preview-summary">${escHtml(data.summary)}</p>` : ''}
      ${medical}
      ${body ? `<div class="cm-preview-body-text">${body.split('\n').filter(Boolean).map((p) => `<p>${p}</p>`).join('')}</div>` : ''}
      ${src}
    </div>
  `;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getDestColor() {
  const colorMap = {
    resource:     'var(--color-brand-400)',
    ngo:          '#0369a1',
    clinic:       '#15803d',
  };
  return colorMap[contentType] || 'var(--color-brand-400)';
}

function showFeedback(el, message, type) {
  if (!el) return;
  el.hidden    = false;
  el.textContent = message;
  el.className = `cm-save-feedback cm-feedback-${type}`;
  setTimeout(() => { el.hidden = true; }, 5000);
}

function showError(message) {
  document.getElementById('cm-editor-root').hidden = true;
  const err = document.getElementById('cm-editor-error');
  err.hidden = false;
  err.querySelector('.mod-error-message').textContent = message;
}

function getStoredAdmin() {
  try { return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY)) || {}; }
  catch { return {}; }
}

function bindLogout() {
  document.querySelectorAll('[data-admin-logout]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await api.post('/api/v1/auth/logout'); } catch (_) {}
      sessionStorage.removeItem(ADMIN_USER_KEY);
      window.location.assign('/admin/login');
    });
  });
}

function escHtml(v = '') {
  return String(v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

init();