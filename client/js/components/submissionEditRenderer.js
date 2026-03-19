/**
 * submissionEditRenderer.js
 * Shared renderer for clinic, specialist, and media edit pages.
 * Each page's JS calls renderSubmissionEdit() with its own type config.
 */

const escHtml = (v = '') =>
  String(v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

// ── Destination options per type ──────────────────────────────────────────────
// Where the admin can publish the approved item

const DESTINATIONS = {
  clinic: [
    { value: '',           label: 'Choose a library…'   },
    { value: 'clinics',    label: 'Clinics Directory'    },
    { value: 'resources',  label: 'Resources Hub'        },
  ],
  specialist: [
    { value: '',             label: 'Choose a library…'      },
    { value: 'specialists',  label: 'Specialists Directory'   },
    { value: 'resources',    label: 'Resources Hub'           },
  ],
  media: [
    { value: '',           label: 'Choose a library…'   },
    { value: 'media',      label: 'Media Library'        },
    { value: 'resources',  label: 'Resources Hub'        },
    { value: 'articles',   label: 'Articles'             },
  ],
  request: [
    { value: '',           label: 'No library — requests are handled directly' },
  ],
};

// ── Main renderer ─────────────────────────────────────────────────────────────

/**
 * renderSubmissionEdit
 *
 * @param {Object} item   — the submission data
 * @param {string} type   — 'clinic' | 'specialist' | 'media' | 'request'
 * @returns {string}      — HTML string
 */
export function renderSubmissionEdit(item, type) {
  const id      = item._id || item.id;
  const status  = item.status || 'pending';
  const date    = item.submittedAt
    ? new Date(item.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const destinations = DESTINATIONS[type] || DESTINATIONS.request;
  const destOptions  = destinations.map((d) =>
    `<option value="${escHtml(d.value)}">${escHtml(d.label)}</option>`
  ).join('');

  // ── Type-specific preview fields ────────────────────────────────────────────

  let typeFields = '';

  if (type === 'clinic') {
    typeFields = `
      ${item.location ? `
        <div class="sub-edit-detail-row">
          <dt>Location</dt>
          <dd>${escHtml(item.location)}</dd>
        </div>` : ''}
      ${item.link ? `
        <div class="sub-edit-detail-row">
          <dt>Website</dt>
          <dd><a href="${escHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="mod-email-link">${escHtml(item.link)}</a></dd>
        </div>` : ''}
    `;
  }

  if (type === 'specialist') {
    typeFields = `
      ${item.speciality ? `
        <div class="sub-edit-detail-row">
          <dt>Speciality</dt>
          <dd>${escHtml(item.speciality)}</dd>
        </div>` : ''}
      ${item.location ? `
        <div class="sub-edit-detail-row">
          <dt>Location</dt>
          <dd>${escHtml(item.location)}</dd>
        </div>` : ''}
      ${item.consultationTypes ? `
        <div class="sub-edit-detail-row">
          <dt>Consultation</dt>
          <dd>${escHtml(item.consultationTypes)}</dd>
        </div>` : ''}
    `;
  }

  if (type === 'media') {
    typeFields = `
      ${item.mediaType ? `
        <div class="sub-edit-detail-row">
          <dt>Media type</dt>
          <dd>${escHtml(item.mediaType)}</dd>
        </div>` : ''}
      ${item.link ? `
        <div class="sub-edit-detail-row">
          <dt>Link</dt>
          <dd><a href="${escHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="mod-email-link">${escHtml(item.link)}</a></dd>
        </div>` : ''}
    `;
  }

  // ── Image ────────────────────────────────────────────────────────────────────

  const imageHtml = item.image_url
    ? `<figure class="sub-edit-image-wrap">
        <img src="${escHtml(item.image_url)}" alt="${escHtml(item.title || '')}" class="sub-edit-image" />
       </figure>`
    : '';

  // ── Full render ──────────────────────────────────────────────────────────────

  return `
    <div class="story-edit-layout">

      <!-- Left: submission preview -->
      <div class="story-edit-preview">

        <div class="story-edit-preview-header">
          <div>
            <h1 class="story-edit-name">${escHtml(item.title || 'Untitled')}</h1>
            <div class="story-edit-meta">
              ${date ? `<span>${date}</span>` : ''}
              ${item.email ? `<span>${escHtml(item.email)}</span>` : ''}
            </div>
          </div>
          <span class="mod-status-badge mod-status-${escHtml(status)}" id="submission-status-badge">
            ${escHtml(status)}
          </span>
        </div>

        ${imageHtml}

        <p class="sub-edit-description">${escHtml(item.description || '')}</p>

        <!-- Submission details card -->
        <div class="story-edit-submitter-card">
          <h3 class="story-edit-section-label">Submission Details</h3>
          <dl class="sub-edit-details">
            ${item.email ? `
              <div class="sub-edit-detail-row">
                <dt>Contact email</dt>
                <dd><a href="mailto:${escHtml(item.email)}" class="mod-email-link">${escHtml(item.email)}</a></dd>
              </div>` : ''}
            ${typeFields}
            <div class="sub-edit-detail-row">
              <dt>Submitted</dt>
              <dd>${date || '—'}</dd>
            </div>
          </dl>
        </div>

      </div>

      <!-- Right: moderation panel -->
      <aside class="story-edit-panel" aria-label="Moderation actions">

        <h2 class="story-edit-panel-title">Moderation</h2>

        <!-- Moderator note -->
        <div class="story-edit-field">
          <label for="mod-note" class="story-edit-label">
            Moderator note
            <span class="story-edit-label-hint">Internal only — not sent to submitter</span>
          </label>
          <textarea id="mod-note" class="story-edit-textarea" rows="3"
            placeholder="Add an internal note…">${escHtml(item.moderatorNote || '')}</textarea>
        </div>

        <!-- Notification email if not provided -->
        ${!item.email ? `
          <div class="story-edit-field">
            <label for="notif-email" class="story-edit-label">
              Notification email
              <span class="story-edit-label-hint">Optional — to notify the submitter</span>
            </label>
            <input type="email" id="notif-email" class="story-edit-input" placeholder="submitter@email.com" />
          </div>
        ` : ''}

        <!-- Publish destination (shown after approve) -->
        <div class="story-edit-field" id="destination-field" ${status !== 'approved' ? '' : ''}>
          <label for="publish-destination" class="story-edit-label">
            Publish to
            <span class="story-edit-label-hint">Choose where this will appear after approval</span>
          </label>
          <select id="publish-destination" class="story-edit-input sub-edit-select">
            ${destOptions}
          </select>
        </div>

        <!-- Rejection message -->
        <div class="story-edit-field" id="reject-message-field" hidden>
          <label for="reject-message" class="story-edit-label">
            Message to submitter
            <span class="story-edit-label-hint">Sent by email if an address is available</span>
          </label>
          <textarea id="reject-message" class="story-edit-textarea" rows="3"
            placeholder="Thank you for your submission. Unfortunately…"></textarea>
        </div>

        <!-- Email preview -->
        <div class="story-edit-email-preview" id="email-preview" hidden>
          <div class="email-preview-label">Email preview</div>
          <div class="email-preview-body" id="email-preview-body"></div>
        </div>

        <!-- Feedback -->
        <div id="mod-action-feedback" class="mod-action-feedback" hidden role="alert"></div>

        <!-- Actions -->
        <div class="story-edit-actions" id="mod-action-buttons">
          ${status !== 'approved' ? `
            <button class="btn btn-primary mod-btn-approve" id="btn-approve" data-id="${escHtml(id)}" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Approve &amp; Publish
            </button>` : ''}
          ${status !== 'rejected' ? `
            <button class="btn mod-btn-reject" id="btn-reject" data-id="${escHtml(id)}" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Reject
            </button>` : ''}
          <button class="btn mod-btn-save-note" id="btn-save-note" data-id="${escHtml(id)}" type="button">
            Save note
          </button>
        </div>

        ${status !== 'pending' ? `
          <p class="story-edit-already-actioned">
            This submission has already been <strong>${escHtml(status)}</strong>.
            You can still update the moderator note or publish destination.
          </p>` : ''}

      </aside>
    </div>
  `;
}

export { escHtml };