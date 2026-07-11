"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { CheckCircle } from "lucide-react";

interface SubmittedStory {
  name: string;
  story: string;
  storyText: string;
  location: string;
  privacy: "named" | "anonymous";
  tags: string[];
  image: string;
  confirmedAt: number;
}

export default function StorySuccess() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState<SubmittedStory | null>(null);

  useEffect(() => {
    const submittedJson = sessionStorage.getItem("submittedStory");
    if (!submittedJson) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing client-only sessionStorage into state after mount
      setSubmitted(JSON.parse(submittedJson));
    } catch {
      // ignore malformed sessionStorage content
    }
  }, []);

  const displayName = submitted
    ? submitted.privacy === "anonymous"
      ? "Anonymous"
      : submitted.name || "Shared story"
    : "";
  const date = submitted?.confirmedAt
    ? new Date(submitted.confirmedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const excerpt = submitted?.storyText
    ? submitted.storyText.length > 300
      ? `${submitted.storyText.slice(0, 300)}…`
      : submitted.storyText
    : "";

  const handleSubmitAnother = () => {
    sessionStorage.removeItem("submittedStory");
    router.push("/stories/editor");
  };

  return (
    <main id="main-content" className="review-page">
      <div className="success-banner">
        <CheckCircle className="success-banner-icon" aria-hidden="true" />
        <div>
          <h1 className="page-title">Story submitted!</h1>
          <p className="review-subtitle">Your story is now under review. We&rsquo;ll let you know within 48 hours.</p>
        </div>
      </div>

      {submitted && (
        <article className="resource-card review-card-large" aria-labelledby="success-title">
          {submitted.image && (
            <figure className="resource-card-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={submitted.image} alt="Submitted story image" />
            </figure>
          )}
          <div className="resource-card-body">
            {submitted.tags.length > 0 && (
              <div className="review-tags" aria-label="Topics that helped">
                {submitted.tags.map((tag) => (
                  <span className="review-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h2 id="success-title" className="resource-card-title review-name">
              {displayName}
            </h2>
            <p className="review-body">{excerpt}</p>
            <div className="review-author">
              <div className="review-avatar" aria-hidden="true">
                <span className="material-symbols-outlined">person</span>
              </div>
              <span className="review-author-name">{displayName}</span>
              <span className="review-author-meta">{[submitted.location, date].filter(Boolean).join(" · ")}</span>
            </div>
          </div>
        </article>
      )}

      <div className="form-actions review-actions">
        <NextLink href="/stories" className="btn btn-secondary">
          Back to Stories
        </NextLink>
        <button type="button" className="btn btn-primary" onClick={handleSubmitAnother}>
          Submit another story
        </button>
      </div>

      <section className="submit-footer">@Bloom After, 2026</section>
    </main>
  );
}
