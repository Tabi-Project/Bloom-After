import { fetchClinics } from '../data/clinics.js';
import { renderNavbar, initNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

const DOM = {
  listContainer: document.getElementById('clinics-list'),
  resultsCount: document.getElementById('results-count'),
  searchInput: document.getElementById('clinic-search'),
  locationBtn: document.getElementById('btn-location'),
  locationText: document.getElementById('btn-location-text'),
  loadMoreBtn: document.getElementById('btn-load-more'),
  filterRadios: document.querySelectorAll('.custom-radio input'),
  filterCheckboxes: document.querySelectorAll('.custom-checkbox input'),
  toggleList: document.getElementById('toggle-list'),
  toggleMap: document.getElementById('toggle-map'),
  listView: document.querySelector('.clinics-list-view'),
  mapView: document.querySelector('.clinics-map-view'),
  sidebar: document.getElementById('filter-sidebar'),
  mobileFilterBtn: document.getElementById('mobile-filter-btn'),
  closeFiltersBtn: document.getElementById('close-filters'),
  slidePanel: document.getElementById('clinic-details-panel'),
  panelBackdrop: document.getElementById('panel-backdrop'),
  panelContent: document.getElementById('panel-content'),
  closePanelBtn: document.getElementById('close-panel'),
};

let clinicsData = [];
let filteredClinics = [];
let map;
let markersLayer;
let isLocationActive = false;
let userLocation = null;

const INITIAL_LIMIT = 5;
let displayLimit = INITIAL_LIMIT;

function formatTag(tagString) {
  return tagString.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function init() {
  document.getElementById('navbar-root').innerHTML = renderNavbar('clinics');
  if (typeof initNavbar === 'function') initNavbar();
  document.getElementById('footer-root').innerHTML = renderFooter();

  DOM.listContainer.innerHTML = `
    <div class="skeleton-card"><div class="skeleton-avatar"></div><div class="skeleton-lines"><div class="skeleton-line medium"></div><div class="skeleton-line short"></div><div class="skeleton-line mt-4"></div></div></div>
  `.repeat(4);

  clinicsData = await fetchClinics();
  filteredClinics = [...clinicsData];

  initMap();
  applyFilters();
  bindEvents();
}

function renderList() {
  DOM.resultsCount.textContent = `Showing ${filteredClinics.length} providers`;

  if (filteredClinics.length === 0) {
    DOM.listContainer.innerHTML = `<p class="empty-state-msg">No clinics found matching your criteria.</p>`;
    DOM.loadMoreBtn.hidden = true;
    return;
  }

  const visibleClinics = filteredClinics.slice(0, displayLimit);

  DOM.listContainer.innerHTML = visibleClinics.map(clinic => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${clinic.coordinates[0]},${clinic.coordinates[1]}`;
    const distanceHtml = clinic.distance ? `<div class="card-distance">${clinic.distance.toFixed(1)} km away</div>` : '';

    let tags = clinic.focus_areas.slice(0, 2).map(formatTag);
    if (clinic.cost_type === 'free' || clinic.cost_type === 'subsidised') tags.unshift('Free / Subsidised');
    let tagHtml = tags.map(t => `<span class="tag-pill">${t}</span>`).join('');

    const statusBadge = clinic.accepting_new_patients
      ? `<span class="tag-pill status-accepting">Accepting New Patients</span>`
      : `<span class="tag-pill status-full">Currently Full</span>`;

    return `
      <article class="clinic-card" data-id="${clinic.id}" tabindex="0">
        <div class="card-avatar" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div class="card-header">
          <div class="card-header-flex">
            <span class="card-provider-type">${clinic.provider_type.replace('_', ' ')}</span>
            ${statusBadge}
          </div>
          <h3 class="card-title">${clinic.name}</h3>
          <p class="card-subtitle">${clinic.city}, ${clinic.state}</p>
        </div>
        ${distanceHtml}
        <div class="card-tags">${tagHtml}</div>
        <div class="card-fee">${clinic.fee_range} <span>per session</span></div>
        <div class="card-actions">
          <a href="${directionsUrl}" target="_blank" class="btn-outline action-btn">Directions</a>
          <button class="btn-solid btn-view-details action-btn" data-id="${clinic.id}">View Details</button>
        </div>
      </article>
    `;
  }).join('');

  DOM.loadMoreBtn.hidden = displayLimit >= filteredClinics.length;
}

function applyFilters() {
  const query = DOM.searchInput.value.toLowerCase();
  const activeProvider = document.querySelector('input[name="provider_type"]:checked').value;
  const activeMode = document.querySelector('input[name="consultation_mode"]:checked').value;
  const activeCosts = Array.from(document.querySelectorAll('input[data-filter-group="cost"]:checked')).map(cb => cb.value);
  const activeFocus = Array.from(document.querySelectorAll('input[data-filter-group="focus"]:checked')).map(cb => cb.value);

  filteredClinics = clinicsData.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(query) || c.city.toLowerCase().includes(query) || c.state.toLowerCase().includes(query);
    const matchesProvider = activeProvider === 'all' || c.provider_type === activeProvider;
    const matchesMode = activeMode === 'all' || c.consultation_mode === 'both' || c.consultation_mode === activeMode;
    const matchesCost = activeCosts.length === 0 ||
      (activeCosts.includes('free_subsidised') && (c.cost_type === 'free' || c.cost_type === 'subsidised')) ||
      (activeCosts.includes('private') && c.cost_type === 'private');
    const matchesFocus = activeFocus.length === 0 || activeFocus.some(focus => c.focus_areas.includes(focus));

    return matchesSearch && matchesProvider && matchesMode && matchesCost && matchesFocus;
  });

  if (userLocation) {
    filteredClinics.forEach(c => c.distance = calculateDistance(userLocation[0], userLocation[1], c.coordinates[0], c.coordinates[1]));
    filteredClinics.sort((a, b) => a.distance - b.distance);
  }

  displayLimit = INITIAL_LIMIT;
  renderList();
  renderMarkers();
}

function initMap() {
  map = L.map('leaflet-map').setView([9.0820, 8.6753], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  markersLayer = L.layerGroup().addTo(map);

  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 500);
}

function renderMarkers() {
  markersLayer.clearLayers();
  const bounds = L.latLngBounds();

  filteredClinics.forEach(clinic => {
    const marker = L.marker(clinic.coordinates).addTo(markersLayer);
    bounds.extend(clinic.coordinates);
    marker.on('click', () => openDetailsPanel(clinic.id));
  });

  if (filteredClinics.length > 0 && !userLocation) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

function toggleLocationState(forceState) {
  isLocationActive = forceState !== undefined ? forceState : !isLocationActive;

  if (isLocationActive) {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    DOM.locationText.textContent = `Locating...`;

    navigator.geolocation.getCurrentPosition((pos) => {
      userLocation = [pos.coords.latitude, pos.coords.longitude];
      DOM.locationText.textContent = `✕ Clear Location`;
      DOM.locationBtn.classList.add('active');

      applyFilters();
      map.setView(userLocation, 12);
      L.circleMarker(userLocation, { color: '#4f8a6f', radius: 8, fillOpacity: 1 }).addTo(map).bindPopup("You are here").openPopup();
    }, () => {
      toggleLocationState(false);
      alert("Unable to retrieve location. Please check browser permissions.");
    });
  } else {
    userLocation = null;
    DOM.locationText.textContent = `Use my current location`;
    DOM.locationBtn.classList.remove('active');

    map.eachLayer(layer => { if (layer instanceof L.CircleMarker) map.removeLayer(layer); });

    clinicsData.forEach(c => c.distance = null);
    clinicsData.sort((a, b) => a.id - b.id);
    applyFilters();
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function openDetailsPanel(id) {
  const clinic = clinicsData.find(c => c.id === Number(id));
  if (!clinic) return;

  const statusBadge = clinic.accepting_new_patients
    ? `<span class="tag-pill status-accepting">Accepting New Patients</span>`
    : `<span class="tag-pill status-full">Currently Full</span>`;

  const expertiseText = clinic.focus_areas && clinic.focus_areas.length > 0
    ? clinic.focus_areas.map(f => f.replace('_', ' ')).join(', ')
    : '';

  const detailsGrid = `
    <div class="clinic-info-grid">
      ${clinic.credentials ? `<div class="info-item"><span class="info-label">Credentials</span><span class="info-value">${clinic.credentials}</span></div>` : ''}
      ${expertiseText ? `<div class="info-item"><span class="info-label">Expertise</span><span class="info-value text-capitalize">${expertiseText}</span></div>` : ''}
      ${clinic.languages ? `<div class="info-item"><span class="info-label">Languages</span><span class="info-value">${clinic.languages.join(', ')}</span></div>` : ''}
      ${clinic.opening_hours ? `<div class="info-item"><span class="info-label">Hours</span><span class="info-value">${clinic.opening_hours}</span></div>` : ''}
      ${clinic.fee_range ? `<div class="info-item"><span class="info-label">Consultation Fee</span><span class="info-value">${clinic.fee_range}</span></div>` : ''}
    </div>
  `;

  const cleanPhone = clinic.contact.phone.replace(/\s+/g, '');
  const waPhone = cleanPhone.startsWith('0') ? '234' + cleanPhone.substring(1) : cleanPhone;

  DOM.panelContent.innerHTML = `
    <div class="panel-header-section">
      ${statusBadge}
      <h2 id="slide-panel-title" class="panel-clinic-name mt-2">${clinic.name}</h2>
      <p class="panel-clinic-address">${clinic.contact.address}</p>
    </div>

    ${detailsGrid}

    <div class="panel-contact-actions">
      <a href="tel:${cleanPhone}" class="btn-action">Call</a>
      <a href="https://wa.me/${waPhone}" target="_blank" class="btn-action">WhatsApp</a>
      <a href="mailto:${clinic.contact.email}" class="btn-action">Email</a>
    </div>

    <h3 class="panel-section-title mt-4">Services Offered</h3>
    <ul class="panel-services-list">
      ${clinic.services.map(s => `<li>${s}</li>`).join('')}
    </ul>

    <div class="panel-reviews-section mt-4">
      <h3 class="panel-section-title">Private Feedback</h3>
      <div class="panel-review-intro" id="review-intro-box">
        <p class="panel-review-intro-text">Have you visited this provider? Share your private feedback with the Bloom After team to help us maintain a safe directory. This will not be displayed publicly.</p>
        <button id="btn-reveal-form" class="btn-outline w-100 mt-2">Share Feedback</button>
      </div>

      <div class="review-form-container mt-3" id="review-form-container" hidden>
        <form id="review-form" class="review-form" novalidate>
          <div class="form-group">
            <label>Rate Your Experience</label>
            <div class="star-rating" id="star-rating">
              <span data-value="1">★</span><span data-value="2">★</span><span data-value="3">★</span><span data-value="4">★</span><span data-value="5">★</span>
            </div>
            <input type="hidden" id="review-rating" name="rating" required>
            <div class="error-msg" id="rating-error" hidden>Please select a rating.</div>
          </div>
          <div class="form-group">
            <label for="review-text">Your Private Feedback</label>
            <textarea id="review-text" rows="4" placeholder="Share how this provider supported you..." required minlength="10"></textarea>
            <div class="error-msg" id="text-error" hidden>Feedback must be at least 10 characters long.</div>
          </div>
          <button type="submit" id="btn-submit-review" class="btn-solid w-100">Submit Confidentially</button>
          <div class="review-success-state" id="review-success" hidden>
            <h4>Thank You!</h4>
            <p>Your feedback has been securely submitted to the Bloom After team. Thank you for helping us keep this directory safe.</p>
          </div>
        </form>
      </div>
    </div>
  `;

  DOM.slidePanel.setAttribute('aria-hidden', 'false');
  DOM.panelBackdrop.setAttribute('aria-hidden', 'false');

  setupReviewForm();
}

function setupReviewForm() {
  const btnReveal = document.getElementById('btn-reveal-form');
  const introBox = document.getElementById('review-intro-box');
  const formContainer = document.getElementById('review-form-container');
  const form = document.getElementById('review-form');
  const stars = document.querySelectorAll('#star-rating span');
  const ratingInput = document.getElementById('review-rating');
  const reviewText = document.getElementById('review-text');
  const btnSubmit = document.getElementById('btn-submit-review');
  const ratingError = document.getElementById('rating-error');
  const textError = document.getElementById('text-error');
  const successState = document.getElementById('review-success');

  btnReveal.addEventListener('click', () => {
    introBox.hidden = true;
    formContainer.hidden = false;
  });

  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const val = star.dataset.value;
      stars.forEach(s => s.classList.toggle('hover-active', s.dataset.value <= val));
    });
    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.classList.remove('hover-active'));
    });
    star.addEventListener('click', () => {
      const val = star.dataset.value;
      ratingInput.value = val;
      stars.forEach(s => s.classList.toggle('active', s.dataset.value <= val));
      ratingError.hidden = true;
    });
  });

  reviewText.addEventListener('input', () => {
    textError.hidden = true;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    if (!ratingInput.value) {
      ratingError.hidden = false;
      isValid = false;
    }

    if (reviewText.value.trim().length < 10) {
      textError.hidden = false;
      isValid = false;
    }

    if (isValid) {
      btnSubmit.textContent = "Submitting...";
      btnSubmit.disabled = true;
      btnSubmit.classList.add('submitting-state');

      setTimeout(() => {
        form.classList.add('submitted');
        successState.hidden = false;
      }, 1200);
    }
  });
}

function closePanel() {
  DOM.slidePanel.setAttribute('aria-hidden', 'true');
  DOM.panelBackdrop.setAttribute('aria-hidden', 'true');
}

function bindEvents() {
  DOM.searchInput.addEventListener('input', applyFilters);
  DOM.filterRadios.forEach(r => r.addEventListener('change', applyFilters));
  DOM.filterCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));

  DOM.locationBtn.addEventListener('click', () => toggleLocationState());

  DOM.loadMoreBtn.addEventListener('click', () => {
    displayLimit += INITIAL_LIMIT;
    renderList();
  });

  DOM.toggleList.addEventListener('click', () => {
    DOM.toggleList.classList.add('active'); DOM.toggleMap.classList.remove('active');
    DOM.listView.classList.add('active-view'); DOM.mapView.classList.remove('active-view');
  });

  DOM.toggleMap.addEventListener('click', () => {
    DOM.toggleMap.classList.add('active'); DOM.toggleList.classList.remove('active');
    DOM.mapView.classList.add('active-view'); DOM.listView.classList.remove('active-view');
    setTimeout(() => map.invalidateSize(), 100);
  });

  DOM.listContainer.addEventListener('click', (e) => {
    if (e.target.closest('.action-btn')) {
      if (e.target.closest('.btn-view-details')) openDetailsPanel(e.target.closest('.btn-view-details').dataset.id);
      return;
    }

    const card = e.target.closest('.clinic-card');
    if (card) {
      const clinic = clinicsData.find(c => c.id === Number(card.dataset.id));
      if (clinic && map) {
        map.flyTo(clinic.coordinates, 15, { duration: 0.5 });
        DOM.toggleMap.click();
      }
    }
  });

  DOM.closePanelBtn.addEventListener('click', closePanel);
  DOM.panelBackdrop.addEventListener('click', closePanel);

  DOM.mobileFilterBtn.addEventListener('click', () => DOM.sidebar.classList.add('open'));
  DOM.closeFiltersBtn.addEventListener('click', () => DOM.sidebar.classList.remove('open'));
}

init();