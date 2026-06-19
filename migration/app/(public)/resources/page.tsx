"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ResourceCard, { ResourceCardSkeleton } from "@/components/resources/ResourceCard";
import { fetchResources } from "@/lib/api/resources";
import type { Resource } from "@/lib/api/resources";

const ITEMS_PER_PAGE = 9;

type FilterType = "" | "article" | "infographic" | "media" | "myth-busting";

const FILTER_TABS: { label: string; value: FilterType }[] = [
  { label: "All", value: "" },
  { label: "Articles", value: "article" },
  { label: "Infographics", value: "infographic" },
  { label: "Media", value: "media" },
  { label: "Myth-busting guides", value: "myth-busting" },
];

type State = {
  resources: Resource[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
};

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterType>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<State>({
    resources: [],
    currentPage: 1,
    totalPages: 0,
    loading: true,
    error: null,
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);

  const loadResources = useCallback(
    async (
      page: number,
      filter: FilterType,
      query: string,
      scrollToGrid = false
    ) => {
      const requestId = ++requestSeqRef.current;
      setLoading(true);
      setError(null);

      try {
        // fetchResources returns Resource[] directly — no pagination from the API.
        const all = await fetchResources({
          content_type: filter,
          q: query,
          published: true,
          // Fetch a large batch so client-side pagination works.
          // Swap for server-side pagination if the API adds it later.
          limit: 200,
        });

        if (requestId !== requestSeqRef.current) return;

        const total = Math.ceil(all.length / ITEMS_PER_PAGE);
        const safePage = Math.min(page, total || 1);
        const slice = all.slice(
          (safePage - 1) * ITEMS_PER_PAGE,
          safePage * ITEMS_PER_PAGE
        );

        setTotalPages(total);
        setCurrentPage(safePage);
        setResources(slice);

        if (scrollToGrid && safePage > 1 && gridRef.current) {
          gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (err: unknown) {
        if (requestId !== requestSeqRef.current) return;
        setError(
          err instanceof Error
            ? err.message
            : "We could not load resources right now. Please try again."
        );
      } finally {
        if (requestId === requestSeqRef.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const requestId = ++requestSeqRef.current;

    fetchResources({ published: true, limit: 200 })
      .then((all) => {
        if (requestId !== requestSeqRef.current) return;
        const total = Math.ceil(all.length / ITEMS_PER_PAGE);
        setState({
          resources: all.slice(0, ITEMS_PER_PAGE),
          currentPage: 1,
          totalPages: total,
          loading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (requestId !== requestSeqRef.current) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "We could not load resources right now.",
        }));
      });
  }, []); 

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    loadResources(1, filter, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      const q = e.target.value.trim().toLowerCase();
      setSearchQuery(q);
      loadResources(1, activeFilter, q);
    }, 350);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    loadResources(page, activeFilter, searchQuery, true);
  };

  return (
    <>
      {/* Hero */}
      <section
        className="resources-hero"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1658092967527-4e140d9bdaea?q=80&w=870&auto=format&fit=crop')",
        }}
        aria-labelledby="resources-hero-heading"
      >
        <div className="resources-hero-content container">
          <h1 className="resources-hero-title" id="resources-hero-heading">
            Resource Hub
          </h1>
          <p className="resources-hero-subtitle">
            Browse bite-sized, trusted information to help you understand postpartum
            depression, recognise its signs, and explore support and recovery options.
          </p>
        </div>
      </section>

      {/* Search & filters */}
      <div className="page-controls" role="search">
        <div className="container page-controls-inner">
          <div className="search-wrap">
            <span className="search-icon" aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              id="search-input"
              className="search-input"
              placeholder="Search by keyword, topic, or question"
              aria-label="Search resources"
              autoComplete="off"
              onChange={handleSearchChange}
            />
          </div>

          <nav className="filter-tabs" aria-label="Filter resources by type">
            {FILTER_TABS.map(({ label, value }) => (
              <button
                key={value}
                className={`filter-btn${activeFilter === value ? " active" : ""}`}
                data-filter={value}
                aria-pressed={activeFilter === value}
                onClick={() => handleFilterChange(value)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Resource grid */}
      <section className="resources-grid-section" aria-labelledby="resources-list-label">
        <div className="container">
          <h2 className="visually-hidden" id="resources-list-label">
            Resources
          </h2>

          <div
            id="resources-grid"
            className="resources-grid"
            ref={gridRef}
            aria-live="polite"
            aria-atomic="false"
            aria-busy={loading}
          >
            {loading ? (
              Array(ITEMS_PER_PAGE)
                .fill(null)
                .map((_, i) => <ResourceCardSkeleton key={i} />)
            ) : error ? (
              <div className="resources-error" role="alert">
                <p className="resources-error-message">{error}</p>
                <button
                  className="resources-error-btn"
                  type="button"
                  onClick={() => loadResources(currentPage, activeFilter, searchQuery)}
                >
                  Try again
                </button>
              </div>
            ) : resources.length > 0 ? (
              resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : null}
          </div>

          {!loading && !error && resources.length === 0 && (
            <p className="empty-state" role="status">
              <strong>No resources found.</strong>
              <br />
              Try a different search term or filter.
            </p>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="pagination-wrap" aria-live="polite">
              <nav className="pagination" aria-label="Resource pages">
                <button
                  className="pagination-btn pagination-btn--prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Previous
                </button>

                <div className="pagination-pages" role="list">
                  {buildPageNumbers(currentPage, totalPages).map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="pagination-ellipsis"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`pagination-page${
                          p === currentPage ? " pagination-page-active" : ""
                        }`}
                        onClick={() => handlePageChange(p as number)}
                        aria-label={`Page ${p}`}
                        aria-current={p === currentPage ? "page" : undefined}
                        role="listitem"
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  className="pagination-btn pagination-btn--next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </section>
    </>
  );
}