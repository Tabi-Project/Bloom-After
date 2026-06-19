"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import FilterButton from "@/components/story/FilterButton";
import StoryCard from "@/components/story/StoryCard";
import { fetchStories } from "@/lib/api/story-api";
import type { Story } from "@/types/story";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Therapy", value: "Therapy" },
  { label: "Lifestyle changes", value: "Lifestyle changes" },
  { label: "Peer support", value: "Peer support" },
  { label: "Self-help strategies", value: "Self-help strategies" },
  { label: "Other", value: "Other" },
];

const ITEMS_PER_PAGE = 9;

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

function StoryCardSkeleton() {
  return (
    <div className="resource-card story-card story-card--skeleton" aria-hidden="true">
      <div className="resource-card-image skeleton-block" />
      <div className="resource-card-body">
        <div className="skeleton-block skeleton-meta" />
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-text" />
        <div className="skeleton-block skeleton-text skeleton-text--short" />
      </div>
    </div>
  );
}

const HERO_BG =
  "https://images.unsplash.com/photo-1658092967527-4e140d9bdaea?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const StoriesPage = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFilter, setActiveFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);

  const load = useCallback(
    async (page: number, filter: string, query: string, scrollToGrid = false) => {
      const requestId = ++requestSeqRef.current;
      setLoading(true);
      setError(null);

      try {
        const { stories: all, pagination } = await fetchStories({
          page,
          limit: ITEMS_PER_PAGE,
          status: "approved",
        });

        if (requestId !== requestSeqRef.current) return;

        // Client-side filter + search on top of server results
        const filtered = all.filter((s) => {
          const matchesFilter = !filter || s.what_helped.includes(filter);
          const q = query.toLowerCase();
          const matchesSearch =
            !q ||
            s.story_text.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.location.toLowerCase().includes(q);
          return matchesFilter && matchesSearch;
        });

        const total = pagination?.totalPages ?? Math.ceil(filtered.length / ITEMS_PER_PAGE);
        setTotalPages(total);
        setCurrentPage(page);
        setStories(filtered);

        if (scrollToGrid && page > 1 && gridRef.current) {
          gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (err) {
        if (requestId !== requestSeqRef.current) return;
        setError(
          err instanceof Error
            ? err.message
            : "We could not load stories right now. Please try again."
        );
      } finally {
        if (requestId === requestSeqRef.current) setLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    load(1, "", "");
  }, [load]);

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    setIsFilterOpen(false);
    load(1, value, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      const q = e.target.value.trim().toLowerCase();
      setSearchQuery(q);
      load(1, activeFilter, q);
    }, 350);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    load(page, activeFilter, searchQuery, true);
  };

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const close = () => setIsFilterOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <Navbar />
      <a href="#main-content" className="visually-hidden">
        Skip to main content
      </a>

      <main id="main-content">
        {/* Hero */}
        <section
          className="resources-hero"
          style={{ backgroundImage: `url('${HERO_BG}')` }}
          aria-labelledby="stories-hero-heading"
        >
          <div className="resources-hero-content container">
            <h1 className="resources-hero-title" id="stories-hero-heading">
              Stories of Hope
            </h1>
            <p className="resources-hero-subtitle">
              Real journeys, shared with courage. Every story here is a light for
              someone still finding their way through postpartum depression.
            </p>
            <Link
              href="/stories/editor"
              className="btn btn-outline-white stories-hero-cta"
            >
              Share Your Story
            </Link>
          </div>
        </section>

        {/* Search & filters */}
        <div className="page-controls" role="search">
          <div className="container page-controls-inner">
            <div className="search-wrap">
              <span className="search-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="search"
                id="search-input"
                className="search-input"
                placeholder="Search by name, location, or keyword"
                aria-label="Search stories"
                autoComplete="off"
                onChange={handleSearchChange}
              />
            </div>

            <div
              className="filter-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="filter-dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={isFilterOpen}
                aria-controls="filter-menu"
                aria-label="Filter stories"
                onClick={() => setIsFilterOpen((o) => !o)}
              >
                <span aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M11 18q-.425 0-.712-.288T10 17t.288-.712T11 16h2q.425 0 .713.288T14 17t-.288.713T13 18zm-4-5q-.425 0-.712-.288T6 12t.288-.712T7 11h10q.425 0 .713.288T18 12t-.288.713T17 13zM4 8q-.425 0-.712-.288T3 7t.288-.712T4 6h16q.425 0 .713.288T21 7t-.288.713T20 8z" />
                  </svg>
                </span>
                Filter
                {activeFilter && (
                  <span className="filter-active-badge">{activeFilter}</span>
                )}
              </button>

              <nav
                className="filter-dropdown-menu"
                id="filter-menu"
                aria-label="Filter stories by what helped"
                hidden={!isFilterOpen}
              >
                {FILTERS.map(({ label, value }) => (
                  <FilterButton
                    key={value}
                    isActive={activeFilter === value}
                    text={label}
                    onClick={() => handleFilterChange(value)}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Grid */}
        <section className="resources-grid-section" aria-labelledby="stories-list-label">
          <div className="container">
            <h2 className="visually-hidden" id="stories-list-label">Stories</h2>

            <div
              id="stories-grid"
              className="resources-grid"
              ref={gridRef}
              aria-live="polite"
              aria-atomic="false"
              aria-busy={loading}
            >
              {loading ? (
                Array(ITEMS_PER_PAGE).fill(null).map((_, i) => (
                  <StoryCardSkeleton key={i} />
                ))
              ) : error ? (
                <div className="resources-error" role="alert">
                  <p className="resources-error-message">{error}</p>
                  <button
                    className="resources-error-btn"
                    type="button"
                    onClick={() => load(currentPage, activeFilter, searchQuery)}
                  >
                    Try again
                  </button>
                </div>
              ) : (
                stories.map((story) => (
                  <StoryCard key={story._id} story={story} />
                ))
              )}
            </div>

            {!loading && !error && stories.length === 0 && (
              <p className="empty-state" role="status">
                <strong>No stories found.</strong>
                <br />
                Try a different search term or filter.
              </p>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="pagination-wrap" aria-live="polite">
                <nav className="pagination" aria-label="Story pages">
                  <button
                    className="pagination-btn pagination-btn--prev"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Previous
                  </button>

                  <div className="pagination-pages" role="list">
                    {buildPageNumbers(currentPage, totalPages).map((p, i) =>
                      p === "..." ? (
                        <span key={`ellipsis-${i}`} className="pagination-ellipsis" aria-hidden="true">
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          className={`pagination-page${p === currentPage ? " pagination-page-active" : ""}`}
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default StoriesPage;