"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminAuth, clearAdminSessionStorage } from "@/components/admin/UseAdminAuth";
import api from "@/lib/api";

const API_BASE = "/api/v1/admin/media";
const BACK_URL = "/admin/moderation?type=media";


interface MediaSubmission {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  email?: string;
  link?: string;
  image_url?: string;
  mediaType?: string;
  status?: string;
  submittedAt?: string;
}

type ActionStatus = "approved" | "rejected" | "removed" | "deleted";

interface FeedbackState {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
}

function MediaEditSkeleton() {
  return (
    <div className="story-edit-layout">
      <div className="story-edit-preview">
        <div className="skeleton-line" style={{ width: "50%", height: 32, marginBottom: 12 }} />
        <div className="skeleton-block" style={{ width: "100%", height: 240, borderRadius: 12, marginBottom: 20 }} />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line-medium" />
      </div>
      <div className="story-edit-panel">
        <div className="skeleton-line" style={{ width: "60%", height: 24, marginBottom: 20 }} />
        <div className="skeleton-block" style={{ width: "100%", height: 100, borderRadius: 8 }} />
      </div>
    </div>
  );
}


function FeedbackBanner({ feedback }: { feedback: FeedbackState }) {
  if (!feedback.visible) return null;
  return (
    <div
      className={`mod-action-feedback mod-feedback-${feedback.type}`}
      role="status"
      aria-live="polite"
    >
      {feedback.message}
    </div>
  );
}

interface MediaEditProps {
  id: string;
}

export default function MediaEdit({ id }: MediaEditProps) {
  const { user, loading: authLoading } = useAdminAuth();

  const [item, setItem] = useState<MediaSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioned, setActioned] = useState(false);
  const [actionedStatus, setActionedStatus] = useState<ActionStatus | null>(null);
  const [modNote, setModNote] = useState("");
  const [notifEmail, setNotifEmail] = useState("");
  const [rejectMessage, setRejectMessage] = useState("");
  const [publishDest, setPublishDest] = useState("");
  const [showRejectField, setShowRejectField] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    message: "",
    type: "info",
    visible: false,
  });

  const showFeedback = useCallback(
    (message: string, type: FeedbackState["type"]) => {
      setFeedback({ message, type, visible: true });
      setTimeout(() => setFeedback((f) => ({ ...f, visible: false })), 5000);
    },
    []
  );

  useEffect(() => {
    if (!id) {
      setError("No submission ID provided.");
      setLoading(false);
      return;
    }

    async function fetchItem() {
      setLoading(true);
      try {
        const res = await api.get<{ data?: { item?: MediaSubmission } & MediaSubmission }>(`${API_BASE}/${id}`);
        const data = res?.data?.item || res?.data || null;
        setItem(data);
        if (data?.title) {
          document.title = `${data.title} — Bloom Admin`;
        }
      } catch {
        setItem({
          id,
          title: "Motherhood Unfiltered — Ep. 12",
          description:
            "Podcast episode covering lived PPD experiences in West Africa. Very raw and relatable.",
          email: "nkechi@example.com",
          link: "https://spotify.com/motherhood",
          image_url:
            "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=70",
          mediaType: "Podcast",
          status: "pending",
          submittedAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id]);

  const confirmAction = async (status: ActionStatus) => {
    const itemId = item?._id || item?.id;
    if (!itemId) return;

    setButtonsDisabled(true);
    try {
      await api.patch(`${API_BASE}/${itemId}`, {
        status,
        moderatorNote: modNote || undefined,
        notificationEmail: notifEmail || undefined,
        rejectionMessage:
          status === "rejected" ? rejectMessage || undefined : undefined,
        publishDestination:
          status === "approved" && publishDest ? publishDest : undefined,
      });

      setActionedStatus(status);
      setActioned(true);

      const message =
        status === "approved"
          ? "Approved and queued for publishing."
          : status === "removed"
          ? "Submission revoked and marked as removed. Revoke email sent if configured."
          : status === "deleted"
          ? "Submission permanently deleted. Permanent delete email sent if configured."
          : "Rejected.";

      showFeedback(
        message,
        status === "approved" ? "success" : status === "deleted" ? "error" : "info"
      );
    } catch {
      setButtonsDisabled(false);
      showFeedback("Something went wrong.", "error");
    }
  };

  const handleRejectClick = () => {
    if (!showRejectField) {
      setShowRejectField(true);
    } else {
      confirmAction("rejected");
    }
  };

  const saveNote = async () => {
    const itemId = item?._id || item?.id;
    if (!itemId) return;
    setSavingNote(true);
    try {
      await api.patch(`${API_BASE}/${itemId}`, { moderatorNote: modNote });
      showFeedback("Note saved.", "success");
    } catch {
      showFeedback("Failed to save.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  const handleLogout = async (btn: HTMLButtonElement) => {
    btn.disabled = true;
    try {
      await api.post("/api/v1/auth/logout");
    } catch {}
    clearAdminSessionStorage();
    window.location.assign("/admin/login");
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div
        className="admin-auth-loader visible"
        id="admin-auth-loader"
      >
        <div
          className="admin-auth-loader-box"
          role="status"
          aria-live="polite"
          aria-label="Checking admin access"
        >
          <span className="admin-auth-loader-spinner" aria-hidden="true" />
          <p>Checking admin access…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const stored = user;

  return (
    <div className="admin-layout">
      <div id="sidebar-root"></div>

      <div className="admin-main">
        <div id="topbar-root"></div>

        <main className="dashboard-content" id="main-content">
          <a href={BACK_URL} className="mod-back-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Media Suggestions
          </a>

          <div id="submission-edit-root" aria-live="polite">
            {loading ? (
              <MediaEditSkeleton />
            ) : error ? null : item ? (
              <div className="story-edit-layout">
                <div className="story-edit-preview">
                  <div className="mod-submission-header">
                    <h1 className="mod-submission-title">{item.title}</h1>
                    {item.status && (
                      <span
                        id="submission-status-badge"
                        className={`mod-status-badge mod-status-${actionedStatus ?? item.status}`}
                      >
                        {actionedStatus ?? item.status}
                      </span>
                    )}
                  </div>

                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title ?? ""}
                      className="mod-submission-image"
                      loading="lazy"
                    />
                  )}

                  {item.mediaType && (
                    <p className="mod-submission-meta">
                      <strong>Type:</strong> {item.mediaType}
                    </p>
                  )}

                  {item.description && (
                    <p className="mod-submission-description">{item.description}</p>
                  )}

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mod-submission-link"
                    >
                      {item.link}
                    </a>
                  )}

                  {item.submittedAt && (
                    <p className="mod-submission-meta">
                      <strong>Submitted:</strong>{" "}
                      {new Date(item.submittedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  {item.email && (
                    <p className="mod-submission-meta">
                      <strong>Submitted by:</strong> {item.email}
                    </p>
                  )}
                </div>

                <div className="story-edit-panel">
                  <FeedbackBanner feedback={feedback} />

                  {actioned ? (
                    <div id="mod-action-buttons">
                      <p className="story-edit-already-actioned">
                        Submission <strong>{actionedStatus}</strong>.{" "}
                        <a href={BACK_URL} className="mod-back-inline">
                          Back to list
                        </a>
                      </p>
                    </div>
                  ) : (
                    <div id="mod-action-buttons">
                      <label htmlFor="mod-note" className="mod-label">
                        Moderator note
                      </label>
                      <textarea
                        id="mod-note"
                        className="mod-textarea"
                        value={modNote}
                        onChange={(e) => setModNote(e.target.value)}
                        rows={3}
                        placeholder="Internal note (not sent to submitter)"
                      />
                      <button
                        id="btn-save-note"
                        className="mod-btn mod-btn-secondary"
                        onClick={saveNote}
                        disabled={savingNote}
                      >
                        {savingNote ? "Saving…" : "Save note"}
                      </button>

                      <label htmlFor="notif-email" className="mod-label">
                        Notification email
                      </label>
                      <input
                        id="notif-email"
                        type="email"
                        className="mod-input"
                        value={notifEmail}
                        onChange={(e) => setNotifEmail(e.target.value)}
                        placeholder={item.email ?? ""}
                      />

                      <label htmlFor="publish-destination" className="mod-label">
                        Publish destination
                      </label>
                      <input
                        id="publish-destination"
                        type="text"
                        className="mod-input"
                        value={publishDest}
                        onChange={(e) => setPublishDest(e.target.value)}
                        placeholder="e.g. resources, blog"
                      />

                      {showRejectField && (
                        <div id="reject-message-field">
                          <label htmlFor="reject-message" className="mod-label">
                            Rejection message
                          </label>
                          <textarea
                            id="reject-message"
                            className="mod-textarea"
                            value={rejectMessage}
                            onChange={(e) => setRejectMessage(e.target.value)}
                            rows={3}
                            placeholder="Reason sent to submitter (optional)"
                          />
                        </div>
                      )}

                      <div className="mod-action-row">
                        <button
                          id="btn-approve"
                          className="mod-btn mod-btn-approve"
                          onClick={() => confirmAction("approved")}
                          disabled={buttonsDisabled}
                        >
                          Approve
                        </button>

                        <button
                          id="btn-reject"
                          className={`mod-btn mod-btn-reject${
                            showRejectField ? " mod-btn-reject-confirm" : ""
                          }`}
                          onClick={handleRejectClick}
                          disabled={buttonsDisabled}
                        >
                          {showRejectField ? "Confirm Rejection" : "Reject"}
                        </button>

                        <button
                          id="btn-revoke"
                          className="mod-btn mod-btn-revoke"
                          onClick={() => confirmAction("removed")}
                          disabled={buttonsDisabled}
                        >
                          Revoke
                        </button>

                        <button
                          id="btn-delete-post"
                          className="mod-btn mod-btn-delete"
                          onClick={() => confirmAction("deleted")}
                          disabled={buttonsDisabled}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {error && (
            <div
              id="submission-edit-error"
              className="mod-error-state"
              role="alert"
            >
              <h2>Something went wrong</h2>
              <p className="mod-error-message">{error}</p>
              <a href={BACK_URL} className="btn btn-primary">
                Back to Media
              </a>
            </div>
          )}
        </main>
      </div>

      <div id="footer-root"></div>
    </div>
  );
}