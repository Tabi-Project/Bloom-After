"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  BookOpen,
  Building2,
  CheckCircle2,
  Heart,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { DESTINATIONS } from "@/lib/content-management";
import { fetchAllContent, patchContentStatus } from "@/lib/api/content-management-api";
import { AdminAuthError } from "@/lib/api/admin-dashboard-api";
import { ContentDestination, ContentListItem, ContentStatus } from "@/types/content-management";

const PAGE_SIZE = 15;

const DESTINATION_ICONS: Record<ContentDestination, React.ReactNode> = {
  resource: <BookOpen size={24} strokeWidth={1.8} />,
  lifestyle: <Heart size={24} strokeWidth={1.8} />,
  ngo: <Users size={24} strokeWidth={1.8} />,
  clinic: <Building2 size={24} strokeWidth={1.8} />,
};

const STATUS_TABS: { label: string; value: ContentStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

const fmtDate = (iso: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

function ContentManagerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allContent, setAllContent] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<ContentStatus | "">("");
  const [currentType, setCurrentType] = useState<ContentDestination | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ContentListItem | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    const urlFilter = searchParams.get("filter") as ContentDestination | null;
    if (urlFilter && DESTINATIONS.some((d) => d.id === urlFilter)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing the type filter from the URL's ?filter= param
      setCurrentType(urlFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    fetchAllContent()
      .then((items) => {
        if (!cancelled) setAllContent(items);
      })
      .catch((error) => {
        if (error instanceof AdminAuthError) router.replace("/admin/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentQuery(searchInput);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const stats = useMemo(() => {
    const counts = { published: 0, draft: 0, archived: 0 };
    allContent.forEach((c) => {
      counts[c.status] += 1;
    });
    return counts;
  }, [allContent]);

  const filtered = useMemo(() => {
    const q = currentQuery.toLowerCase().trim();
    return allContent
      .filter((c) => {
        const matchStatus = !currentStatus || c.status === currentStatus;
        const matchType = !currentType || c.type === currentType;
        const matchQuery = !q || (c.title || "").toLowerCase().includes(q);
        return matchStatus && matchType && matchQuery;
      })
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  }, [allContent, currentStatus, currentType, currentQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 0;
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateItemStatus = (item: ContentListItem, nextStatus: ContentStatus) => {
    setAllContent((prev) => prev.map((c) => (c.id === item.id && c.type === item.type ? { ...c, status: nextStatus } : c)));
  };

  const handleStatusAction = async (item: ContentListItem, nextStatus: ContentStatus) => {
    const key = `${item.type}-${item.id}`;
    setActioningId(key);
    try {
      await patchContentStatus(item.type, item.id, nextStatus);
      updateItemStatus(item, nextStatus);
    } catch (error) {
      if (error instanceof AdminAuthError) router.replace("/admin/login");
    } finally {
      setActioningId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const item = pendingDelete;
    setPendingDelete(null);
    await handleStatusAction(item, "archived");
  };

  return (
    <main className="dashboard-content" id="main-content">
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">Content Management</h1>
          <p className="cm-page-subtitle">Create, edit, and manage all platform content from one place.</p>
        </div>
        <div className="cm-header-stats" aria-live="polite">
          <div className="cm-stat-pill">
            <span className="cm-stat-dot cm-dot-published"></span>
            {loading ? "—" : stats.published} published
          </div>
          <div className="cm-stat-pill">
            <span className="cm-stat-dot cm-dot-draft"></span>
            {loading ? "—" : stats.draft} drafts
          </div>
          <div className="cm-stat-pill">
            <span className="cm-stat-dot cm-dot-archived"></span>
            {loading ? "—" : stats.archived} archived
          </div>
        </div>
      </div>

      <section aria-labelledby="destinations-heading">
        <h2 className="cm-section-title" id="destinations-heading">
          Destinations
        </h2>
        <div className="cm-destination-grid">
          {DESTINATIONS.map((d) => {
            const count = allContent.filter((c) => c.type === d.id).length;
            return (
              <div
                className="cm-dest-card"
                key={d.id}
                style={{ "--dest-color": d.color, "--dest-bg": d.bgColor } as React.CSSProperties}
              >
                <div className="cm-dest-icon">{DESTINATION_ICONS[d.id]}</div>
                <div className="cm-dest-body">
                  <h3 className="cm-dest-title">{d.label}</h3>
                  <p className="cm-dest-desc">{d.desc}</p>
                  <p className="cm-dest-desc" style={{ marginTop: 4, fontWeight: 600 }}>
                    {loading ? "—" : count} {count === 1 ? "entry" : "entries"}
                  </p>
                </div>
                <div className="cm-dest-footer">
                  {d.newUrl ? (
                    <Link href={d.newUrl} className="cm-dest-new-btn" aria-label={`Add new ${d.label} entry`}>
                      <Plus size={14} strokeWidth={2.5} />
                      New
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="cm-dest-new-btn"
                      disabled
                      title="NGOs are added through public submissions — review them from the moderation queue."
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      New
                    </button>
                  )}
                  <button
                    className="cm-dest-import-btn"
                    aria-label={`Bulk import ${d.label}`}
                    disabled
                    title="Import coming soon"
                  >
                    <Upload size={14} strokeWidth={2} />
                    Import
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="cm-section-header">
          <h2 className="cm-section-title" id="recent-heading">
            All Content
          </h2>
          <div className="cm-table-controls">
            <div className="cm-search-wrap">
              <Search size={15} className="cm-search-icon" aria-hidden="true" />
              <input
                type="search"
                className="cm-search-input"
                placeholder="Search content…"
                aria-label="Search all content"
                autoComplete="off"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="cm-filter-tabs" role="group" aria-label="Filter by status">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.label}
                  className={`cm-filter-btn ${currentStatus === tab.value ? "active" : ""}`}
                  onClick={() => {
                    setCurrentStatus(tab.value);
                    setCurrentPage(1);
                  }}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <select
              className="cm-select"
              aria-label="Filter by content type"
              value={currentType}
              onChange={(e) => {
                setCurrentType(e.target.value as ContentDestination | "");
                setCurrentPage(1);
              }}
            >
              <option value="">All types</option>
              {DESTINATIONS.map((d) => (
                <option value={d.id} key={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="cm-table-wrap">
          <table className="cm-table" aria-label="All content entries">
            <thead>
              <tr className="cm-thead-row">
                <th className="cm-th cm-th-title">Title</th>
                <th className="cm-th">Type</th>
                <th className="cm-th">Status</th>
                <th className="cm-th cm-th-date">Updated</th>
                <th className="cm-th cm-th-actions">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody aria-live="polite">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr className="cm-table-row" aria-hidden="true" key={i}>
                      <td className="cm-td">
                        <div className="skeleton-line" style={{ width: 200 }}></div>
                      </td>
                      <td className="cm-td">
                        <div className="skeleton-line" style={{ width: 80, borderRadius: 999 }}></div>
                      </td>
                      <td className="cm-td">
                        <div className="skeleton-line" style={{ width: 70, borderRadius: 999 }}></div>
                      </td>
                      <td className="cm-td">
                        <div className="skeleton-line" style={{ width: 90 }}></div>
                      </td>
                      <td className="cm-td"></td>
                    </tr>
                  ))
                : pageItems.map((item) => {
                    const dest = DESTINATIONS.find((d) => d.id === item.type) || DESTINATIONS[0];
                    const editUrl = `/admin/content-manager/editor?type=${item.type}&id=${encodeURIComponent(item.id)}`;
                    const actionKey = `${item.type}-${item.id}`;
                    const isActioning = actioningId === actionKey;

                    return (
                      <tr className="cm-table-row" key={actionKey}>
                        <td className="cm-td cm-td-title">
                          <div className="cm-td-title-wrap">
                            <span className="cm-entry-title">{item.title || "Untitled"}</span>
                          </div>
                        </td>
                        <td className="cm-td">
                          <span
                            className="cm-type-badge"
                            style={{ "--dest-color": dest.color, "--dest-bg": dest.bgColor } as React.CSSProperties}
                          >
                            {dest.label}
                          </span>
                        </td>
                        <td className="cm-td">
                          <span className={`cm-status-badge cm-status-${item.status}`}>{item.status}</span>
                        </td>
                        <td className="cm-td cm-td-date">{fmtDate(item.updatedAt)}</td>
                        <td className="cm-td cm-td-actions">
                          <div className="cm-row-actions">
                            <Link
                              href={editUrl}
                              className="cm-action-icon"
                              title="Edit"
                              aria-label={`Edit ${item.title}`}
                            >
                              <Pencil size={15} strokeWidth={2} />
                            </Link>

                            {item.status !== "archived" ? (
                              <button
                                className="cm-action-icon"
                                disabled={isActioning}
                                onClick={() =>
                                  handleStatusAction(item, item.status === "published" ? "archived" : "published")
                                }
                                title={item.status === "published" ? "Archive" : "Publish"}
                                aria-label={`${item.status === "published" ? "Archive" : "Publish"} ${item.title}`}
                              >
                                {item.status === "published" ? (
                                  <Archive size={15} strokeWidth={2} />
                                ) : (
                                  <CheckCircle2 size={15} strokeWidth={2} />
                                )}
                              </button>
                            ) : (
                              <button
                                className="cm-action-icon"
                                disabled={isActioning}
                                onClick={() => handleStatusAction(item, "draft")}
                                title="Restore to draft"
                                aria-label={`Restore ${item.title} to draft`}
                              >
                                <RotateCcw size={15} strokeWidth={2} />
                              </button>
                            )}

                            <button
                              className="cm-action-icon cm-action-delete"
                              disabled={isActioning}
                              onClick={() => setPendingDelete(item)}
                              title="Delete"
                              aria-label={`Delete ${item.title}`}
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>

          {!loading && pageItems.length === 0 && (
            <p className="cm-empty" role="status">
              {currentQuery || currentStatus || currentType
                ? "No content matches your filters."
                : "No content yet. Use the destination cards above to add your first entry."}
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination-wrap" aria-live="polite">
            <nav className="pagination" aria-label="Content list pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-page ${p === currentPage ? "pagination-page-active" : ""}`}
                    aria-current={p === currentPage ? "page" : undefined}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next →
              </button>
            </nav>
          </div>
        )}
      </section>

      {pendingDelete && (
        <div className="cm-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="cm-modal">
            <h3 className="cm-modal-title" id="delete-modal-title">
              Delete content?
            </h3>
            <p className="cm-modal-body">&quot;{pendingDelete.title}&quot; will be archived. You can restore it later.</p>
            <div className="cm-modal-actions">
              <button className="btn cm-btn-cancel" type="button" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button className="btn cm-btn-delete" type="button" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ContentManagerPage() {
  return (
    <Suspense fallback={<div className="admin-auth-loader-spinner"></div>}>
      <ContentManagerContent />
    </Suspense>
  );
}
