import { createResourceCard, createSkeletonCard } from './resourceCard.js';
import { fetchRelatedResources } from '../data/resources-api.js';

export async function renderRelatedResources(container, resourceId, theme) {
  container.innerHTML = `
    <section class="related-resources" aria-labelledby="related-heading">
      <h2 class="related-heading" id="related-heading">More for You</h2>
      <div class="related-grid">
        ${[1, 2, 3].map(() => createSkeletonCard()).join('')}
      </div>
    </section>
  `;

  let related = [];
  try {
    related = await fetchRelatedResources(resourceId, theme);
  } catch (error) {
    container.innerHTML = "";
    return;
  }

  if (!related || related.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <section class="related-resources" aria-labelledby="related-heading">
      <h2 class="related-heading" id="related-heading">More for You</h2>
      <div class="related-grid">
        ${related.map(r => createResourceCard(r)).join('')}
      </div>
    </section>
  `;
}
