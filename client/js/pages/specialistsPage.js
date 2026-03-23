/**
 
 * Main logic for the public specialist directory.
 */
import { specialists } from '../data/specialistsData.js';
import { createSpecialistCard } from '../components/SpecialistCard.js';

// DOM Elements
const grid = document.getElementById('specialist-grid');
const searchBtn = document.querySelector('.btn-search');
const specialtyFilter = document.getElementById('specialty-select');
const locationFilter = document.getElementById('location-select');

/**
 * Renders the grid of cards
 * @param {Array} data - Array of specialist objects
 */
function render(data) {
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="text-center" style="grid-column: 1/-1; padding: var(--space-16);">
                <p class="text-muted">No specialists found matching your search. Try different filters.</p>
            </div>`;
        return;
    }

    grid.innerHTML = data.map(s => createSpecialistCard(s)).join('');
}

/**
 * Filters data based on dropdown values
 */
function handleFilter() {
    const selectedSpec = specialtyFilter.value.toLowerCase();
    const selectedLoc = locationFilter.value.toLowerCase();

    const filtered = specialists.filter(s => {
        const matchSpec = (selectedSpec === 'all' || s.speciality.toLowerCase() === selectedSpec);
        const matchLoc = (selectedLoc === 'all' || s.location.toLowerCase() === selectedLoc);
        return matchSpec && matchLoc;
    });

    render(filtered);
}

// Event Listeners
searchBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    handleFilter();
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    render(specialists);
});