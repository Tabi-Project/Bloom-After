"use client";

import { useState, useEffect } from "react";
import { fetchResources } from "@/lib/api/resources";
import type { Resource } from "@/lib/api/resources";
import {
  renderArticle,
  renderInfographic,
  renderMedia,
  renderMythBusting,
} from "@/components/resources/Renderers";
import RelatedResources from "@/components/resources/RelatedResources";

const TYPE_LABELS: Record<string, string> = {
  article: "Article",
  infographic: "Infographic",
  media: "Media",
  "myth-busting": "Myth-busting guide",
};

function renderContentForType(resource: Resource): string {
  switch (resource.content_type) {
    case "infographic":
      return renderInfographic(resource);
    case "media":
      return renderMedia(resource);
    case "myth-busting":
      return renderMythBusting(resource);
    case "article":
    default:
      return renderArticle(resource);
  }
}

interface ResourceDetailPageProps {
  id: string;
}

export default function ResourceDetailPage({ id }: ResourceDetailPageProps) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No resource ID provided.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const results = await fetchResources({ q: id, limit: 1 });
        const found = results.find((r) => r.id === id) ?? results[0] ?? null;

        if (!found) {
          setError(
            "Resource not found. It may have been removed or the link may be incorrect."
          );
          return;
        }
        setResource(found);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "We could not load this resource right now. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share && /Mobi|Android|Mac OS/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: document.title,
          text: "Check out this resource from Bloom After",
          url,
        });
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      alert("Failed to copy. Please manually copy the URL from your browser.");
    }
  };

  const imageUrl = resource?.imageUrl || resource?.image_url || "";

  return (
    <>
      {/* Hero */}
      <header
        id="resource-hero"
        className="resource-hero"
        aria-busy={loading}
        aria-label="Resource header"
        style={resource ? { backgroundImage: `url('${imageUrl}')` } : undefined}
      >
        {loading ? (
          <div className="resource-hero-skeleton skeleton-block" />
        ) : resource ? (
          <>
            <div className="resource-hero-overlay" aria-hidden="true" />
            <div className="resource-hero-content container">
              <span className="resource-hero-tag">
                {TYPE_LABELS[resource.content_type] || resource.content_type}
              </span>
              <h1 className="resource-hero-title">{resource.title}</h1>
              <p className="resource-hero-summary">{resource.summary}</p>
            </div>
          </>
        ) : null}
      </header>

      {/* Content / error */}
      {loading ? (
        <article
          className="resource-content-wrap container"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="content-skeleton">
            <div className="skeleton-line skeleton-line-full" />
            <div className="skeleton-line skeleton-line-full" />
            <div className="skeleton-line skeleton-line-medium" />
          </div>
        </article>
      ) : error ? (
        <div
          id="error-state"
          className="container error-state"
          role="alert"
          aria-live="assertive"
        >
          <h2>Something went wrong</h2>
          <p className="error-message">{error}</p>
          <a href="/resources" className="btn btn-primary">
            Back to Resources
          </a>
        </div>
      ) : resource ? (
        <>
          <article
            id="resource-content"
            className="resource-content-wrap container"
            aria-live="polite"
            dangerouslySetInnerHTML={{ __html: renderContentForType(resource) }}
          />
          <div className="container">
            <RelatedResources resourceId={resource.id} theme={resource.theme} />
          </div>
        </>
      ) : null}
    </>
  );
}