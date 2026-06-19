"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { fetchLifestyle } from '@/lib/api/lifestyle-api';
import { Lifestyle, FetchLifestyleParams } from '@/types/lifestyle';
import LifestyleCard from '@/components/lifestyle/LifestyleCard';

const ITEMS_PER_PAGE = 6;

export default function LifestylePage() {
  const [items, setItems] = useState<Lifestyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetching utilizing your exact FetchLifestyleParams keys
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams: FetchLifestyleParams = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          category: activeFilter || undefined,
          q: debouncedQuery || undefined,
          published: true
        };

        const response = await fetchLifestyle(queryParams);
        
        // Safely casting to matching verified Lifestyle layouts
        const fetchedData = (response?.data || []) as unknown as Lifestyle[];
        setItems(fetchedData);
        setTotalPages(response?.pagination?.totalPages || 0);
        setIsLoading(false);
      } catch (err) {
        setError('Please try again shortly.');
        setIsLoading(false);
      }
    };

    loadData();
  }, [debouncedQuery, activeFilter, currentPage]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  return (
    <div className="lifestyle-directory-page">
      <main id="main-content">
        <section 
          className="ngo-hero" 
          style={{ backgroundImage: `linear-gradient(rgba(0, 38, 38, 0.75), rgba(0, 38, 38, 0.75)), url('https://unsplash.com')` }} 
        >
          <div className="ngo-hero-content container">
            <h1 className="ngo-hero-title">Lifestyle & Medical Interventions</h1>
            <p className="ngo-hero-subtitle">A holistic approach combining supportive lifestyle adjustments with evidence-based care.</p>
          </div>
        </section>

        <section className="page-controls" aria-label="Search and filter">
          <div className="container page-controls-inner">
            <div className="search-wrap" style={{ position: 'relative' }}>
              <span className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                <Search size={16} />
              </span>
              <input 
                type="search" 
                className="search-input" 
                placeholder="Search strategies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
            <nav className="filter-tabs" aria-label="Category filters">
              <button className={`filter-btn ${activeFilter === '' ? 'active' : ''}`} onClick={() => handleFilterClick('')}>All</button>
              <button className={`filter-btn ${activeFilter === 'lifestyle' ? 'active' : ''}`} onClick={() => handleFilterClick('lifestyle')}>Lifestyle</button>
              <button className={`filter-btn ${activeFilter === 'medical' ? 'active' : ''}`} onClick={() => handleFilterClick('medical')}>Medical</button>
            </nav>
          </div>
        </section>

        <section className="resources-grid-section container" aria-label="Interventions Grid">
          {isLoading ? (
            <div id="lm-grid" className="lm-cards-grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div className="skeleton-card" key={i}>
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line full" style={{ height: '28px' }}></div>
                  <div className="skeleton-line full"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-card"><p className="error-card-message">{error}</p></div>
          ) : items.length === 0 ? (
            <p className="empty-state"><strong>No strategies found.</strong></p>
          ) : (
            <>
              <div id="lm-grid" className="lm-cards-grid">
                {items.map((item) => (
                  <LifestyleCard key={item.id} item={item as any} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination-wrap">
                  <nav className="pagination">
                    <button className="pagination-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</button>
                    <div className="pagination-pages">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} className={`pagination-page ${p === currentPage ? 'pagination-page-active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                      ))}
                    </div>
                    <button className="pagination-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</button>
                  </nav>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}