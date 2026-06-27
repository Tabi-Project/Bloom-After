"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Eye, Upload, X } from "lucide-react";
import {
  FIELD_DEFS,
  getDestination,
  getVisibleFields,
  isFieldRequired,
  toApiPayload,
} from "@/lib/content-management";
import {
  fetchContentEntry,
  saveContentEntry,
  uploadContentImage,
} from "@/lib/api/content-management-api";
import { AdminAuthError } from "@/lib/api/admin-dashboard-api";
import { ContentDestination, ContentFormData, ContentStatus, FieldDef } from "@/types/content-management";

type Feedback = { message: string; type: "success" | "error" } | null;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

// ── Image field — URL input + file upload + preview ───────────────────────────

function ImageField({
  fieldKey,
  def,
  value,
  required,
  onChange,
  onUploadingChange,
}: {
  fieldKey: string;
  def: FieldDef;
  value: string;
  required: boolean;
  onChange: (value: string) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const id = `field-${fieldKey}`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await readFileAsDataUrl(file);
    if (!dataUrl) return;

    setLocalPreview(dataUrl);
    setUploading(true);
    onUploadingChange(true);
    try {
      const uploadedUrl = await uploadContentImage(dataUrl);
      onChange(uploadedUrl);
    } catch {
      setLocalPreview("");
    } finally {
      setUploading(false);
      onUploadingChange(false);
    }
  };

  const previewSrc = localPreview || value;

  return (
    <div className="cm-field cm-field-image">
      <label className="cm-field-label" htmlFor={id}>
        {def.label}
        {required && (
          <span className="cm-required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="cm-image-row">
        <input
          type="url"
          id={id}
          name={fieldKey}
          className="cm-field-input"
          value={value}
          placeholder={def.placeholder}
          onChange={(e) => {
            setLocalPreview("");
            onChange(e.target.value);
          }}
        />
        <button type="button" className="btn cm-btn-upload" onClick={() => fileInputRef.current?.click()}>
          <Upload size={14} strokeWidth={2} />
          Upload
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {uploading && (
        <div className="cm-upload-status">
          <span className="cm-upload-spinner" aria-hidden="true"></span>
          <span className="cm-upload-text">Uploading image…</span>
        </div>
      )}
      {previewSrc && (
        <div className="cm-image-preview-wrap">
          {/* Admin-entered image URLs are arbitrary external hosts — next/image's domain allowlist doesn't fit here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc} className="cm-image-preview" alt="" />
          <button
            type="button"
            className="btn cm-btn-remove-image"
            onClick={() => {
              setLocalPreview("");
              onChange("");
            }}
          >
            Remove
          </button>
        </div>
      )}
      {def.hint && <p className="cm-field-hint">{def.hint}</p>}
    </div>
  );
}

// ── Generic field renderer ─────────────────────────────────────────────────────

function FieldRenderer({
  fieldKey,
  def,
  value,
  required,
  onChange,
}: {
  fieldKey: string;
  def: FieldDef;
  value: string | boolean;
  required: boolean;
  onChange: (value: string | boolean) => void;
}) {
  const id = `field-${fieldKey}`;
  const reqMark = required && (
    <span className="cm-required" aria-hidden="true">
      *
    </span>
  );
  const hint = def.hint && <p className="cm-field-hint">{def.hint}</p>;

  if (def.type === "textarea") {
    return (
      <div className="cm-field">
        <label className="cm-field-label" htmlFor={id}>
          {def.label}
          {reqMark}
        </label>
        <textarea
          id={id}
          name={fieldKey}
          className="cm-field-input cm-field-textarea"
          rows={def.rows || 4}
          placeholder={def.placeholder}
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
        />
        {hint}
      </div>
    );
  }

  if (def.type === "select") {
    return (
      <div className="cm-field">
        <label className="cm-field-label" htmlFor={id}>
          {def.label}
          {reqMark}
        </label>
        <select
          id={id}
          name={fieldKey}
          className="cm-field-input cm-field-select"
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
        >
          {(def.options || []).map((opt) => (
            <option value={opt.value} key={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint}
      </div>
    );
  }

  if (def.type === "checkbox") {
    return (
      <div className="cm-field cm-field-check">
        <label className="cm-checkbox-label">
          <input
            type="checkbox"
            id={id}
            name={fieldKey}
            className="cm-checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{def.label}</span>
        </label>
        {hint}
      </div>
    );
  }

  return (
    <div className="cm-field">
      <label className="cm-field-label" htmlFor={id}>
        {def.label}
        {reqMark}
      </label>
      <input
        type={def.type}
        id={id}
        name={fieldKey}
        className="cm-field-input"
        value={String(value || "")}
        placeholder={def.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint}
    </div>
  );
}

// ── Preview drawer content ────────────────────────────────────────────────────

function PreviewContent({ data, destColor }: { data: ContentFormData; destColor: string }) {
  const title = String(data.title || "Untitled");
  const body = String(data.body || data.description || data.summary || "");
  const typeLabel = String(data.content_type || data.category || data.type);
  const sourceUrl = data.source_url ? String(data.source_url) : "";
  const image = data.image ? String(data.image) : "";
  const isMedical = data.category === "medical";

  return (
    <div className="cm-preview-entry">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} className="cm-preview-image" alt="" />
      )}
      <div className="cm-preview-meta">
        <span className="cm-type-badge" style={{ "--dest-color": destColor, "--dest-bg": "var(--color-brand-50)" } as React.CSSProperties}>
          {typeLabel}
        </span>
        {data.status && <span className={`cm-status-badge cm-status-${data.status}`}>{data.status}</span>}
      </div>
      <h2 className="cm-preview-entry-title">{title}</h2>
      {data.summary && <p className="cm-preview-summary">{String(data.summary)}</p>}
      {isMedical && (
        <div className="cm-preview-disclaimer">
          ⚕ Always speak to a qualified healthcare professional before making any changes to your treatment or
          lifestyle.
        </div>
      )}
      {body && (
        <div className="cm-preview-body-text">
          {body
            .split("\n")
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      )}
      {sourceUrl && (
        <p className="cm-preview-source">
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
            Source: {sourceUrl}
          </a>
        </p>
      )}
    </div>
  );
}

// ── Main editor ────────────────────────────────────────────────────────────────

function ContentEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const typeParam = (searchParams.get("type") as ContentDestination) || "resource";
  const id = searchParams.get("id");
  const urlTitle = searchParams.get("_title");

  const dest = getDestination(typeParam);
  const type = dest.id;

  const [formData, setFormData] = useState<ContentFormData>(() => ({
    type,
    status: "draft",
    featured: false,
    ...(urlTitle ? { title: urlTitle.trim() } : {}),
  }));
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [previewMounted, setPreviewMounted] = useState(false);
  const [previewOpenClass, setPreviewOpenClass] = useState(false);

  // NGOs have no admin "create" endpoint — only public submission + review.
  const blockedNewNgo = type === "ngo" && !id;

  useEffect(() => {
    if (!id || blockedNewNgo) return;
    let cancelled = false;
    fetchContentEntry(type, id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setError("Entry not found or has been removed.");
          return;
        }
        setFormData(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof AdminAuthError) {
          router.replace("/admin/login");
          return;
        }
        setError("Failed to load this entry.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, id, router, blockedNewNgo]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const setField = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const openPreview = () => setPreviewMounted(true);
  const closePreview = () => {
    setPreviewOpenClass(false);
    setTimeout(() => setPreviewMounted(false), 300);
  };

  useEffect(() => {
    if (!previewMounted) return;
    const raf = requestAnimationFrame(() => setPreviewOpenClass(true));
    return () => cancelAnimationFrame(raf);
  }, [previewMounted]);

  const visibleFields = getVisibleFields(type, dest.fields, formData);

  const handleSave = async () => {
    if (imageUploading) {
      setFeedback({ message: "Please wait for image upload to finish.", type: "error" });
      return;
    }

    const missing = visibleFields.filter((key) => isFieldRequired(type, key, formData) && !formData[key]);
    if (missing.length) {
      const labels = missing.map((k) => FIELD_DEFS[k]?.label || k).join(", ");
      setFeedback({ message: `Please fill in required fields: ${labels}`, type: "error" });
      document.getElementById(`field-${missing[0]}`)?.focus();
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const payload = toApiPayload(type, formData);
      const result = await saveContentEntry(type, id, payload);
      setIsDirty(false);

      if (!id) {
        router.replace(`/admin/content-manager/editor?type=${type}&id=${result.id}`);
        return;
      }

      setFormData(result.formData);
      setFeedback({ message: "Saved successfully.", type: "success" });
    } catch (err) {
      if (err instanceof AdminAuthError) {
        router.replace("/admin/login");
        return;
      }
      setFeedback({ message: "Failed to save. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dashboard-content" id="main-content">
      <div className="cm-editor-nav">
        <Link href={dest.backUrl} className="mod-back-link">
          <ArrowLeft size={16} />
          Content Management
        </Link>
        <span className="cm-breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="cm-breadcrumb-current">
          {id ? `Edit ${dest.label}` : `New ${dest.label}`}
        </span>
      </div>

      {blockedNewNgo ? (
        <div className="mod-error-state" role="alert">
          <AlertCircle size={48} color="var(--color-warning)" style={{ margin: "0 auto 16px" }} />
          <h2>NGOs can&apos;t be created here</h2>
          <p className="mod-error-message">
            NGOs are added through public submissions. You can edit and review existing entries from the
            moderation queue or the content table.
          </p>
          <Link href={dest.backUrl} className="btn btn-primary" style={{ marginTop: 24, display: "inline-block" }}>
            Back to Content Management
          </Link>
        </div>
      ) : loading ? (
        <div className="cm-editor-layout">
          <div className="cm-editor-main">
            <div className="skeleton-line" style={{ width: 120, height: 28, marginBottom: 24 }}></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="cm-field" key={i}>
                <div className="skeleton-line" style={{ width: 100, height: 14, marginBottom: 8 }}></div>
                <div className="skeleton-block" style={{ width: "100%", height: 44, borderRadius: 8 }}></div>
              </div>
            ))}
          </div>
          <div className="cm-editor-sidebar">
            <div className="skeleton-block" style={{ width: "100%", height: 120, borderRadius: 8, marginBottom: 16 }}></div>
            <div className="skeleton-block" style={{ width: "100%", height: 80, borderRadius: 8 }}></div>
          </div>
        </div>
      ) : error ? (
        <div className="mod-error-state" role="alert">
          <AlertCircle size={48} color="var(--color-danger)" style={{ margin: "0 auto 16px" }} />
          <h2>Something went wrong</h2>
          <p className="mod-error-message">{error}</p>
          <Link href={dest.backUrl} className="btn btn-primary" style={{ marginTop: 24, display: "inline-block" }}>
            Back to Content Management
          </Link>
        </div>
      ) : (
        <div className="cm-editor-layout">
          <div className="cm-editor-main">
            <div className="cm-editor-type-badge" style={{ "--dest-color": dest.color } as React.CSSProperties}>
              {dest.label}
            </div>

            <form className="cm-editor-form" noValidate onSubmit={(e) => e.preventDefault()}>
              {visibleFields.map((key) => {
                const def = FIELD_DEFS[key];
                if (!def) return null;
                const required = isFieldRequired(type, key, formData);
                const value = formData[key];

                if (key === "image") {
                  return (
                    <ImageField
                      key={key}
                      fieldKey={key}
                      def={def}
                      value={String(value || "")}
                      required={required}
                      onChange={(v) => setField(key, v)}
                      onUploadingChange={setImageUploading}
                    />
                  );
                }

                return (
                  <FieldRenderer
                    key={key}
                    fieldKey={key}
                    def={def}
                    value={value as string | boolean}
                    required={required}
                    onChange={(v) => setField(key, v)}
                  />
                );
              })}
            </form>
          </div>

          <aside className="cm-editor-sidebar" aria-label="Publishing options">
            <div className="cm-editor-panel">
              <h3 className="cm-editor-panel-title">Status</h3>
              <div className="cm-status-select-wrap">
                <select
                  className="cm-editor-select"
                  aria-label="Content status"
                  value={formData.status}
                  onChange={(e) => setField("status", e.target.value as ContentStatus)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="cm-editor-panel">
              <h3 className="cm-editor-panel-title">Visibility</h3>
              <label className="cm-checkbox-label">
                <input
                  type="checkbox"
                  className="cm-checkbox"
                  checked={Boolean(formData.featured)}
                  onChange={(e) => setField("featured", e.target.checked)}
                />
                <span>Featured content</span>
              </label>
              <p className="cm-field-hint">Featured items are highlighted in the hub.</p>
            </div>

            {feedback && (
              <div className={`cm-save-feedback cm-feedback-${feedback.type}`} role="alert">
                {feedback.message}
              </div>
            )}

            <div className="cm-editor-actions">
              <button className="btn btn-primary cm-btn-save" type="button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button className="btn cm-btn-preview" type="button" onClick={openPreview}>
                <Eye size={15} strokeWidth={2} />
                Preview
              </button>
            </div>

            {id && (
              <div className="cm-editor-meta">
                <p className="cm-meta-line">
                  <span className="cm-meta-label">ID</span>
                  <span className="cm-meta-value">{id}</span>
                </p>
                {formData.updatedAt && (
                  <p className="cm-meta-line">
                    <span className="cm-meta-label">Last saved</span>
                    <span className="cm-meta-value">{new Date(formData.updatedAt).toLocaleString("en-GB")}</span>
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {previewMounted && (
        <>
          <div className="cm-preview-overlay" onClick={closePreview} aria-hidden="true"></div>
          <aside
            className={`cm-preview-drawer ${previewOpenClass ? "open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Content preview"
          >
            <div className="cm-preview-header">
              <h3 className="cm-preview-title">Preview</h3>
              <button className="cm-preview-close" type="button" onClick={closePreview} aria-label="Close preview">
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <div className="cm-preview-body">
              <PreviewContent data={formData} destColor={dest.color} />
            </div>
          </aside>
        </>
      )}
    </main>
  );
}

export default function ContentEditorPage() {
  return (
    <Suspense fallback={<div className="admin-auth-loader-spinner"></div>}>
      <ContentEditorContent />
    </Suspense>
  );
}
