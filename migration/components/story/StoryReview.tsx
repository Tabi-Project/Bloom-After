"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { toRichTextHtml, richTextToPlainText } from "@/lib/richText";
import { createStory } from "@/lib/api/story-api";

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

export default function StoryReview() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingStory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    const pendingJson = sessionStorage.getItem("pendingStory");
    if (!pendingJson) {
      router.replace("/stories/editor");
      return;
    }
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing client-only sessionStorage into state after mount
      setPending(JSON.parse(pendingJson));
    } catch {
      router.replace("/stories/editor");
    }
  }, [router]);

  if (!pending) return null;

  const displayName = pending.privacy === "anonymous" ? "Anonymous" : pending.name || "Shared story";
  const date = pending.savedAt
    ? new Date(pending.savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(false);

    try {
      const submitted = await createStory({
        name: pending.name || "",
        email: pending.email || "",
        privacy: pending.privacy || "named",
        story: toRichTextHtml(pending.story || ""),
        location: pending.location || "",
        consent: !!pending.consent,
        what_helped: Array.isArray(pending.tags) ? pending.tags : [],
        image: pending.image || "",
      });

      sessionStorage.setItem(
        "submittedStory",
        JSON.stringify({
          ...pending,
          confirmedAt: Date.now(),
          storyId: submitted._id || null,
          storyText: richTextToPlainText(pending.story || ""),
        })
      );
      sessionStorage.removeItem("pendingStory");
      router.push("/stories/success");
    } catch {
      setSubmitting(false);
      setSubmitError(true);
    }
  };

  return (
    <main id="main-content" className="review-page">
      <h1 className="page-title">Review Your Story</h1>
      <p className="review-subtitle">This is how your story will appear to others in the library.</p>

      <article className="resource-card review-card-large" aria-labelledby="review-title">
        {pending.image && (
          <figure className="resource-card-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pending.image} alt="Story image preview" />
          </figure>
        )}
        <div className="resource-card-body">
          {pending.tags.length > 0 && (
            <div className="review-tags" aria-label="Topics that helped">
              {pending.tags.map((tag) => (
                <span className="review-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h2 id="review-title" className="resource-card-title review-name">
            {displayName}
          </h2>
          <div
            className="review-body rich-text-display"
            dangerouslySetInnerHTML={{ __html: toRichTextHtml(pending.story || "") }}
          />
          <div className="review-author">
            <div className="review-avatar" aria-hidden="true">
              <span className="material-symbols-outlined">person</span>
            </div>
            <span className="review-author-name">{displayName}</span>
            <span className="review-author-meta">{[pending.location, date].filter(Boolean).join(" · ")}</span>
          </div>
        </div>
      </article>

      <section className="privacy-consent" aria-labelledby="privacy-heading">
        <h3 id="privacy-heading">Privacy &amp; Consent Summary</h3>
        <dl>
          <div>
            <dt>Identity Preference</dt>
            <dd className="pc-privacy">{pending.privacy === "anonymous" ? "Anonymous" : "Named"}</dd>
          </div>
          <div>
            <dt>Moderation Agreement</dt>
            <dd className="pc-consent">{pending.consent ? "Accepted" : "Pending"}</dd>
          </div>
          <div>
            <dt>Visibility</dt>
            <dd>Community Library</dd>
          </div>
        </dl>
      </section>

      {submitError && (
        <p className="submit-error" role="alert">
          Something went wrong. Please try again.
        </p>
      )}

      <div className="form-actions review-actions">
        <button type="button" className="btn btn-secondary" onClick={() => router.push("/stories/editor")}>
          Back
        </button>
        <button type="button" className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Submitting…" : "Submit for Moderation"}
          <Send size={16} aria-hidden="true" />
        </button>
      </div>

      <p className="review-legal">By submitting, you agree to our Terms of Service and Community Guidelines.</p>
    </main>
  );
}
