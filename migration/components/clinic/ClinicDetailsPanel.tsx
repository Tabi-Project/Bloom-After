import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Clinic } from '../../types/clinic';

interface Props {
  clinic: Clinic | null;
  onClose: () => void;
  onSubmitReview: (id: string | number, rating: number, text: string) => Promise<void>;
}

export default function ClinicDetailsPanel({ clinic, onClose, onSubmitReview }: Props) {
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!clinic) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0 || reviewText.length < 10) return;
    setIsSubmitting(true);
    
    try {
      await onSubmitReview(clinic.id, reviewRating, reviewText);
      setIsSuccess(true);
    } catch {
      alert("Unable to submit review right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTag = (tag: string) => tag.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <>
      <div className="panel-backdrop" aria-hidden={false} onClick={onClose}></div>
      
      <aside className="slide-over-panel" aria-hidden={false} role="dialog" aria-labelledby="slide-panel-title">
        <header className="panel-header">
          <button className="btn-close" aria-label="Close details panel" onClick={onClose}>
            <X size={24} />
          </button>
        </header>
        
        <div className="panel-content">
          <h2 id="slide-panel-title" className="panel-clinic-name">{clinic.name}</h2>
          
          <address className="panel-contact-card mt-3" style={{ fontStyle: 'normal' }}>
            <p className="panel-clinic-address mb-3">{clinic.contact.address}</p>
            <a href={`tel:${clinic.contact.phone?.replace(/\s+/g, '')}`} className="panel-contact-phone">
              {clinic.contact.phone}
            </a>
            <p className="panel-contact-email">{clinic.contact.email}</p>
          </address>

          <div className="clinic-info-grid">
            {clinic.credentials && <div className="info-item"><span className="info-label">Credentials</span><span className="info-value">{clinic.credentials}</span></div>}
            {clinic.focus_areas.length > 0 && <div className="info-item"><span className="info-label">Expertise</span><span className="info-value text-capitalize">{clinic.focus_areas.map(formatTag).join(', ')}</span></div>}
            {clinic.languages && clinic.languages.length > 0 && <div className="info-item"><span className="info-label">Languages</span><span className="info-value">{clinic.languages.join(', ')}</span></div>}
            <div className="info-item"><span className="info-label">Hours</span><span className="info-value">{clinic.opening_hours}</span></div>
            <div className="info-item"><span className="info-label">Consultation Fee</span><span className="info-value">{clinic.fee_range}</span></div>
          </div>

          <div className="panel-contact-actions">
            <a href={`tel:${clinic.contact.phone?.replace(/\s+/g, '')}`} className="btn-action">Call</a>
            <a href={`mailto:${clinic.contact.email}`} className="btn-action">Email</a>
          </div>

          <section className="mt-4">
            <h3 className="panel-section-title">Services Offered</h3>
            <ul className="panel-services-list">
              {clinic.services.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </section>

          <section className="panel-reviews-section mt-4">
            <h3 className="panel-section-title">Private Feedback</h3>
            
            {!isReviewFormOpen && !isSuccess && (
              <div className="panel-review-intro">
                <p className="panel-review-intro-text">Have you visited this provider? Share your private feedback to help us maintain a safe directory.</p>
                <button className="btn-outline w-100 mt-2" onClick={() => setIsReviewFormOpen(true)}>Share Feedback</button>
              </div>
            )}

            {isReviewFormOpen && !isSuccess && (
              <div className="review-form-container mt-3">
                <form className="review-form" onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <label>Rate Your Experience</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={24} style={{ cursor: 'pointer' }} fill={star <= reviewRating ? "currentColor" : "none"} color={star <= reviewRating ? "var(--color-warning)" : "var(--color-gray-300)"} onClick={() => setReviewRating(star)} />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="review-text">Your Private Feedback</label>
                    <textarea id="review-text" rows={4} value={reviewText} onChange={(e) => setReviewText(e.target.value)} required minLength={10} />
                  </div>
                  <button type="submit" className={`btn-solid w-100 ${isSubmitting ? 'submitting-state' : ''}`} disabled={isSubmitting || reviewRating === 0 || reviewText.length < 10}>
                    {isSubmitting ? 'Submitting...' : 'Submit Confidentially'}
                  </button>
                </form>
              </div>
            )}

            {isSuccess && (
              <div className="review-success-state">
                <h4>Thank You!</h4>
                <p>Your feedback has been securely submitted.</p>
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}