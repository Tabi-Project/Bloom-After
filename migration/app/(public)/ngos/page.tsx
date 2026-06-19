"use client";

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { fetchNgos, submitNgo } from '@/lib/ngos-api';
import { Ngo } from '@/types/ngo';
import NgoCard from '@/components/ngo/NgoCard';
import SuggestDrawer from '@/components/SuggestDrawer';
import { ngos as mockNgos } from '@/data/ngos'; 

const ITEMS_PER_PAGE = 6;

export default function NgosPage() {
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalLink, setModalLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); 
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Data
  useEffect(() => {
    const abortController = new AbortController();

    const loadNgos = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        /*
        const { data, pagination } = await fetchNgos({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          q: debouncedQuery,
          focus: activeFilter,
        }, { signal: abortController.signal });
        */
      
        setTimeout(() => {
          setNgos(mockNgos as unknown as Ngo[]); 
          setTotalPages(1);
          setIsLoading(false);
        }, 400);

      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('We could not load the directory right now. Please try again.');
          setIsLoading(false);
        }
      }
    };

    loadNgos();
    return () => abortController.abort();
  }, [debouncedQuery, activeFilter, currentPage]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!modalName.trim() || !modalLink.trim()) {
      setModalError('Please enter the organisation name and website link.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitNgo({ name: modalName, website: modalLink });
      setModalSuccess(true);
    } catch {
      setModalError('Could not submit right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalSuccess(false);
      setModalName('');
      setModalLink('');
      setModalError(null);
    }, 300); 
  };

  const buildPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="clinics-page">
      <main id="main-content">
        {/* Hero Section */}
        <section className="ngo-hero" aria-labelledby="ngo-hero-heading">
          <div className="ngo-hero-overlay" aria-hidden="true"></div>
          <div className="ngo-hero-content container">
            <h1 className="ngo-hero-title" id="ngo-hero-heading">NGOs & Support Networks</h1>
            <p className="ngo-hero-subtitle">
              Find verified foundations, community organisations, and NGOs offering dedicated support, education, and financial assistance for postpartum mental health.
            </p>
          </div>
        </section>

        {/* Search & Filters */}
        <div className="page-controls" role="search">
          <div className="container page-controls-inner">
            <div className="search-wrap">
              <span className="search-icon" aria-hidden="true"><Search size={16} /></span>
              <input 
                type="search" 
                className="search-input" 
                placeholder="Search by name, state, or service..." 
                aria-label="Search NGOs" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <nav className="filter-tabs" aria-label="Filter NGOs by focus area">
              <button className={`filter-btn ${activeFilter === '' ? 'active' : ''}`} onClick={() => handleFilterClick('')}>All</button>
              <button className={`filter-btn ${activeFilter === 'crisis intervention' ? 'active' : ''}`} onClick={() => handleFilterClick('crisis intervention')}>Crisis Support</button>
              <button className={`filter-btn ${activeFilter === 'financial aid' ? 'active' : ''}`} onClick={() => handleFilterClick('financial aid')}>Financial Aid</button>
              <button className={`filter-btn ${activeFilter === 'maternal welfare' ? 'active' : ''}`} onClick={() => handleFilterClick('maternal welfare')}>Maternal Welfare</button>
              <button className={`filter-btn ${activeFilter === 'education' ? 'active' : ''}`} onClick={() => handleFilterClick('education')}>Education & Stigma</button>
            </nav>
          </div>
        </div>

        {/* Directory Grid */}
        <section className="ngo-grid-section" aria-labelledby="ngo-list-label">
          <div className="container">
            <h2 className="visually-hidden" id="ngo-list-label">Organisations</h2>

            {isLoading ? (
              <div className="ngo-grid" aria-busy="true">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div className="skeleton-card" key={i}>
                    <div className="skeleton-avatar" style={{ height: '220px', width: '100%' }}></div>
                    <div className="skeleton-lines" style={{ padding: '20px' }}>
                      <div className="skeleton-line medium"></div>
                      <div className="skeleton-line short"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="error-card" role="alert">
                <p className="error-card-message">{error}</p>
                <button className="error-btn" type="button" onClick={() => setCurrentPage(1)}>Try Again</button>
              </div>
            ) : ngos.length === 0 ? (
              <p className="empty-state ngo-empty" role="status">
                <strong>No organisations found.</strong><br />
                Try a different search term or filter.
              </p>
            ) : (
              <>
                <div className="ngo-grid">
                  {ngos.map(ngo => (
                    <NgoCard key={ngo.id} ngo={ngo} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination-wrap">
                    <nav className="pagination" aria-label="NGO pages">
                      <button className="pagination-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</button>
                      <div className="pagination-pages" role="list">
                        {buildPageNumbers().map((p, i) => (
                          p === "..." ? (
                            <span key={`ellipsis-${i}`} className="pagination-ellipsis" aria-hidden="true">...</span>
                          ) : (
                            <button 
                              key={p} 
                              className={`pagination-page ${p === currentPage ? "pagination-page-active" : ""}`} 
                              onClick={() => setCurrentPage(p as number)}
                              aria-current={p === currentPage ? "page" : undefined}
                            >
                              {p}
                            </button>
                          )
                        ))}
                      </div>
                      <button className="pagination-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Submission Banner */}
        <section className="container">
          <div className="ngo-submission-banner">
            <h2>Know an organisation that should be here?</h2>
            <p>Community members can submit NGOs, support groups, or foundations for review. Help us expand our reach and support more mothers.</p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Submit an Organisation</button>
          </div>
        </section>
      </main>

      {/* Submission Modal Overlay */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} aria-hidden={!isModalOpen}>
        <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close" aria-label="Close modal" onClick={closeModal}>
            <X size={18} />
          </button>
          
          {!modalSuccess ? (
            <div id="modal-form-container">
              <h2 id="modal-title" className="modal-heading">Submit an Organisation</h2>
              <p className="modal-description">
                Thank you for helping us grow our support network. Please leave the organisation&apos;s details below, and our team will verify them before adding them to the directory.
              </p>
              <form className="modal-form" onSubmit={handleModalSubmit} noValidate>
                <div>
                  <label htmlFor="ngo-name" className="modal-label">Organisation Name</label>
                  <input type="text" id="ngo-name" className="modal-input" value={modalName} onChange={(e) => setModalName(e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="ngo-link" className="modal-label">Website or Social Link</label>
                  <input type="url" id="ngo-link" className="modal-input" placeholder="https://" value={modalLink} onChange={(e) => setModalLink(e.target.value)} required />
                </div>
                {modalError && <p className="error-card-message" role="alert" style={{ color: 'var(--color-danger)', fontSize: '14px' }}>{modalError}</p>}
                <button type="submit" className="btn btn-primary modal-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="modal-success-wrapper">
              <h3 className="modal-success-heading">Thank You!</h3>
              <p className="modal-success-text">Your submission has been securely sent to our team. We will review the organisation shortly.</p>
            </div>
          )}
        </div>
      </div>

      <SuggestDrawer />
    </div>
  );
}