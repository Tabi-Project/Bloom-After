"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import { fetchClinics, submitClinicReview } from '@/lib/api/clinics-api'; 
import SuggestDrawer from '@/components/SuggestDrawer';
import ClinicCard from '@/components/clinic/ClinicCard';
import FilterSidebar, { FilterState } from '@/components/clinic/FilterSidebar';
import ClinicDetailsPanel from '@/components/clinic/ClinicDetailsPanel';
import { Clinic } from '@/types/clinic';

const INITIAL_LIMIT = 5;

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    providerType: 'all',
    cost: [],
    focus: [],
    mode: 'all'
  });

  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const abortController = new AbortController();
    
    const loadClinics = async () => {
      setIsLoading(true);
      try {
        const response = await fetchClinics({
          q: debouncedQuery,
          lat: userLocation?.[0],
          lng: userLocation?.[1],
          provider_type: filters.providerType === 'all' ? '' : filters.providerType,
          consultation_mode: filters.mode === 'all' ? '' : filters.mode,
          cost_type: filters.cost.length === 1 ? filters.cost[0] : '',
          focus: filters.focus,
          limit: 50,
        }, { signal: abortController.signal });
        
        setClinics(response.data || []);
        setDisplayLimit(INITIAL_LIMIT);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Failed to load clinics", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadClinics();
    return () => abortController.abort();
  }, [debouncedQuery, filters, userLocation]);

  const updateMapMarkers = useCallback((L: typeof import('leaflet')) => {
    if (!markersRef.current || !mapRef.current) return;
    
    markersRef.current.clearLayers();

    if (clinics.length === 0) return;

    const bounds = L.latLngBounds(clinics.map(c => c.coordinates));

    clinics.forEach(clinic => {
      const marker = L.marker(clinic.coordinates).addTo(markersRef.current!);
      marker.on('click', () => setSelectedClinic(clinic));
    });

    if (!userLocation) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [clinics, userLocation]);

  useEffect(() => {
    if (typeof window === 'undefined' || viewMode !== 'map' || mapRef.current) return;

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map('leaflet-map').setView([9.0820, 8.6753], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      
      mapRef.current = map;
      markersRef.current = L.layerGroup().addTo(map);
      updateMapMarkers(L);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [viewMode, updateMapMarkers]);

  useEffect(() => {
    if (mapRef.current && typeof window !== 'undefined') {
      import('leaflet').then((L) => updateMapMarkers(L));
    }
  }, [clinics, updateMapMarkers]);

  const toggleLocation = () => {
    if (userLocation) {
      setUserLocation(null);
      return;
    }
    if (!navigator.geolocation) return alert("Geolocation not supported.");

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert("Unable to retrieve location.");
      }
    );
  };

  const handleReviewSubmit = async (id: string | number, rating: number, text: string) => {
    await submitClinicReview(id, { rating, text });
  };

  return (
    <div className="clinics-page">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      
      <section 
        className="resources-hero"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1697578879484-3844013ff9c0?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
        aria-labelledby="resources-hero-heading"
      >
        <div className="resources-hero-content container">
          <h1 className="resources-hero-title" id="resources-hero-heading">Find support near you</h1>
          <p className="resources-hero-subtitle">Verified clinics and specialists ready to support you through your postpartum journey.</p>
        </div>
      </section>

      <form className="directory-search-bar container" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} aria-hidden="true" />
          <input 
            type="search" 
            id="clinic-search" 
            placeholder="Search by city, state, or area..." 
            aria-label="Search clinics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button type="button" className={`btn-location ${userLocation ? 'active' : ''}`} onClick={toggleLocation} disabled={isLocating}>
          <MapPin size={18} aria-hidden="true" />
          <span>{isLocating ? 'Locating...' : userLocation ? '✕ Clear Location' : 'Use my current location'}</span>
        </button>
      </form>

      <main id="main-content" className="directory-main container">
        
        <FilterSidebar 
          filters={filters} 
          setFilters={setFilters} 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />

        <section className="directory-content" aria-live="polite">
          <header className="content-controls">
            <p className="results-count">{isLoading ? 'Loading providers...' : `Showing ${clinics.length} providers`}</p>
            <nav className="view-toggles" aria-label="View toggle">
              <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List View</button>
              <button className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>Map View</button>
            </nav>
            <button className="btn-outline mobile-only" onClick={() => setIsMobileSidebarOpen(true)}>Filters</button>
          </header>

          <div className="view-container">
            <div className={`clinics-list-view ${viewMode === 'list' ? 'active-view' : ''}`}>
              <div className="clinics-list-inner">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <article className="skeleton-card" key={i}>
                      <div className="skeleton-avatar"></div>
                      <div className="skeleton-lines">
                        <div className="skeleton-line medium"></div><div className="skeleton-line short"></div><div className="skeleton-line mt-4"></div>
                      </div>
                    </article>
                  ))
                ) : clinics.length === 0 ? (
                  <p className="empty-state-msg">No clinics found matching your criteria.</p>
                ) : (
                  clinics.slice(0, displayLimit).map(clinic => (
                    <ClinicCard key={clinic.id} clinic={clinic} onClick={() => setSelectedClinic(clinic)} />
                  ))
                )}
              </div>
              
              {!isLoading && displayLimit < clinics.length && (
                <div className="load-more-container">
                  <button className="btn-outline" onClick={() => setDisplayLimit(d => d + INITIAL_LIMIT)}>Load More</button>
                </div>
              )}
            </div>

            <figure className={`clinics-map-view ${viewMode === 'map' ? 'active-view' : ''}`}>
              <div id="leaflet-map" className="actual-map"></div>
            </figure>
          </div>
        </section>
      </main>

      <ClinicDetailsPanel 
        key={selectedClinic?.id || 'empty'}
        clinic={selectedClinic} 
        onClose={() => setSelectedClinic(null)} 
        onSubmitReview={handleReviewSubmit} 
      />

      <SuggestDrawer />
    </div>
  );
}