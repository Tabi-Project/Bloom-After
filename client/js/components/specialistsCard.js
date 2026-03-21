
/**
 * Returns the HTML string for a single specialist card.
 */
export function createSpecialistCard(s) {
    return `
        <article class="specialist-card">
            <div class="card-image-wrapper" style="height: 200px; overflow: hidden; border-radius: var(--radius-md) var(--radius-md) 0 0;">
                <img src="${s.image_url || '../assets/images/default-doc.png'}" 
                     alt="${s.title}" 
                     style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="padding: var(--space-6);">
                <span class="badge" style="background: var(--color-brand-100); color: var(--color-brand-900); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    ${s.speciality}
                </span>
                <h3 style="margin: var(--space-3) 0 var(--space-1) 0; font-family: var(--font-heading); color: var(--color-brand-950);">
                    ${s.title}
                </h3>
                <p class="text-muted" style="font-size: 14px; margin-bottom: var(--space-4);">
                    ${s.clinic || 'Private Practice'}
                </p>
                <div style="margin-bottom: var(--space-6); font-size: 14px;">
                    <p style="margin: 2px 0;"> ${s.location}, Nigeria</p>
                </div>
                <button class="btn-search" style="width: 100%; height: 44px; font-size: 14px; padding: 0;">
                    View Profile
                </button>
            </div>
        </article>
    `;
}