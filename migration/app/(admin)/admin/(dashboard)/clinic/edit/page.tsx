"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { AdminSubmissionItem, AdminAPiResponse} from '@/types/admin';
import SubmissionEditRenderer from '@/components/admin/SubmissionEditRenderer';

interface ActionPayload {
  moderatorNote?: string;
  notificationEmail?: string;
  rejectionMessage?: string;
  publishDestination?: string;
}

function ClinicEditContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [item, setItem] = useState<AdminSubmissionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (!id) {
      setTimeout(() => {
        setError('No submission ID provided.');
        setIsLoading(false);
      }, 0);
      return;
    }

    const fetchItem = async () => {
      try {
        const res = (await api.get(`/api/v1/admin/clinics/${id}`)) as AdminAPiResponse;

        console.log("RAW API RESPONSE:", res);
        
        const rawResponse = res.data;

        console.log("RAW RESPONSE DATA:", rawResponse);
        if (!rawResponse || !rawResponse.clinic) throw new Error("Not found");
        
        const itemData = rawResponse.clinic as AdminSubmissionItem & { cl_id?: string };
        console.log("PROCESSED ITEM DATA:", itemData);
        
        setItem({ ...itemData, id: itemData.id || id });
      } catch (err) {
        console.error("API FETCH ERROR:", err);
        
        const mockData: AdminSubmissionItem = {
          id: id || "69b4b28a4c08ba738961b30a",
          name: "LUTH Mental Health Unit",
          description: "The LUTH Mental Health Unit provides comprehensive mental health services, including therapy, counselling, and medication management. Our team of experienced professionals is dedicated to supporting patients through their mental health journey.",
          contact: {
            phone: '0800 111 2222',
            email: 'psych@luth.gov.ng',
            address: 'Ishaga Road, Idi-Araba, Lagos'
          },
          coordinates: [6.5204, 3.349],
          providerType: "clinic",
          consultationMode: "both",
          costType: "subsidised",
          focusAreas: ['perinatal_anxiety', 'psychiatric_medication'],
          status: "published",
          services: ['Therapy / Counselling', 'Medication Management'],
          languages: ["English", "Yoruba"],
          acceptingNewPatients: true,
          openingHours: "Open 24/7",
          isOpen247: true,
          website: "https://www.luth.org.ng/mental-health-unit",
          coverImage: "",
          credentials: "MBBS, FMCPsych",
          feeRange: "₦5,000 - ₦15,000",
          rating: 4.8,
          reviewCount: 124,
          state: "Lagos",
          city: "Idi-Araba"
        };
        
        setItem(mockData);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleAction = async (status: AdminSubmissionItem['status'], payload: ActionPayload) => {
    if (!item) return;
    setIsActioning(true);
    setFeedback(null);

    try {
      await api.patch(`/api/v1/admin/clinics/${item.id}`, { status, ...payload });
      setItem(prev => prev ? { ...prev, status } : null);
      
      const msgs: Record<string, string> = {
        approved: 'Approved and queued for publishing.',
        removed: 'Submission revoked and marked as removed.',
        deleted: 'Submission permanently deleted.',
        rejected: 'Rejected. Submitter will be notified if email provided.'
      };

      setFeedback({ 
        message: msgs[status] || 'Action successful', 
        type: status === 'approved' ? 'success' : status === 'deleted' ? 'error' : 'info' 
      });
    } catch {
      setFeedback({ message: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setIsActioning(false);
    }
  };

  const handleSaveNote = async (note: string) => {
    if (!item) return;
    setIsActioning(true);
    try {
      await api.patch(`/api/v1/admin/clinics/${item.id}`, { moderatorNote: note });
      setFeedback({ message: 'Note saved.', type: 'success' });
    } catch {
      setFeedback({ message: 'Failed to save note.', type: 'error' });
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) {
    return <div className="admin-auth-loader-spinner" style={{ margin: '40px auto' }}></div>;
  }

  if (error || !item) {
    return (
      <div className="mod-error-state" role="alert">
        <AlertCircle size={48} color="var(--color-danger)" style={{ margin: '0 auto 16px' }} />
        <h2>Something went wrong</h2>
        <p className="mod-error-message">{error || 'Submission not found.'}</p>
        <Link href="/admin/moderation?type=clinic" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>
          Back to Clinics
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/admin/moderation?type=clinic" className="mod-back-link">
        <ArrowLeft size={16} /> Back to Clinics
      </Link>

      {feedback && (
        <div className={`mod-action-feedback mod-feedback-${feedback.type}`} style={{ marginBottom: '20px', padding: '12px', borderRadius: '6px' }}>
          {feedback.message}
        </div>
      )}

      <SubmissionEditRenderer 
        item={item} 
        type="clinic" 
        isActioning={isActioning}
        onAction={handleAction}
        onSaveNote={handleSaveNote}
      />
    </>
  );
}

export default function ClinicEditPage() {
  return (
    <main className="dashboard-content" id="main-content">
      <Suspense fallback={<div className="admin-auth-loader-spinner"></div>}>
        <ClinicEditContent />
      </Suspense>
    </main>
  );
}