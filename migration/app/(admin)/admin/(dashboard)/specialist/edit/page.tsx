"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { AdminAPiResponse, AdminSubmissionItem } from '@/types/admin';
import SubmissionEditRenderer from '@/components/admin/SubmissionEditRenderer';

interface ActionPayload {
  moderatorNote?: string;
  notificationEmail?: string;
  rejectionMessage?: string;
  publishDestination?: string;
}

function SpecialistEditContent() {
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
        const res = (await api.get(`/api/v1/admin/specialists/${id}`)) as AdminAPiResponse;
        
        console.log("RAW API RESPONSE:", res);
        
        const rawResponse = res.data;
        console.log("RAW RESPONSE DATA:", rawResponse);
        
        const data = rawResponse?.specialist;
        if (!data) throw new Error("Not found");
        
        const itemData = data as AdminSubmissionItem & { _id?: string };
        
        setItem({ ...itemData, id: itemData._id || itemData.id || id });
      } catch (err) {
        console.error("API FETCH ERROR:", err);
        
        const mockData: AdminSubmissionItem = {
          id: id || 's1',
          name: 'Dr. Funmi Adeyemi',
          description: 'Perinatal psychiatrist with 12 years experience. Available in-person and virtually.',
          contact: {
            email: 'funmi@example.com',
            phone: '+234 800 000 0000',
          },
          providerType: 'specialist',
          consultationMode: 'Both In-person and Virtual',
          costType: 'paid',
          focusAreas: ['Perinatal Psychiatry'],
          status: 'pending',
          isOpen247: false,
          coverImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=70', 
          city: 'Lagos',
          state: 'Nigeria',
          updatedAt: new Date().toISOString()
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
      await api.patch(`/api/v1/admin/specialists/${item.id}`, { status, ...payload });
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
      await api.patch(`/api/v1/admin/specialists/${item.id}`, { moderatorNote: note });
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
        <Link href="/admin/moderation?type=specialist" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>
          Back to Specialists
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/admin/moderation?type=specialist" className="mod-back-link">
        <ArrowLeft size={16} /> Back to Specialists
      </Link>

      {feedback && (
        <div className={`mod-action-feedback mod-feedback-${feedback.type}`} style={{ marginBottom: '20px', padding: '12px', borderRadius: '6px' }}>
          {feedback.message}
        </div>
      )}

      <SubmissionEditRenderer 
        item={item} 
        type="specialist" 
        isActioning={isActioning}
        onAction={handleAction}
        onSaveNote={handleSaveNote}
      />
    </>
  );
}

export default function SpecialistEditPage() {
  return (
    <main className="dashboard-content" id="main-content">
      <Suspense fallback={<div className="admin-auth-loader-spinner"></div>}>
        <SpecialistEditContent />
      </Suspense>
    </main>
  );
}