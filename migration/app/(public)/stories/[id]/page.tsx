"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchStoryById } from "@/lib/api/story-api";
import { toRichTextHtml, richTextToPlainText } from "@/lib/richText";
import type { Story } from "@/types/story";

// ── Skeleton ──────────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="resource-hero resource-hero--skeleton" aria-busy="true" aria-label="Loading story">
      <div className="skeleton-block resource-hero-skeleton-block" />
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="resource-content-wrap container" aria-busy="true">
      <div className="content-skeleton">
        <div className="skeleton-line skeleton-line-full" />
        <div className="skeleton-line skeleton-line-full" />
        <div className="skeleton-line skeleton-line-medium" />
        <div className="skeleton-line skeleton-line-full" />
        <div className="skeleton-line skeleton-line-medium" />
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function StoryHero({ story }: { story: Story }) {
  const authorName =
    story.privacy === "named" && story.name ? story.name : "Anonymous";

  const date = story.createdAt
    ? new Date(story.createdAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const heroStyle: React.CSSProperties = story.image_url
    ? { backgroundImage: `url('${story.image_url}')` }
    : { backgroundColor: "#001616" };

  return (
    <header
      className="resource-hero"
      style={heroStyle}
      aria-label="Story header"
    >
      <div className="resource-hero-overlay" aria-hidden="true" />
      <div className="resource-hero-content container">
        {story.what_helped.length > 0 && (
          <div className="story-hero-tags">
            {story.what_helped.map((tag) => (
              <span key={tag} className="resource-hero-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1 className="resource-hero-title">{authorName}&apos;s Story</h1>
        <p className="resource-hero-summary">
          {[story.location, date].filter(Boolean).join(" · ")}
        </p>
      </div>
    </header>
  );
}

// ── Content ───────────────────────────────────────────────────────────────────
function StoryContent({ story }: { story: Story }) {
  const storyHtml = toRichTextHtml(story.story || "");

  return (
    <article className="resource-content-wrap container" aria-live="polite">
      <div className="story-article">
        <div
          className="story-body rich-text-display"
          dangerouslySetInnerHTML={{ __html: storyHtml }}
        />

        {story.what_helped.length > 0 && (
          <div className="story-what-helped">
            <h2 className="story-what-helped-heading">What helped me</h2>
            <div className="review-tags">
              {story.what_helped.map((tag) => (
                <span key={tag} className="review-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No story ID provided.");
      setLoading(false);
      return;
    }

    fetchStoryById(id)
      .then((data) => {
        if (!data) {
          setError(
            "Story not found. It may have been removed or the link may be incorrect."
          );
        } else {
          setStory(data);
          // Update document title + meta description
          const authorName =
            data.privacy === "named" && data.name ? data.name : "Anonymous";
          document.title = `${authorName}'s Story — Bloom After`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            const plain = richTextToPlainText(data.story || "");
            metaDesc.setAttribute("content", plain.slice(0, 150));
          }
        }
      })
      .catch(() =>
        setError("Something went wrong. Please try again.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Navbar />
      <a href="#main-content" className="visually-hidden">
        Skip to main content
      </a>

      <main id="main-content">
        {loading ? (
          <>
            <HeroSkeleton />
            <ContentSkeleton />
          </>
        ) : error ? (
          <div
            className="container error-state"
            role="alert"
            aria-live="assertive"
          >
            <h2>Something went wrong</h2>
            <p className="error-message">{error}</p>
          </div>
        ) : story ? (
          <>
            <StoryHero story={story} />
            <StoryContent story={story} />
          </>
        ) : null}
      </main>

      <Footer />
    </>
  );
}