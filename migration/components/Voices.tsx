"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, FileText, PlayCircle } from "lucide-react";
import { fetchResources, type Resource } from "@/lib/api/resources";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  article: "Article",
  infographic: "Infographic",
  media: "Media",
  "myth-busting": "Myth-busting guide",
};

function ResourceCard({ resource }: { resource: Resource }) {
  const href = `/resources/${encodeURIComponent(resource.id)}`;
  const image = resource.imageUrl || resource.image_url;
  const theme = resource.theme || "General";
  const themeClass = `badge-theme-${theme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;
  const typeLabel = CONTENT_TYPE_LABELS[resource.content_type] || resource.content_type;
  const TypeIcon = resource.content_type === "media" ? PlayCircle : FileText;

  return (
    <article className="resource-card" data-id={resource.id}>
      <Link
        href={href}
        className="resource-card-image-link"
        tabIndex={-1}
        aria-hidden="true"
      >
        <figure className="resource-card-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" loading="lazy" width={400} height={240} />
          <figcaption className="resource-card-badges">
            <span className={`badge badge-theme ${themeClass}`}>{theme}</span>
            <span
              className="badge badge-type"
              aria-label={`Content type: ${typeLabel}`}
            >
              <TypeIcon size={14} aria-hidden="true" />
            </span>
          </figcaption>
        </figure>
      </Link>

      <div className="resource-card-body">
        <div className="resource-card-meta">
          <time dateTime={resource.date}>{resource.date}</time>
          <span className="resource-read-time">
            <Clock size={12} aria-hidden="true" />
            {resource.read_time}
          </span>
        </div>

        <h3 className="resource-card-title">
          <Link href={href}>{resource.title}</Link>
        </h3>

        <p className="resource-card-summary">{resource.summary}</p>

        <Link
          href={href}
          className="resource-card-cta"
          aria-label={`${resource.cta_label}: ${resource.title}`}
        >
          {resource.cta_label}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function Voices() {
  const [resources, setResources] = useState<Resource[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchResources({
      page: 1,
      limit: 3,
      content_type: "media",
      published: true,
    })
      .then((data) => {
        if (!cancelled && data.length) setResources(data.slice(0, 3));
      })
      .catch(() => {
        // leave the static fallback content in place if the fetch fails
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (resources) {
    return (
      <section
        className="voices-card-list resources-grid"
        aria-labelledby="voices-media-heading"
      >
        <h3 className="visually-hidden" id="voices-media-heading">
          Featured podcasts and videos
        </h3>
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </section>
    );
  }

  return (
    <section
      className="voices-card-list resources-grid"
      aria-labelledby="voices-media-heading"
    >
      <h3 className="visually-hidden" id="voices-media-heading">
        Featured podcasts and videos
      </h3>

      <article className="voices-card" aria-labelledby="voices-card-title-1">
        <p className="voices-meta" aria-label="Episode source and language">
          <span className="voices-meta-pill">Spotify</span>
          <span className="voices-meta-pill">English</span>
        </p>
        <h4 className="voices-card-title" id="voices-card-title-1">
          Navigating the Fourth Trimester
        </h4>
        <Link
          className="voices-card-link"
          href="/resources"
          aria-label="Listen now: Navigating the Fourth Trimester"
        >
          <span className="voices-card-link-icon" aria-hidden="true">
            <PlayCircle size={22} />
          </span>
          <span>Listen now</span>
        </Link>
      </article>

      <article className="voices-card" aria-labelledby="voices-card-title-2">
        <p className="voices-meta" aria-label="Episode source and language">
          <span className="voices-meta-pill">Apple Podcasts</span>
          <span className="voices-meta-pill">Pidgin</span>
        </p>
        <h4 className="voices-card-title" id="voices-card-title-2">
          Motherhood Unfiltered: Lagos Edition
        </h4>
        <Link
          className="voices-card-link"
          href="/resources"
          aria-label="Listen now: Motherhood Unfiltered: Lagos Edition"
        >
          <span className="voices-card-link-icon" aria-hidden="true">
            <PlayCircle size={22} />
          </span>
          <span>Listen now</span>
        </Link>
      </article>

      <article className="voices-card" aria-labelledby="voices-card-title-3">
        <p className="voices-meta" aria-label="Episode source and language">
          <span className="voices-meta-pill">YouTube</span>
          <span className="voices-meta-pill">English</span>
        </p>
        <h4 className="voices-card-title" id="voices-card-title-3">
          Recognizing PPD with Dr. Adeyemi
        </h4>
        <Link
          className="voices-card-link"
          href="/resources"
          aria-label="Watch video: Recognizing PPD with Dr. Adeyemi"
        >
          <span className="voices-card-link-icon" aria-hidden="true">
            <PlayCircle size={22} />
          </span>
          <span>Watch video</span>
        </Link>
      </article>
    </section>
  );
}
