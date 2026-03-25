import { renderNavbar, initNavbar } from "../components/navbar.js";
import { renderTeamMembers } from "../components/contributions.js";
import {
  renderFeaturesCards,
  renderTrustBanner,
} from "../components/features.js";
import { renderFooter } from "../components/footer.js";
import { initSuggestDrawer } from "../components/suggest-drawer.js";
import { renderFAQs } from "../components/faqs.js";
document.getElementById("navbar-root").innerHTML = renderNavbar("home");
initNavbar();
document.getElementById("features-cards-root").innerHTML =
  renderFeaturesCards();
document.getElementById("trust-banner-root").innerHTML = renderTrustBanner();
renderTeamMembers();
renderFAQs();
document.getElementById("footer-root").innerHTML = renderFooter();
initSuggestDrawer();
