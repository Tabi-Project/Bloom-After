"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  LinkIcon,
  Undo,
  Redo,
  ImagePlus,
  MapPin,
  Mail,
} from "lucide-react";
import { richTextToPlainText, toRichTextHtml } from "@/lib/richText";

const FIXED_TAGS = ["Therapy", "Lifestyle changes", "Peer support", "Self-help strategies"];

interface PendingStory {
  name: string;
  email: string;
  story: string;
  storyText: string;
  location: string;
  privacy: "named" | "anonymous";
  consent: boolean;
  tags: string[];
  image: string;
  savedAt: number;
}

const TOOLBAR_ACTIONS = [
  { action: "bold", label: "Bold", icon: Bold },
  { action: "italic", label: "Italic", icon: Italic },
  { action: "heading2", label: "Heading", icon: Heading2 },
  { action: "bulletList", label: "Bulleted list", icon: List },
  { action: "orderedList", label: "Numbered list", icon: ListOrdered },
  { action: "blockquote", label: "Quote", icon: Quote },
  { action: "link", label: "Insert link", icon: LinkIcon },
  { action: "undo", label: "Undo", icon: Undo },
  { action: "redo", label: "Redo", icon: Redo },
] as const;

export default function StoryEditorForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [privacy, setPrivacy] = useState<"named" | "anonymous">("named");
  const [consent, setConsent] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([FIXED_TAGS[0]]);
  const [otherTagActive, setOtherTagActive] = useState(false);
  const [otherTag, setOtherTag] = useState("");
  const [image, setImage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TiptapLink.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    ],
    content: "<p></p>",
    immediatelyRender: false,
  });

  // Prefill from a pending story if the user came back from the review step.
  useEffect(() => {
    const pendingJson = sessionStorage.getItem("pendingStory");
    if (!pendingJson || !editor) return;

    try {
      const pending: PendingStory = JSON.parse(pendingJson);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing client-only sessionStorage into state after mount
      setName(pending.name || "");
      setEmail(pending.email || "");
      setLocation(pending.location || "");
      setPrivacy(pending.privacy || "named");
      setConsent(!!pending.consent);
      setImage(pending.image || "");
      if (pending.story) editor.commands.setContent(toRichTextHtml(pending.story));

      if (Array.isArray(pending.tags)) {
        const known = pending.tags.filter((t) => FIXED_TAGS.includes(t));
        const unmatched = pending.tags.filter((t) => !FIXED_TAGS.includes(t));
        setActiveTags(known);
        if (unmatched.length > 0) {
          setOtherTagActive(true);
          setOtherTag(unmatched[0]);
        }
      }
    } catch {
      // ignore malformed sessionStorage content
    }
  }, [editor]);

  const runEditorAction = useCallback(
    (action: (typeof TOOLBAR_ACTIONS)[number]["action"]) => {
      if (!editor) return;
      const chain = editor.chain().focus();
      switch (action) {
        case "bold":
          chain.toggleBold().run();
          break;
        case "italic":
          chain.toggleItalic().run();
          break;
        case "heading2":
          chain.toggleHeading({ level: 2 }).run();
          break;
        case "bulletList":
          chain.toggleBulletList().run();
          break;
        case "orderedList":
          chain.toggleOrderedList().run();
          break;
        case "blockquote":
          chain.toggleBlockquote().run();
          break;
        case "undo":
          chain.undo().run();
          break;
        case "redo":
          chain.redo().run();
          break;
        case "link": {
          const existing = editor.getAttributes("link").href || "";
          const url = window.prompt("Enter a link URL", existing);
          if (url === null) break;
          if (!url.trim()) {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().setLink({ href: url.trim() }).run();
          }
          break;
        }
        default:
          break;
      }
    },
    [editor]
  );

  const isToolbarActionActive = (action: (typeof TOOLBAR_ACTIONS)[number]["action"]): boolean => {
    if (!editor) return false;
    switch (action) {
      case "bold":
        return editor.isActive("bold");
      case "italic":
        return editor.isActive("italic");
      case "heading2":
        return editor.isActive("heading", { level: 2 });
      case "bulletList":
        return editor.isActive("bulletList");
      case "orderedList":
        return editor.isActive("orderedList");
      case "blockquote":
        return editor.isActive("blockquote");
      case "link":
        return editor.isActive("link");
      default:
        return false;
    }
  };

  const readFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    readFile(e.dataTransfer?.files?.[0]);
  };

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleOtherTag = () => {
    setOtherTagActive((prev) => {
      const next = !prev;
      if (!next) setOtherTag("");
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!consent) {
      setFormError("Please consent to your story being moderated to continue.");
      return;
    }

    const storyHtml = editor?.getHTML() || "";
    const storyText = richTextToPlainText(storyHtml);

    if (!storyText) {
      setFormError("Please tell us your story before continuing.");
      return;
    }

    const tags = [...activeTags];
    if (otherTagActive && otherTag.trim()) tags.push(otherTag.trim());

    const pending: PendingStory = {
      name,
      email,
      story: storyHtml,
      storyText,
      location,
      privacy,
      consent,
      tags,
      image,
      savedAt: Date.now(),
    };

    sessionStorage.setItem("pendingStory", JSON.stringify(pending));
    router.push("/stories/review");
  };

  return (
    <main id="main-content" className="submit-layout">
      <div className="breadcrumb">
        <NextLink href="/stories" className="back-link">
          Stories
        </NextLink>
        <span className="divider">/</span>
        <span className="current">Submit Story</span>
      </div>

      <h1 className="page-title">Share Your Journey</h1>

      <aside className="submit-aside">
        <div className="card">
          <div className="tips">
            <div className="tip">
              <span className="tip-text">
                Your story could be the reason another mother feels less alone today.
              </span>
            </div>
          </div>
          <div className="aside-visual-text">Every bloom takes time.</div>
        </div>
      </aside>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {privacy !== "anonymous" && (
          <div className="form-row" id="name-row">
            <label htmlFor="name">Your name</label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Your name (optional)"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="form-row">
          <label htmlFor="image">Card image</label>
          <div className="upload-row">
            <div
              className="upload-zone"
              role="button"
              tabIndex={0}
              aria-label="Upload card image"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {!image ? (
                <div className="upload-placeholder">
                  <ImagePlus className="upload-icon" aria-hidden="true" />
                  <span className="upload-label">Click or drag &amp; drop to upload</span>
                  <span className="upload-hint">PNG, JPG up to 5 MB</span>
                </div>
              ) : (
                <button type="button" className="upload-change btn">
                  Change image
                </button>
              )}
            </div>
            {image && (
              <figure className="upload-live-preview">
                {/* data-URL preview, not a static asset — next/image doesn't apply here */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img id="image-preview" src={image} alt="Your image preview" />
              </figure>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            id="image"
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => readFile(e.target.files?.[0])}
          />
        </div>

        <div className="form-row">
          <label htmlFor="story-editor">Tell Your Story</label>
          <div className="story-editor">
            <div className="story-editor-toolbar" role="toolbar" aria-label="Story formatting">
              {TOOLBAR_ACTIONS.map(({ action, label, icon: Icon }) => (
                <button
                  key={action}
                  type="button"
                  className={`story-editor-btn${isToolbarActionActive(action) ? " active" : ""}`}
                  aria-label={label}
                  aria-pressed={isToolbarActionActive(action)}
                  onClick={() => runEditorAction(action)}
                >
                  <Icon size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
            <EditorContent editor={editor} className="story-editor-content" />
          </div>
        </div>

        <div className="form-row">
          <label>What helped you the most?</label>
          <div className="filter-tabs" aria-label="Filter story by what helped">
            {FIXED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`story-tag${activeTags.includes(tag) ? " active" : ""}`}
                aria-pressed={activeTags.includes(tag)}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
            <button
              type="button"
              className={`story-tag story-other${otherTagActive ? " active" : ""}`}
              aria-pressed={otherTagActive}
              onClick={toggleOtherTag}
            >
              <span aria-hidden="true">+</span> Other
            </button>
          </div>
          {otherTagActive && (
            <div className="other-tag-wrapper">
              <input
                type="text"
                className="other-tag-input"
                placeholder="Add a tag"
                value={otherTag}
                onChange={(e) => setOtherTag(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <label htmlFor="location">Location</label>
          <div className="location-row">
            <MapPin size={16} className="icon" aria-hidden="true" />
            <input
              type="text"
              id="location"
              placeholder="City, Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="email">Notification email</label>
          <p className="email-desc">
            If you&apos;d like to be notified when your story is reviewed, enter your email. It
            will only be used for this purpose and will never be published.
          </p>
          <div className="location-row">
            <Mail size={16} className="icon" aria-hidden="true" />
            <input
              type="email"
              id="email"
              placeholder="your@email.com"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row privacy-card">
          <div className="privacy-header">
            <div className="privacy-text">
              <h4>Display Name</h4>
              <p className="privacy-desc">Choose how you appear in the library.</p>
            </div>
            <div className="privacy-switch" role="tablist" aria-label="Name display">
              <button
                type="button"
                className={`privacy-btn privacy-named${privacy === "named" ? " active" : ""}`}
                aria-pressed={privacy === "named"}
                onClick={() => setPrivacy("named")}
              >
                Named
              </button>
              <button
                type="button"
                className={`privacy-btn privacy-anonymous${privacy === "anonymous" ? " active" : ""}`}
                aria-pressed={privacy === "anonymous"}
                onClick={() => setPrivacy("anonymous")}
              >
                Anonymous
              </button>
            </div>
          </div>
        </div>

        <div className="form-row consent-card">
          <label className="consent-wrapper" htmlFor="consent">
            <div className="consent-checkbox">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
            </div>
            <div className="consent-text">
              <h4>Moderation Agreement</h4>
              <p>
                I consent to my story being reviewed by the Bloom After team. It will not be
                published if it violates community safety guidelines.
              </p>
            </div>
          </label>
        </div>

        {formError && (
          <p className="submit-error" role="alert">
            {formError}
          </p>
        )}

        <div className="form-actions">
          <NextLink href="/stories" className="btn">
            Back
          </NextLink>
          <button type="submit" className="btn btn-primary">
            Continue to Review
          </button>
        </div>
      </form>

      <section className="submit-footer">@Bloom After, 2026</section>
    </main>
  );
}
