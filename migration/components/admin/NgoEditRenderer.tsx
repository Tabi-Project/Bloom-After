"use client";

import { useState } from "react";
import { Ngo } from "@/types/ngo";

interface NgoEditRendererProps {
  ngo: Ngo;
  isActioning: boolean;
  onSubmit: (
    status: "approved" | "rejected" | undefined,
    fields: { mission: string; phone: string; email: string; moderatorNote: string }
  ) => Promise<void>;
}

export default function NgoEditRenderer({ ngo, isActioning, onSubmit }: NgoEditRendererProps) {
  const [mission, setMission] = useState(ngo.mission || "");
  const [phone, setPhone] = useState(ngo.contact?.phone || "");
  const [email, setEmail] = useState(ngo.contact?.email || "");
  const [moderatorNote, setModeratorNote] = useState(ngo.moderatorNote || "");
  const [validationError, setValidationError] = useState<string | null>(null);

  const submittedDate = ngo.createdAt
    ? new Date(ngo.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const handleAction = (status: "approved" | "rejected" | undefined) => {
    setValidationError(null);

    if (status === "approved" && (!mission.trim() || !phone.trim() || !email.trim())) {
      setValidationError("Description, phone, and email are required before approval.");
      return;
    }

    onSubmit(status, { mission: mission.trim(), phone: phone.trim(), email: email.trim(), moderatorNote: moderatorNote.trim() });
  };

  return (
    <div className="story-edit-layout">
      <div className="story-edit-preview">
        <div className="story-edit-preview-header">
          <div>
            <h1 className="story-edit-name">{ngo.name || "Untitled NGO"}</h1>
            <div className="story-edit-meta">
              {submittedDate && <span>Submitted {submittedDate}</span>}
              {ngo.geographic_coverage && <span>{ngo.geographic_coverage}</span>}
            </div>
          </div>
          <span className={`mod-status-badge mod-status-${ngo.status}`}>{ngo.status}</span>
        </div>

        {ngo.cover_image && (
          <figure className="story-edit-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ngo.cover_image} alt="NGO cover" className="story-edit-image" />
          </figure>
        )}

        <div className="story-edit-body mod-rich-text">
          <p>
            <strong>Submitted name:</strong> {ngo.name || "N/A"}
          </p>
          <p>
            <strong>Submitted website:</strong>{" "}
            {ngo.website ? (
              <a href={ngo.website} target="_blank" rel="noopener noreferrer">
                {ngo.website}
              </a>
            ) : (
              "N/A"
            )}
          </p>
          <p>
            <strong>Submitted mission:</strong> {ngo.mission || "Not provided"}
          </p>
        </div>
      </div>

      <aside className="story-edit-panel" aria-label="NGO moderation actions">
        <h2 className="story-edit-panel-title">Moderation</h2>

        <div className="story-edit-field">
          <label htmlFor="ngo-mission" className="story-edit-label">
            NGO description
            <span className="story-edit-label-hint">Required before approval</span>
          </label>
          <textarea
            id="ngo-mission"
            className="story-edit-textarea"
            rows={4}
            placeholder="Add verified NGO description..."
            value={mission}
            onChange={(e) => setMission(e.target.value)}
          />
        </div>

        <div className="story-edit-field">
          <label htmlFor="ngo-phone" className="story-edit-label">
            Contact phone
            <span className="story-edit-label-hint">Required before approval</span>
          </label>
          <input
            type="text"
            id="ngo-phone"
            className="story-edit-input"
            placeholder="+234 ..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="story-edit-field">
          <label htmlFor="ngo-email" className="story-edit-label">
            Contact email
            <span className="story-edit-label-hint">Required before approval and used for notification</span>
          </label>
          <input
            type="email"
            id="ngo-email"
            className="story-edit-input"
            placeholder="contact@example.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="story-edit-field">
          <label htmlFor="ngo-note" className="story-edit-label">
            Moderator note
            <span className="story-edit-label-hint">Internal only</span>
          </label>
          <textarea
            id="ngo-note"
            className="story-edit-textarea"
            rows={3}
            placeholder="Add moderator note..."
            value={moderatorNote}
            onChange={(e) => setModeratorNote(e.target.value)}
          />
        </div>

        {validationError && (
          <div className="mod-action-feedback mod-feedback-error" role="alert">
            {validationError}
          </div>
        )}

        <div className="story-edit-actions">
          {ngo.status !== "approved" && (
            <button className="btn btn-primary mod-btn-approve" type="button" disabled={isActioning} onClick={() => handleAction("approved")}>
              Complete &amp; Approve
            </button>
          )}
          {ngo.status !== "rejected" && (
            <button className="btn mod-btn-reject" type="button" disabled={isActioning} onClick={() => handleAction("rejected")}>
              Reject
            </button>
          )}
          <button className="btn mod-btn-save-note" type="button" disabled={isActioning} onClick={() => handleAction(undefined)}>
            Save changes
          </button>
        </div>
      </aside>
    </div>
  );
}
