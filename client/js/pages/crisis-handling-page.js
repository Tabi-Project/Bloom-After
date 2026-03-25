import { renderNavbar, initNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { initSuggestDrawer } from "../components/suggest-drawer.js";
import {
  criticalEmergencies,
  highDistress,
  urgentSituations,
} from "../data/crisis-handling.js";

document.getElementById("navbar-root").innerHTML =
  renderNavbar("crisis-handling");
initNavbar();
document.getElementById("footer-root").innerHTML = renderFooter();
initSuggestDrawer();

function renderEmergencies(emergencyType) {
  let container;
  if (emergencyType == criticalEmergencies) {
    container = document.getElementById("critical-emergencies-container");
  } else if (emergencyType == urgentSituations) {
    container = document.getElementById("urgent-situations-container");
  } else container = document.getElementById("high-distress-container");

  emergencyType.forEach((emergency) => {
    const article = document.createElement("article");
    if (emergencyType == criticalEmergencies) {
      article.classList.add("critical-emergency-card", "cards");
    } else if (emergencyType == urgentSituations) {
      article.classList.add("urgent-situation-card", "cards");
    } else {
      article.classList.add("high-distress-card", "cards");
    }
    article.innerHTML += `<figure>${emergency.icon}</figure> <h3>${emergency.title}</h3> <p>${emergency.description}</p> <hr /> <a href="../../crisisHandling/detail" class="emergency-link" style="color: ${emergency.color}">${emergency.linkText} <i class="fa-solid fa-arrow-right"></i></a> `;
    container.appendChild(article);
  });
}

renderEmergencies(criticalEmergencies);
renderEmergencies(urgentSituations);
renderEmergencies(highDistress);
