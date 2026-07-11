"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchLifestyleById } from "@/lib/api/lifestyle-api";
import type { Lifestyle } from "@/types/lifestyle";

interface LifestyleDetailPageProps {
  id: string;
}

export default function LifestyleDetailPage({ id }: LifestyleDetailPageProps) {
  const [item, setItem] = useState<Lifestyle | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(
    !id ? "No lifestyle entry ID provided." : null
  );

  useEffect(() => {
    if (!id) return;

    const abortController = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchLifestyleById(id, { signal: abortController.signal });
        if (!data) {
          setError("This entry may have been removed or the link may be incorrect.");
          return;
        }
        setItem(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("We could not load this entry right now. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => abortController.abort();
  }, [id]);

  return (
    <>
      <header
        id="lmd-hero"
        className="resource-hero"
        aria-busy={loading}
        aria-label="Lifestyle entry header"
        style={item ? { backgroundColor: "var(--color-brand-700)" } : undefined}
      >
        {loading ? (
          <div className="resource-hero-skeleton skeleton-block" />
        ) : item ? (
          <>
            <div className="resource-hero-overlay" aria-hidden="true" />
            <div className="resource-hero-content container">
              <span className="resource-hero-tag">{item.category}</span>
              <h1 className="resource-hero-title">{item.title}</h1>
              <p className="resource-hero-summary">{item.subtitle}</p>
            </div>
          </>
        ) : null}
      </header>

      {loading ? (
        <article
          id="lmd-content"
          className="lmd-main-content container"
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
          <Link href="/lifestyle" className="btn btn-primary">
            Back to Lifestyle &amp; Recovery
          </Link>
        </div>
      ) : item ? (
        <article id="lmd-content" className="lmd-main-content container" aria-live="polite">
          {item.foundation.length > 0 && (
            <section className="lmd-section">
              <h2 className="lmd-section-title">The Foundation</h2>
              {item.foundation.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </section>
          )}

          {item.tips.length > 0 && (
            <section className="lmd-section">
              <h2 className="lmd-section-title">Practical Strategies</h2>
              <ul className="lmd-tips-grid">
                {item.tips.map((tip, i) => (
                  <li className="lmd-tip-card" key={i}>
                    <h4>{tip.title}</h4>
                    <p>{tip.desc}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {item.evidence.length > 0 && (
            <section className="lmd-section">
              <h2 className="lmd-section-title">Clinical Evidence</h2>
              <ul className="lmd-evidence-list">
                {item.evidence.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </section>
          )}
        </article>
      ) : null}
    </>
  );
}
