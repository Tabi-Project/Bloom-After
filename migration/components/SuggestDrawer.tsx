"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Pencil, X, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import "../styles/suggest-drawer.css";

const SUGGESTION_TYPES = [
  { id: "clinic", label: "Clinic recommendation" },
  { id: "specialist", label: "Specialist onboarding" },
  { id: "media", label: "Resource suggestion" },
  { id: "request", label: "Other request" },
];

export default function SuggestDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [typeError, setTypeError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [formError, setFormError] = useState("");

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // One-time nudge tooltip: appears after 2.5s, hides after 4s, per session.
  useEffect(() => {
    if (sessionStorage.getItem("suggest_nudge_seen")) return;
    const showTimer = setTimeout(() => {
      setShowNudge(true);
      const hideTimer = setTimeout(() => {
        setShowNudge(false);
        sessionStorage.setItem("suggest_nudge_seen", "1");
      }, 4000);
      return () => clearTimeout(hideTimer);
    }, 2500);
    return () => clearTimeout(showTimer);
  }, []);

  const dismissNudge = () => {
    setShowNudge(false);
    sessionStorage.setItem("suggest_nudge_seen", "1");
  };

  // Lock body scroll and wire Escape-to-close while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const openDrawer = () => {
    dismissNudge();
    setIsOpen(true);
  };

  const selectType = (type: string) => {
    setSelectedType(type);
    setTypeError(false);
  };

  const resetForm = () => {
    formRef.current?.reset();
    setSelectedType("");
    setSubmitted(false);
    setFormError("");
    setSubmitting(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = contentRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim() ?? "";

    let valid = true;
    if (!selectedType) {
      setTypeError(true);
      valid = false;
    }
    if (!content) {
      setContentError(true);
      valid = false;
    }
    if (!valid) return;

    setSubmitting(true);
    setFormError("");

    try {
      await api.post("/api/v1/suggestions", {
        type: selectedType,
        content,
        email: email || undefined,
      });
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setFormError(message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="suggest-fab-wrap" id="suggest-fab-wrap" aria-live="polite">
        <div className="suggest-fab-pulse" aria-hidden="true" />
        <button
          className="suggest-fab"
          aria-label="Make a suggestion"
          aria-expanded={isOpen}
          aria-controls="suggest-drawer"
          type="button"
          onClick={openDrawer}
          onMouseEnter={dismissNudge}
          onFocus={dismissNudge}
        >
          <Pencil className="suggest-fab-icon" size={20} aria-hidden="true" />
          <span className="suggest-fab-label">Make a suggestion</span>
        </button>

        <div
          className={`suggest-nudge ${showNudge ? "visible" : ""}`}
          role="tooltip"
          aria-hidden={!showNudge}
        >
          <span>Know a clinic, specialist, or resource that could help?</span>
          <span className="suggest-nudge-cta">Tell us &rarr;</span>
        </div>
      </div>

      <div
        className={`suggest-drawer-overlay ${isOpen ? "visible" : ""}`}
        aria-hidden={!isOpen}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`suggest-drawer ${isOpen ? "open" : ""}`}
        id="suggest-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Make a suggestion"
        aria-hidden={!isOpen}
        hidden={!isOpen}
      >
        <div className="suggest-drawer-inner">
          <div className="suggest-drawer-header">
            <div>
              <h2 className="suggest-drawer-title">Make a suggestion</h2>
              <p className="suggest-drawer-subtitle">
                Help us grow our community resources. No account needed.
              </p>
            </div>
            <button
              className="suggest-drawer-close"
              type="button"
              aria-label="Close suggestion drawer"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {submitted ? (
            <div className="suggest-success" style={{ display: "flex" }}>
              <div className="suggest-success-icon" aria-hidden="true">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="suggest-success-title">Thank you!</h3>
              <p className="suggest-success-body">
                Your suggestion has been received. Our team will review it and
                add it to the platform if it&apos;s a good fit.
              </p>
              <button
                className="suggest-success-btn btn btn-primary"
                type="button"
                onClick={resetForm}
              >
                Suggest another
              </button>
            </div>
          ) : (
            <form
              className="suggest-form"
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="suggest-field">
                <label className="suggest-label">
                  Category
                  <span className="suggest-label-hint">
                    Choose the one that best fits your suggestion
                  </span>
                </label>
                <div
                  className="suggest-type-pills"
                  role="group"
                  aria-label="Suggestion category"
                >
                  {SUGGESTION_TYPES.map((t) => {
                    const active = selectedType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`suggest-type-pill ${active ? "active" : ""}`}
                        aria-pressed={active}
                        onClick={() => selectType(t.id)}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                <p className="suggest-field-error" hidden={!typeError}>
                  Please choose a category.
                </p>
              </div>

              <div className="suggest-field">
                <label className="suggest-label" htmlFor="suggest-content">
                  Tell us about it
                  <span className="suggest-label-hint">
                    Name, location, link, or why you&apos;d recommend it
                  </span>
                </label>
                <textarea
                  id="suggest-content"
                  name="content"
                  className="suggest-textarea"
                  rows={4}
                  ref={contentRef}
                  onInput={() => setContentError(false)}
                  placeholder="e.g. Grace Medical Centre in Lagos — great postpartum support, very empathetic staff."
                />
                <p className="suggest-field-error" hidden={!contentError}>
                  Please add a description.
                </p>
              </div>

              <div className="suggest-field">
                <label className="suggest-label" htmlFor="suggest-email">
                  Your email
                  <span className="suggest-label-hint">
                    Optional — we&apos;ll let you know when it&apos;s added
                  </span>
                </label>
                <input
                  type="email"
                  id="suggest-email"
                  name="email"
                  className="suggest-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  ref={emailRef}
                />
              </div>

              <p
                className="suggest-form-error"
                hidden={!formError}
                role="alert"
              >
                {formError || "Something went wrong. Please try again."}
              </p>

              <button
                type="submit"
                className="btn btn-primary suggest-submit"
                disabled={submitting}
              >
                {submitting ? "Sending…" : "Send suggestion"}
              </button>

              <p className="suggest-privacy-note">
                Your suggestion goes to our moderation team only. It will never
                be published without review.
              </p>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
