"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminUser } from "@/lib/admin-session";
import {
  AdminAuthError,
  fetchAdminModerationQueue,
  fetchAdminStats,
} from "@/lib/api/admin-dashboard-api";
import { AdminQueueItem, AdminStats } from "@/types/admin-dashboard";

interface StatCard {
  id: string;
  label: string;
  value: string;
  meta: string;
}

const fmtNumber = (value: number): string =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value || 0);

const fmtDate = (iso: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const buildStatCards = (stats: AdminStats | null): StatCard[] => {
  const resources = stats?.resources ?? { total: 0, published: 0, drafts: 0 };
  const stories = stats?.stories ?? { total: 0, pending: 0, approved: 0 };
  const ngos = stats?.ngos ?? { total: 0, pending: 0, approved: 0 };

  return [
    {
      id: "total-resources-card",
      label: "Total Resources",
      value: fmtNumber(resources.total),
      meta: "All content across every type",
    },
    {
      id: "published-resources-card",
      label: "Published",
      value: fmtNumber(resources.published),
      meta: "Live on Bloom After",
    },
    {
      id: "pending-stories-card",
      label: "Pending Stories",
      value: fmtNumber(stories.pending),
      meta: "Story submissions awaiting review",
    },
    {
      id: "pending-ngos-card",
      label: "Pending NGOs",
      value: fmtNumber(ngos.pending),
      meta: "NGO submissions awaiting review",
    },
  ];
};

const TYPE_LABEL: Record<AdminQueueItem["type"], string> = {
  story: "Story",
  ngo: "NGO",
  suggestion: "Suggestion",
};

const TYPE_BADGE_CLASS: Record<AdminQueueItem["type"], string> = {
  story: "mod-type-story",
  ngo: "mod-type-ngo",
  suggestion: "mod-type-suggestion",
};

const ROLES = [
  {
    id: "super-admin-role",
    name: "Super Admin",
    desc: "Manage approvals, users, publishing rules, and analytics visibility.",
  },
  {
    id: "content-editor-role",
    name: "Content Editor",
    desc: "Create, edit, archive, and prepare resource hub and directory content.",
  },
  {
    id: "moderator-role",
    name: "Moderator",
    desc: "Review stories, submissions, flagged content, and podcast suggestions.",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [queue, setQueue] = useState<AdminQueueItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(true);

  useEffect(() => {
    const user = getAdminUser();
    if (user?.name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing client-only sessionStorage into state after mount
      setAdminName(user.name);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const handleAuthError = (error: unknown) => {
      if (error instanceof AdminAuthError) {
        router.replace("/admin/login");
        return true;
      }
      return false;
    };

    fetchAdminStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(handleAuthError)
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    fetchAdminModerationQueue()
      .then((items) => {
        if (!cancelled) setQueue(items);
      })
      .catch(handleAuthError)
      .finally(() => {
        if (!cancelled) setQueueLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const statCards = buildStatCards(stats);
  const totalPending = queue.length;

  return (
    <main className="dashboard-content" id="dashboard-content">
      <section id="welcome-section">
        <div className="welcome-card">
          <div className="welcome-text">
            <p className="welcome-eyebrow">Admin Dashboard</p>
            <h3 className="welcome-title">Welcome, {adminName}</h3>
            <p className="welcome-subtitle">
              Manage content, reviews, and approvals from one place.
            </p>
          </div>
        </div>
      </section>

      <section id="overview-section" aria-busy={statsLoading}>
        <div className="dashboard-section-header">
          <span className="section-icon material-symbols-outlined">insights</span>
          <h2 className="dashboard-section-title">Overview</h2>
        </div>
        <div className="stats-grid">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div className="stat-card skeleton" aria-hidden="true" key={i}>
                  <div className="skeleton-line skeleton-label"></div>
                  <div className="skeleton-line skeleton-value"></div>
                  <div className="skeleton-line skeleton-meta"></div>
                </div>
              ))
            : statCards.map((card) => (
                <div className="stat-card" id={card.id} key={card.id}>
                  <div className="stat-label">{card.label}</div>
                  <div className={`stat-value${card.value.length > 10 ? " long" : ""}`}>
                    {card.value}
                  </div>
                  <div className="stat-meta muted">{card.meta}</div>
                </div>
              ))}
        </div>
      </section>

      <div className="queues-content-grid">
        <div className="queues-left-col" id="queues-section">
          <div className="dash-stories-widget" id="moderation-queue-widget">
            <div className="dash-stories-widget-header">
              <h3 className="dash-stories-widget-title">
                Moderation Queue{" "}
                {totalPending > 0 && (
                  <span className="dash-stories-badge">{totalPending} pending</span>
                )}
              </h3>
              <Link href="/admin/moderation/stories" className="dash-stories-view-all">
                View All →
              </Link>
            </div>
            <div className="stories-table-wrap">
              <table className="stories-table" aria-label="Recent moderation submissions">
                <thead>
                  <tr className="stories-thead-row">
                    <th className="stories-th">Type</th>
                    <th className="stories-th">Title / Excerpt</th>
                    <th className="stories-th">Status</th>
                    <th className="stories-th stories-th-right">Action</th>
                  </tr>
                </thead>
                <tbody aria-live="polite">
                  {queueLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr className="stories-table-row" aria-hidden="true" key={i}>
                        <td className="stories-td">
                          <div
                            className="skeleton-line"
                            style={{ width: 56, borderRadius: 999 }}
                          ></div>
                        </td>
                        <td className="stories-td">
                          <div
                            className="skeleton-line"
                            style={{ width: 160, marginBottom: 5 }}
                          ></div>
                          <div className="skeleton-line" style={{ width: 72 }}></div>
                        </td>
                        <td className="stories-td">
                          <div
                            className="skeleton-line"
                            style={{ width: 60, borderRadius: 999 }}
                          ></div>
                        </td>
                        <td className="stories-td"></td>
                      </tr>
                    ))
                  ) : queue.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="stories-table-empty">
                        No pending submissions. You&apos;re all caught up!
                      </td>
                    </tr>
                  ) : (
                    queue.slice(0, 4).map((item) => (
                      <tr className="stories-table-row" key={`${item.type}-${item.id}`}>
                        <td className="stories-td">
                          <span className={`mod-type-badge ${TYPE_BADGE_CLASS[item.type]}`}>
                            {TYPE_LABEL[item.type]}
                          </span>
                        </td>
                        <td className="stories-td stories-td-title">
                          <span className="mod-queue-title">{item.title}</span>
                          {item.submittedAt && (
                            <span className="mod-queue-date">{fmtDate(item.submittedAt)}</span>
                          )}
                        </td>
                        <td className="stories-td">
                          <span className={`mod-status-badge mod-status-${item.status}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="stories-td stories-td-action">
                          <Link href={item.reviewHref} className="stories-review-btn">
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mod-queue-footer">
              <span className="mod-queue-footer-label">Jump to:</span>
              <Link href="/admin/moderation/stories" className="mod-queue-type-link">
                Stories
              </Link>
              <Link href="/admin/moderation?type=ngo" className="mod-queue-type-link">
                NGOs
              </Link>
              <Link href="/admin/moderation?type=media" className="mod-queue-type-link">
                Suggestions
              </Link>
            </div>
          </div>
        </div>

        <section id="content-section">
          <div className="dashboard-section-header">
            <span className="section-icon material-symbols-outlined">article</span>
            <h2 className="dashboard-section-title">Content Management</h2>
          </div>
          <div className="action-stack">
            <Link
              href="/admin/content-manager/editor?type=resource"
              className="action-row"
              id="create-resource-action"
            >
              <span className="action-row-icon material-symbols-outlined">post_add</span>
              <span className="action-row-label">Create Resource Article</span>
              <span className="action-row-chevron material-symbols-outlined">chevron_right</span>
            </Link>

            <Link
              href="/admin/content-manager"
              className="action-row"
              id="update-directory-action"
            >
              <span className="action-row-icon material-symbols-outlined">folder_open</span>
              <span className="action-row-label">Manage All Content</span>
              <span className="action-row-chevron material-symbols-outlined">chevron_right</span>
            </Link>

            <Link
              href="/admin/content-manager?filter=published"
              className="action-row"
              id="featured-content-action"
            >
              <span className="action-row-icon material-symbols-outlined">star</span>
              <span className="action-row-label">Update Featured Content</span>
              <span className="action-row-chevron material-symbols-outlined">chevron_right</span>
            </Link>

            <Link
              href="/admin/content-manager?filter=ngo"
              className="action-row"
              id="ngo-directory-action"
            >
              <span className="action-row-icon material-symbols-outlined">diversity_3</span>
              <span className="action-row-label">NGO Directory</span>
              <span className="action-row-chevron material-symbols-outlined">chevron_right</span>
            </Link>

            <Link
              href="/admin/content-manager?filter=clinic"
              className="action-row"
              id="clinic-directory-action"
            >
              <span className="action-row-icon material-symbols-outlined">local_hospital</span>
              <span className="action-row-label">Clinic Directory</span>
              <span className="action-row-chevron material-symbols-outlined">chevron_right</span>
            </Link>
          </div>
        </section>
      </div>

      <section id="roles-section">
        <div className="dashboard-section-header">
          <span className="section-icon material-symbols-outlined">groups</span>
          <h2 className="dashboard-section-title">User Access</h2>
        </div>
        <div className="role-grid">
          {ROLES.map((role) => (
            <div className="role-card" id={role.id} key={role.id}>
              <div className="role-name">{role.name}</div>
              <div className="role-desc">{role.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
