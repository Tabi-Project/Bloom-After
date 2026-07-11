"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Ngo } from "@/types/ngo";
import { fetchAdminNgoById, updateAdminNgo } from "@/lib/ngos-api";
import NgoEditRenderer from "@/components/admin/NgoEditRenderer";

function NgoEditContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [ngo, setNgo] = useState<Ngo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    if (!id) {
      setTimeout(() => {
        setError("No NGO ID provided.");
        setIsLoading(false);
      }, 0);
      return;
    }

    fetchAdminNgoById(id)
      .then((data) => {
        if (!data) {
          setError("NGO not found or has been removed.");
          return;
        }
        setNgo(data);
      })
      .catch(() => setError("Could not load this NGO right now."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (
    status: "approved" | "rejected" | undefined,
    fields: { mission: string; phone: string; email: string; moderatorNote: string }
  ) => {
    if (!ngo || !id) return;
    setIsActioning(true);
    setFeedback(null);

    try {
      const { ngo: updated, emailNotification } = await updateAdminNgo(id, {
        status,
        mission: fields.mission,
        contact: { phone: fields.phone, email: fields.email },
        moderatorNote: fields.moderatorNote,
        notificationEmail: fields.email || undefined,
      });

      setNgo(updated);

      const emailMessage = emailNotification.sent
        ? " Notification email sent."
        : emailNotification.attempted
          ? " Notification email not sent."
          : "";

      setFeedback({
        message: status ? `NGO ${status}.${emailMessage}` : "Changes saved.",
        type: status === "rejected" ? "info" : "success",
      });
    } catch (err) {
      setFeedback({ message: err instanceof Error ? err.message : "Could not update NGO right now.", type: "error" });
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) {
    return <div className="admin-auth-loader-spinner" style={{ margin: "40px auto" }}></div>;
  }

  if (error || !ngo) {
    return (
      <div className="mod-error-state" role="alert">
        <AlertCircle size={48} color="var(--color-danger)" style={{ margin: "0 auto 16px" }} />
        <h2>Something went wrong</h2>
        <p className="mod-error-message">{error || "NGO not found."}</p>
        <Link href="/admin/moderation/ngos" className="btn btn-primary" style={{ marginTop: "24px", display: "inline-block" }}>
          Back to NGOs
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/admin/moderation/ngos" className="mod-back-link">
        <ArrowLeft size={16} /> Back to NGOs
      </Link>

      {feedback && (
        <div className={`mod-action-feedback mod-feedback-${feedback.type}`} style={{ marginBottom: "20px", padding: "12px", borderRadius: "6px" }}>
          {feedback.message}
        </div>
      )}

      <NgoEditRenderer ngo={ngo} isActioning={isActioning} onSubmit={handleSubmit} />
    </>
  );
}

export default function NgoEditPage() {
  return (
    <main className="dashboard-content" id="main-content">
      <Suspense fallback={<div className="admin-auth-loader-spinner"></div>}>
        <NgoEditContent />
      </Suspense>
    </main>
  );
}
