import { renderNavbar, initNavbar } from "../components/navbar.js";
import { renderTeamMembers } from "../components/contributions.js";
import {
  renderFeaturesCards,
  renderTrustBanner,
} from "../components/features.js";
import { renderFooter } from "../components/footer.js";
import { initSuggestDrawer } from "../components/suggest-drawer.js";
import { renderFAQs } from "../components/faqs.js";
import { fetchResources } from "../data/resources-api.js";
import { createResourceCard } from "../components/resourceCard.js";
document.getElementById("navbar-root").innerHTML = renderNavbar("home");
initNavbar();
document.getElementById("features-cards-root").innerHTML =
  renderFeaturesCards();
document.getElementById("trust-banner-root").innerHTML = renderTrustBanner();
renderTeamMembers();
renderFAQs();
document.getElementById("footer-root").innerHTML = renderFooter();
initSuggestDrawer();

async function renderVoicesFromResources() {
  const listRoot = document.getElementById("voices-card-list");
  if (!listRoot) return;

  try {
    const { data } = await fetchResources({
      page: 1,
      limit: 3,
      content_type: "media",
      published: true,
    });
    const latest = data.slice(0, 3);

    if (!latest.length) return;

    listRoot.innerHTML = latest.map((r) => createResourceCard(r)).join("");
  } catch (e) {
    // leave existing static content if fetch fails
  }
}

renderVoicesFromResources();
