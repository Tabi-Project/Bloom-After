"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";
import type { Submission, TypeConfig, SubmissionStatus } from "@/types/moderation";

const PAGE_SIZE = 15;

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ModerationSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="mod-submission-card mod-row-skeleton"
          aria-hidden="true"
        >
          <div className="mod-sub-thumb skeleton-block" />
          <div className="mod-sub-body" style={{ flex: 1 }}>
            <div className="skeleton-line" style={{ width: "40%", marginBottom: 8 }} />
            <div className="skeleton-line" style={{ width: "80%" }} />
            <div className="skeleton-line" style={{ width: "60%" }} />
          </div>
        </div>
      ))}
    </>
  );
}

function StatsPills({ items }: { items: Submission[] }) {
  const counts = { pending: 0, approved: 0, rejected: 0 };
  items.forEach((s) => {
    if (s.status in counts) counts[s.status as keyof typeof counts]++;
  });

  return (
    <div id="mod-header-stats" className="mod-header-stats" aria-live="polite">
      <span className="mod-stat-pill mod-stat-pending">{counts.pending} pending</span>
      <span className="mod-stat-pill mod-stat-approved">{counts.approved} approved</span>
      <span className="mod-stat-pill mod-stat-rejected">{counts.rejected} rejected</span>
    </div>
  );
}

interface SubmissionCardProps {
  item: Submission;
  cfg: TypeConfig;
  onAction: (id: string, action: "approve" | "reject") => Promise<void>;
}

function SubmissionCard({ item, cfg, onAction }: SubmissionCardProps) {
  const id = item._id || item.id || "";
  const [acting, setActing] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setActing(true);
    await onAction(id, action);
    setActing(false);
  };

  return (
    <article
      className="mod-submission-card"
      data-id={id}
      data-status={item.status}
    >
      {/* Thumbnail */}
      {cfg.hasImage && (
        item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            className="mod-sub-thumb"
            loading="lazy"
          />
        ) : (
          <div className="mod-sub-thumb mod-sub-thumb-placeholder" aria-hidden="true" />
        )
      )}

      <div className="mod-sub-body">
        <div className="mod-sub-top">
          <div className="mod-sub-meta">
            <span className="mod-sub-title">{item.title || "Untitled"}</span>

            {/* Type-specific tags */}
            {(item.speciality || item.mediaType || item.location) && (
              <div className="mod-sub-tags">
                {item.speciality && (
                  <span className="mod-sub-tag">{item.speciality}</span>
                )}
                {item.mediaType && (
                  <span className="mod-sub-tag">{item.mediaType}</span>
                )}
                {item.location && (
                  <span className="mod-sub-tag">{item.location}</span>
                )}
              </div>
            )}
          </div>

          <div className="mod-sub-right">
            <span className={`mod-status-badge mod-status-${item.status}`}>
              {item.status}
            </span>
            {item.submittedAt && (
              <span className="mod-sub-date">{formatDate(item.submittedAt)}</span>
            )}
          </div>
        </div>

        <p className="mod-sub-desc">{item.description || ""}</p>

        <div className="mod-sub-footer">
          {item.email && (
            <span className="mod-sub-email">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="2,4 12,13 22,4" />
              </svg>
              {item.email}
            </span>
          )}

          {cfg.hasLink && item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mod-sub-link"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View link
            </a>
          )}
        </div>
      </div>

      <div className="mod-row-actions">
        <a
          href={`${cfg.editPage}/${id}`}
          className="mod-action-btn mod-action-review"
        >
          Review
        </a>
        {item.status === "pending" && (
          <>
            <button
              className="mod-action-btn mod-action-approve"
              onClick={() => handleAction("approve")}
              disabled={acting}
            >
              {acting ? "…" : "Approve"}
            </button>
            <button
              className="mod-action-btn mod-action-reject"
              onClick={() => handleAction("reject")}
              disabled={acting}
            >
              {acting ? "…" : "Reject"}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

interface ModerationListProps {
  cfg: TypeConfig;
}

export default function ModerationList({ cfg }: ModerationListProps) {
  const [allItems, setAllItems] = useState<Submission[]>([]);
  const [filtered, setFiltered] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<SubmissionStatus | "">("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch items
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const res = await api.get<{
          data?: { items?: Submission[]; data?: Submission[] } | Submission[];
        }>(cfg.apiEndpoint);
        const data =
          (res?.data as { items?: Submission[] })?.items ||
          (res?.data as { data?: Submission[] })?.data ||
          (Array.isArray(res?.data) ? (res.data as Submission[]) : null);

        if (Array.isArray(data) && data.length) {
          setAllItems(data);
        } else {
          setAllItems(cfg.mockItems);
        }
      } catch {
        setAllItems(cfg.mockItems);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [cfg]);

  // Apply filters whenever allItems, status, or query changes
  const applyFilters = useCallback(
    (items: Submission[], status: SubmissionStatus | "", query: string) => {
      const q = query.toLowerCase().trim();
      const result = items
        .filter((item) => {
          const matchStatus = !status || item.status === status;
          const matchQuery =
            !q ||
            [item.title || "", item.description || "", item.email || ""].some(
              (f) => f.toLowerCase().includes(q)
            );
          return matchStatus && matchQuery;
        })
        .sort(
          (a, b) =>
            new Date(b.submittedAt || 0).getTime() -
            new Date(a.submittedAt || 0).getTime()
        );

      setFiltered(result);
      setCurrentPage(1);
    },
    []
  );

  useEffect(() => {
    applyFilters(allItems, currentStatus, currentQuery);
  }, [allItems, currentStatus, currentQuery, applyFilters]);

  // Inline approve / reject
  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      await api.patch(`${cfg.apiEndpoint}/${id}`, {
        status: action === "approve" ? "approved" : "rejected",
      });
      setAllItems((prev) =>
        prev.map((item) =>
          (item._id || item.id) === id
            ? { ...item, status: action === "approve" ? "approved" : "rejected" }
            : item
        )
      );
    } catch {
      // button re-enables via local state in SubmissionCard
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setCurrentQuery(e.target.value);
    }, 250);
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const STATUS_TABS: { label: string; value: SubmissionStatus | "" }[] = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <>
      <div id="mod-list-header">
        <div className="mod-page-header">
          <div>
            <h1 className="mod-page-title">{cfg.label}</h1>
            <p className="mod-page-subtitle">{cfg.subtitle}</p>
          </div>
          <StatsPills items={allItems} />
        </div>
      </div>

      <div className="mod-filters" role="tablist" aria-label="Filter by status">
        {STATUS_TABS.map(({ label, value }) => (
          <button
            key={value}
            className={`mod-filter-tab${currentStatus === value ? " active" : ""}`}
            role="tab"
            aria-selected={currentStatus === value}
            data-status={value}
            aria-controls="mod-list"
            onClick={() => setCurrentStatus(value as SubmissionStatus | "")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mod-search-wrap">
        <svg
          className="mod-search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          id="mod-search"
          className="mod-search-input"
          placeholder="Search submissions…"
          aria-label="Search submissions"
          autoComplete="off"
          onChange={handleSearchChange}
        />
      </div>

      <div
        id="mod-list"
        className="mod-submission-list"
        role="tabpanel"
        aria-live="polite"
        aria-atomic="false"
      >
        {loading ? (
          <ModerationSkeleton />
        ) : pageItems.length > 0 ? (
          pageItems.map((item) => (
            <SubmissionCard
              key={item._id || item.id}
              item={item}
              cfg={cfg}
              onAction={handleAction}
            />
          ))
        ) : null}
      </div>

      {/* Empty state */}
      {!loading && pageItems.length === 0 && (
        <p id="mod-empty" className="mod-empty" role="status">
          {currentQuery || currentStatus
            ? "No submissions match your search or filter."
            : "No submissions yet."}
        </p>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div id="mod-pagination" className="pagination-wrap" aria-live="polite">
          <nav className="pagination" aria-label="Submission list pagination">
            <button
              className="pagination-btn"
              onClick={() => {
                setCurrentPage((p) => p - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>

            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination-page${p === currentPage ? " pagination-page-active" : ""}`}
                  onClick={() => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-current={p === currentPage ? "page" : undefined}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn"
              onClick={() => {
                setCurrentPage((p) => p + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </nav>
        </div>
      )}
    </>
  );
}