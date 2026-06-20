"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import Footer from "@/components/Footer";
import { richTextToPlainText, toRichTextHtml } from "@/lib/richText";

type Privacy = "named" | "anonymous";

const KNOWN_TAGS = [
  "Therapy",
  "Lifestyle changes",
  "Peer support",
  "Self-help strategies",
];

const TOOLBAR_BUTTONS = [
  { action: "bold", icon: "format_bold", label: "Bold" },
  { action: "italic", icon: "format_italic", label: "Italic" },
  { action: "heading2", icon: "title", label: "Heading" },
  {
    action: "bulletList",
    icon: "format_list_bulleted",
    label: "Bulleted list",
  },
  {
    action: "orderedList",
    icon: "format_list_numbered",
    label: "Numbered list",
  },
  { action: "blockquote", icon: "format_quote", label: "Quote" },
  { action: "link", icon: "link", label: "Insert link" },
  { action: "undo", icon: "undo", label: "Undo" },
  { action: "redo", icon: "redo", label: "Redo" },
];

function readPending(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem("pendingStory") ?? "null");
  } catch {
    return null;
  }
}

export default function StoriesEditorPage() {
  const router = useRouter();

  // Each lazy initializer calls readPending() independently — no ref access during render
  const [privacy, setPrivacy] = useState<Privacy>(() => {
    const p = readPending();
    return p?.privacy === "anonymous" ? "anonymous" : "named";
  });
  const [activeTags, setActiveTags] = useState<Set<string>>(() => {
    const p = readPending();
    if (!Array.isArray(p?.tags)) return new Set(["Therapy"]);
    return new Set((p.tags as string[]).filter((t) => KNOWN_TAGS.includes(t)));
  });
  const [otherTagVisible, setOtherTagVisible] = useState<boolean>(() => {
    const p = readPending();
    if (!Array.isArray(p?.tags)) return false;
    return (p.tags as string[]).some((t) => !KNOWN_TAGS.includes(t));
  });
  const [otherTagValue, setOtherTagValue] = useState<string>(() => {
    const p = readPending();
    if (!Array.isArray(p?.tags)) return "";
    return (p.tags as string[]).find((t) => !KNOWN_TAGS.includes(t)) ?? "";
  });
  const [imagePreviewSrc, setImagePreviewSrc] = useState<string>(() => {
    const p = readPending();
    return typeof p?.image === "string" ? p.image : "";
  });
  const [isDragOver, setIsDragOver] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Story content",
        "aria-multiline": "true",
      },
    },
  });

  // Only the editor content must wait for the editor instance — no setState here
  useEffect(() => {
    if (!editor) return;
    const pending = readPending();
    if (!pending?.story) return;
    editor.commands.setContent(toRichTextHtml(String(pending.story)));
  }, [editor]);

  // Image helpers
  function readFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreviewSrc(String(reader.result));
    reader.readAsDataURL(file);
  }

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
      else setImagePreviewSrc("");
    },
    [],
  );

  // Tag helpers
  function toggleKnownTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function toggleOther() {
    setOtherTagVisible((v) => {
      if (v) setOtherTagValue("");
      return !v;
    });
  }

  // Editor toolbar helpers
  function isActive(action: string): boolean {
    if (!editor) return false;
    if (action === "heading2") return editor.isActive("heading", { level: 2 });
    return editor.isActive(action);
  }

  function runAction(action: string) {
    if (!editor) return;
    switch (action) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "heading2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "undo":
        editor.chain().focus().undo().run();
        break;
      case "redo":
        editor.chain().focus().redo().run();
        break;
      case "link": {
        const existing = editor.getAttributes("link").href ?? "";
        const url = window.prompt("Enter a link URL", existing);
        if (url === null) break;
        if (!url.trim()) {
          editor.chain().focus().unsetLink().run();
          break;
        }
        editor.chain().focus().setLink({ href: url.trim() }).run();
        break;
      }
    }
  }

  // Form submit
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const consent = consentRef.current?.checked ?? false;
    if (!consent) {
      alert("Please consent to your story being moderated to continue.");
      return;
    }

    const storyHtml = editor?.getHTML() ?? "";
    const storyText = richTextToPlainText(storyHtml);
    if (!storyText.trim()) {
      alert("Please tell us your story before continuing.");
      editor?.commands.focus();
      return;
    }

    const selectedTags = [...activeTags];
    if (otherTagVisible && otherTagValue.trim())
      selectedTags.push(otherTagValue.trim());

    const pending = {
      name: nameRef.current?.value ?? "",
      email: emailRef.current?.value ?? "",
      story: storyHtml,
      storyText,
      location: locationRef.current?.value ?? "",
      privacy,
      consent,
      tags: selectedTags,
      image: imagePreviewSrc.startsWith("data:") ? imagePreviewSrc : "",
      savedAt: Date.now(),
    };

    sessionStorage.setItem("pendingStory", JSON.stringify(pending));
    router.push("/stories/review");
  }

  return (
    <>
      <a href="#main-content" className="visually-hidden">
        Skip to main content
      </a>

      <main id="main-content" className="submit-layout">
        <div className="breadcrumb">
          <Link
            href="/stories"
            className="back-link"
            aria-label="back to stories page"
          >
            Stories
          </Link>
          <span className="divider">/</span>
          <span className="current">Submit Story</span>
        </div>

        <h1 className="page-title">Share Your Journey</h1>

        {/* ── Aside ── */}
        <aside className="submit-aside">
          <div className="card">
            <div className="aside-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M13.375 21.825q.275.075.638.063t.612-.113L22 19q0-.85-.6-1.425T20 17h-6.85q-.075 0-.175-.012t-.15-.038l-1.475-.525q-.2-.075-.275-.25t-.025-.375q.05-.175.25-.275t.4-.025l1.125.425q.1.05.163.063t.187.012H15.8q.475 0 .837-.325t.363-.85q0-.35-.213-.675t-.562-.45L9.3 11.125q-.175-.05-.35-.088T8.6 11H7v9.025zM1 20q0 .825.588 1.413T3 22t1.413-.587T5 20v-7q0-.825-.587-1.412T3 11t-1.412.588T1 13zm14.263-7.937q-.363-.138-.663-.413l-2.75-2.7q-.775-.75-1.312-1.662T10 5.3q0-1.375.963-2.337T13.3 2q.8 0 1.5.338t1.2.912q.5-.575 1.2-.913T18.7 2q1.375 0 2.338.963T22 5.3q0 1.075-.525 1.988t-1.3 1.662l-2.775 2.7q-.3.275-.662.413T16 12.2t-.737-.137"
                />
              </svg>
            </div>
            <h3>Why Sharing Matters</h3>
            <p>
              Your story provides hope and practical guidance to others walking
              a similar path. By sharing your experience, you contribute to a
              growing map of recovery and resilience.
            </p>
          </div>

          <div className="tips">
            <div className="tip">
              <span
                className="material-symbols-outlined tip-icon"
                aria-hidden="true"
              >
                lightbulb
              </span>
              <div>
                <h4>Tip: Be Honest</h4>
                <p className="tip-text">
                  Focus on the small wins that made a difference.
                </p>
              </div>
            </div>
            <div className="tip">
              <span
                className="material-symbols-outlined tip-icon"
                aria-hidden="true"
              >
                lock
              </span>
              <div>
                <h4>Safe Space</h4>
                <p className="tip-text">
                  You control your privacy. Choose to stay anonymous anytime.
                </p>
              </div>
            </div>
          </div>

          <div className="aside-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjpUM_XuUssUS5_iSX97aIpD3Ati5zcrASLLiFzlOkNTDt0qsH_M0YmyYCFlVIomco2fdffoE1eBScrcxWu1Rl0bEMMtbmGkzK-4MTCqpTBLhIcVqj4jE3Pcy5gn11t8OUVaxY7Sn9x9Zh-cuwINUXbepthvhPotfiU0d5qJY2AAf4xJxGwB-xUgwo4G4J_jEfD5n2WnIaCklWdAu0YYwOo27Xr7jTqKG5vH1_JRP6Jegk07bg1UscYjrdq2HTOSJ-Hh9C-uIP5BQ2"
              alt="Every bloom takes time"
            />
            <div className="aside-visual-text">Every bloom takes time.</div>
          </div>
        </aside>

        {/* ── Form ── */}
        <form
          id="submit-story-form"
          className="form-card"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          {/* Name */}
          <div className="form-row" hidden={privacy === "anonymous"}>
            <label htmlFor="name">Your name</label>
            <input
              ref={nameRef}
              type="text"
              id="name"
              name="name"
              placeholder="Your name (optional)"
              disabled={privacy === "anonymous"}
            />
          </div>

          {/* Image upload */}
          <div className="form-row">
            <label htmlFor="image">Card image</label>
            <div className="upload-row">
              <div
                className={`upload-zone${isDragOver ? " drag-over" : ""}`}
                role="button"
                tabIndex={0}
                aria-label="Upload card image"
                onClick={(e) => {
                  if ((e.target as Element).closest("#upload-change-btn"))
                    return;
                  imageInputRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    imageInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) readFile(file);
                }}
              >
                <div className="upload-placeholder" hidden={!!imagePreviewSrc}>
                  <span
                    className="material-symbols-outlined upload-icon"
                    aria-hidden="true"
                  >
                    add_photo_alternate
                  </span>
                  <span className="upload-label">
                    Click or drag &amp; drop to upload
                  </span>
                  <span className="upload-hint">PNG, JPG up to 5 MB</span>
                </div>
                <button
                  type="button"
                  className="upload-change btn"
                  id="upload-change-btn"
                  hidden={!imagePreviewSrc}
                  onClick={() => imageInputRef.current?.click()}
                >
                  Change image
                </button>
              </div>

              <figure
                className={`upload-live-preview${!imagePreviewSrc ? " upload-live-preview--empty" : ""}`}
                aria-hidden={!imagePreviewSrc}
              >
                {imagePreviewSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreviewSrc} alt="Your image preview" />
                )}
              </figure>
              <input
                ref={imageInputRef}
                type="file"
                id="image"
                name="image"
                accept="image/*"
                className="visually-hidden"
                onChange={handleImageChange}
              />
            </div>
            {/* /upload-row */}
          </div>
          {/* /form-row image */}

          {/* Rich text story editor */}
          <div className="form-row">
            <label htmlFor="story-editor">Tell Your Story</label>
            <div className="story-editor" id="story-editor-wrap">
              <div
                className="story-editor-toolbar"
                role="toolbar"
                aria-label="Story formatting"
              >
                {TOOLBAR_BUTTONS.map(({ action, icon, label }) => (
                  <button
                    key={action}
                    type="button"
                    className={`story-editor-btn${isActive(action) ? " active" : ""}`}
                    aria-label={label}
                    aria-pressed={isActive(action)}
                    onClick={() => runAction(action)}
                  >
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                  </button>
                ))}
              </div>

              <EditorContent
                editor={editor}
                id="story-editor"
                className="story-editor-content"
              />
            </div>
          </div>

          {/* What helped tags */}
          <div className="form-row">
            <label>What helped you the most?</label>
            <div
              className="filter-tabs"
              aria-label="Filter story by what helped"
            >
              {KNOWN_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`story-tag${activeTags.has(tag) ? " active" : ""}`}
                  aria-pressed={activeTags.has(tag)}
                  onClick={() => toggleKnownTag(tag)}
                >
                  {tag}
                </button>
              ))}
              <button
                type="button"
                className={`story-tag story-other${otherTagVisible ? " active" : ""}`}
                aria-pressed={otherTagVisible}
                onClick={toggleOther}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  add
                </span>
                Other
              </button>
            </div>
            {otherTagVisible && (
              <div className="other-tag-wrapper">
                <input
                  ref={otherTagRef}
                  type="text"
                  id="other-tag-input"
                  className="other-tag-input"
                  placeholder="Add a tag"
                  value={otherTagValue}
                  onChange={(e) => setOtherTagValue(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="form-row">
            <label htmlFor="location">Location</label>
            <div className="location-row">
              <span className="icon" data-icon="location" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M13.413 11.413Q14 10.825 14 10t-.587-1.412T12 8t-1.412.588T10 10t.588 1.413T12 12t1.413-.587M12 22q-4.025-3.425-6.012-6.362T4 10.2q0-3.75 2.413-5.975T12 2t5.588 2.225T20 10.2q0 2.5-1.987 5.438T12 22"
                  ></path>
                </svg>
              </span>
              <input
                ref={locationRef}
                type="text"
                id="location"
                name="location"
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-row">
            <label htmlFor="email">Notification email</label>
            <p className="email-desc">
              If you&apos;d like to be notified when your story is reviewed,
              enter your email. It will only be used for this purpose and will
              never be published.
            </p>
            <div className="location-row">
              <span className="icon" data-icon="email" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                ref={emailRef}
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>

          {/* Privacy */}
          <div className="form-row privacy-card">
            <div className="privacy-header">
              <div className="privacy-text">
                <h4>Display Name</h4>
                <p className="privacy-desc">
                  Choose how you appear in the library.
                </p>
              </div>
              <div
                className="privacy-switch"
                role="tablist"
                aria-label="Name display"
              >
                {(["named", "anonymous"] as Privacy[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`privacy-btn privacy-${value}${privacy === value ? " active" : ""}`}
                    aria-pressed={privacy === value}
                    onClick={() => setPrivacy(value)}
                  >
                    {value === "named" ? "Named" : "Anonymous"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="form-row consent-card">
            <label className="consent-wrapper" htmlFor="consent">
              <div className="consent-checkbox">
                <input
                  ref={consentRef}
                  type="checkbox"
                  name="consent"
                  id="consent"
                  required
                />
              </div>
              <div className="consent-text">
                <h4>Moderation Agreement</h4>
                <p>
                  I consent to my story being reviewed by the Bloom After team.
                  It will not be published if it violates community safety
                  guidelines.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Link href="/stories" className="btn">
              Back
            </Link>
            <button type="submit" className="btn btn-primary">
              Continue to Review
            </button>
          </div>
        </form>

        <section className="submit-footer">@Bloom After, 2026</section>
      </main>

      <Footer />
    </>
  );
}
