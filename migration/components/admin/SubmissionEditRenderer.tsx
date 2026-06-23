"use client";

import { useState } from 'react';
import { AdminSubmissionItem } from '@/types/admin';
import { Check, X } from 'lucide-react';
import Image from 'next/image';

const DESTINATIONS = {
  clinic: [
    { value: '', label: 'Choose a library…' },
    { value: 'clinics', label: 'Clinics Directory' },
    { value: 'resources', label: 'Resources Hub' },
  ],
  specialist: [
    { value: '', label: 'Choose a library…' },
    { value: 'specialists', label: 'Specialists Directory' },
    { value: 'resources', label: 'Resources Hub' },
  ],
  media: [
    { value: '', label: 'Choose a library…' },
    { value: 'media', label: 'Media Library' },
    { value: 'resources', label: 'Resources Hub' },
    { value: 'articles', label: 'Articles' },
  ],
  request: [
    { value: '', label: 'No library — requests are handled directly' },
  ],
};

interface RendererProps {
  item: AdminSubmissionItem;
  type: 'clinic' | 'specialist' | 'media' | 'request';
  isActioning: boolean;
  onAction: (
    status: AdminSubmissionItem['status'], 
    payload: { moderatorNote?: string; notificationEmail?: string; rejectionMessage?: string; publishDestination?: string }
  ) => Promise<void>;
  onSaveNote: (note: string) => Promise<void>;
}

export default function SubmissionEditRenderer({ item, type, isActioning, onAction, onSaveNote }: RendererProps) {
  const contactEmail = item.contact?.email || '';
  
  const [modNote, setModNote] = useState(item.moderatorNote || '');
  const [rejectMessage, setRejectMessage] = useState('');
  const [notificationEmail, setNotificationEmail] = useState(contactEmail);
  const [publishDestination, setPublishDestination] = useState('');
  const [showRejectReason, setShowRejectReason] = useState(false);

  const isAccepted = item.status === 'approved';
  const isRejected = item.status === 'rejected';
  
  const date = item.updatedAt 
    ? new Date(item.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const destinations = DESTINATIONS[type] || DESTINATIONS.request;

  const mediaItem = item as AdminSubmissionItem & { mediaType?: string; link?: string };

  const handleActionClick = (status: AdminSubmissionItem['status']) => {
    if (status === 'rejected' && !showRejectReason) {
      setShowRejectReason(true);
      return;
    }

    onAction(status, {
      moderatorNote: modNote.trim(),
      notificationEmail: notificationEmail.trim(),
      rejectionMessage: status === 'rejected' ? rejectMessage.trim() : undefined,
      publishDestination: status === 'approved' ? publishDestination : undefined
    }).then(() => setShowRejectReason(false));
  };

  return (
    <div className="story-edit-layout">
      {/* Submission Preview */}
      <div className="story-edit-preview">
        <div className="story-edit-preview-header">
          <div>
            <h1 className="story-edit-name">{item.name || 'Untitled'}</h1>
            <div className="story-edit-meta">
              {date && <span>{date}</span>}
              {contactEmail && <span>{contactEmail}</span>}
            </div>
          </div>
          <span className={`mod-status-badge mod-status-${item.status}`} id="submission-status-badge">
            {item.status}
          </span>
        </div>

        {item.coverImage && (
          <figure className="sub-edit-image-wrap">
            <Image 
              src={item.coverImage} 
              alt={item.name || 'Submission image'} 
              width={400} 
              height={300} 
              className="sub-edit-image"
              unoptimized
            />
          </figure>
        )}

        <p className="sub-edit-description">{item.description}</p>

        <div className="story-edit-submitter-card">
          <h3 className="story-edit-section-label">Submission Details</h3>
          <dl className="sub-edit-details">
            {contactEmail && (
              <div className="sub-edit-detail-row">
                <dt>Contact email</dt>
                <dd><a href={`mailto:${contactEmail}`} className="mod-email-link">{contactEmail}</a></dd>
              </div>
            )}
            
            {/* Conditional Type Fields */}
            {type === 'clinic' && (
              <>
                {item.city && item.state && (
                  <div className="sub-edit-detail-row">
                    <dt>Location</dt>
                    <dd>{item.city}, {item.state}</dd>
                  </div>
                )}
                {item.website && (
                  <div className="sub-edit-detail-row">
                    <dt>Website</dt>
                    <dd>
                      <a href={item.website} target="_blank" rel="noopener noreferrer" className="mod-email-link">
                        {item.website}
                      </a>
                    </dd>
                  </div>
                )}
              </>
            )}
            {type === 'specialist' && (
              <>
                {item.focusAreas && item.focusAreas.length > 0 && (
                  <div className="sub-edit-detail-row"><dt>Speciality</dt><dd>{item.focusAreas.join(', ')}</dd></div>
                )}
                {(item.city || item.state) && (
                  <div className="sub-edit-detail-row"><dt>Location</dt><dd>{[item.city, item.state].filter(Boolean).join(', ')}</dd></div>
                )}
                {item.consultationMode && (
                  <div className="sub-edit-detail-row"><dt>Consultation</dt><dd>{item.consultationMode}</dd></div>
                )}
              </>
            )}
            {type === 'media' && (
              <>
                {mediaItem.mediaType && <div className="sub-edit-detail-row"><dt>Media type</dt><dd>{mediaItem.mediaType}</dd></div>}
                {mediaItem.link && <div className="sub-edit-detail-row"><dt>Link</dt><dd><a href={mediaItem.link} target="_blank" rel="noopener noreferrer" className="mod-email-link">{mediaItem.link}</a></dd></div>}
              </>
            )}
            
            <div className="sub-edit-detail-row">
              <dt>Submitted</dt>
              <dd>{date || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Moderation Panel */}
      <aside className="story-edit-panel" aria-label="Moderation actions">
        <h2 className="story-edit-panel-title">Moderation</h2>

        <div className="story-edit-field">
          <label htmlFor="mod-note" className="story-edit-label">
            Moderator note
            <span className="story-edit-label-hint">Internal only — not sent to submitter</span>
          </label>
          <textarea 
            id="mod-note" 
            className="story-edit-textarea" 
            rows={3}
            placeholder="Add an internal note…"
            value={modNote}
            onChange={(e) => setModNote(e.target.value)}
          />
        </div>

        {!contactEmail && (
          <div className="story-edit-field">
            <label htmlFor="notif-email" className="story-edit-label">
              Notification email
              <span className="story-edit-label-hint">Optional — to notify the submitter</span>
            </label>
            <input 
              type="email" 
              id="notif-email" 
              className="story-edit-input" 
              placeholder="submitter@email.com"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
            />
          </div>
        )}

        <div className="story-edit-field" id="destination-field">
          <label htmlFor="publish-destination" className="story-edit-label">
            Publish to
            <span className="story-edit-label-hint">Choose where this will appear after approval</span>
          </label>
          <select 
            id="publish-destination" 
            className="story-edit-input sub-edit-select"
            value={publishDestination}
            onChange={(e) => setPublishDestination(e.target.value)}
          >
            {destinations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        {showRejectReason && (
          <div className="story-edit-field" id="reject-message-field">
            <label htmlFor="reject-message" className="story-edit-label">
              Message to submitter
              <span className="story-edit-label-hint">Sent by email if an address is available</span>
            </label>
            <textarea 
              id="reject-message" 
              className="story-edit-textarea" 
              rows={3}
              placeholder="Thank you for your submission. Unfortunately…"
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
            />
          </div>
        )}

        <div className="story-edit-actions" id="mod-action-buttons">
          {!isAccepted && !isRejected && (
            <>
              <button 
                className="btn btn-primary mod-btn-approve" 
                onClick={() => handleActionClick('approved')}
                disabled={isActioning}
              >
                <Check size={16} style={{ marginRight: '4px' }}/> Approve &amp; Publish
              </button>
              <button 
                className={`btn ${showRejectReason ? 'mod-btn-reject-confirm' : 'mod-btn-reject'}`} 
                onClick={() => handleActionClick('rejected')}
                disabled={isActioning}
              >
                {showRejectReason ? 'Confirm Rejection' : <><X size={16} style={{ marginRight: '4px' }}/> Reject</>}
              </button>
            </>
          )}

          {isAccepted && (
            <>
              <button className="btn mod-btn-reject" onClick={() => handleActionClick('removed')} disabled={isActioning}>Revoke</button>
              <button className="btn mod-btn-reject" onClick={() => handleActionClick('deleted')} disabled={isActioning}>Delete post</button>
            </>
          )}

          {isRejected && (
            <button className="btn mod-btn-reject" onClick={() => handleActionClick('deleted')} disabled={isActioning}>Delete post</button>
          )}

          <button className="btn mod-btn-save-note" onClick={() => onSaveNote(modNote)} disabled={isActioning}>
            Save note
          </button>
        </div>

        {item.status !== 'pending' && (
          <p className="story-edit-already-actioned">
            This submission has already been <strong>{item.status}</strong>.
            You can still update the moderator note or publish destination.
          </p>
        )}
      </aside>
    </div>
  );
}