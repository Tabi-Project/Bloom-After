import { renderNavbar, initNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { initSuggestDrawer } from "../components/suggest-drawer.js";

document.getElementById("navbar-root").innerHTML =
  renderNavbar("crisis-handling");
initNavbar();
document.getElementById("footer-root").innerHTML = renderFooter();
initSuggestDrawer();

const criticalEmergencies = [
  {
    id: 1,
    title: "PostPartum Psychosis",
    icon: `<i class="fa-solid fa-triangle-exclamation"></i>`,
    description:
      "Experiencing hallucinations, extreme paranoia, delusions, or a severe break from reality.",
    linkText: "View Protocol",
    color: `var(--color-danger)`,
  },

  {
    id: 2,
    title: "Thoughts of Self-Harm",
    icon: `<i class="fa-solid fa-user-xmark"></i>`,
    description:
      "Overwhelming feelings of wanting to hurt yourself or feeling that your family would be better off without you.",
    linkText: "View Protocol",
    color: `var(--color-danger)`,
  },

  {
    id: 3,
    title: "Thoughts of Harming Your Baby",
    icon: `<i class="fa-solid fa-shield-exclamation"></i>`,
    description:
      "Intrusive, disturbing, and overwhelming thoughts or urges about causing harm to your child.",
    linkText: "View Protocol",
    color: `var(--color-danger)`,
  },
];

const urgentSituations = [
  {
    id: 1,
    title: "Severe Panic Attacks",
    icon: `<i class="fa-solid fa-wind"></i>`,
    description:
      "Racing heart, inability to catch your breath, trembling, and a severe feeling of impending doom..",
    linkText: "View Coping Steps",
    color: `var(--color-warning)`,
  },

  {
    id: 2,
    title: "Total Inability to Sleep",
    icon: `<i class="fa-solid fa-moon"></i>`,
    description:
      "Unable to sleep for days, experiencing racing thoughts even when the baby is resting.",
    linkText: "View Coping Steps",
    color: `var(--color-warning)`,
  },

  {
    id: 3,
    title: "Complete Emotional Numbness",
    icon: `<i class="fa-solid fa-cloud"></i>`,
    description:
      "Feeling entirely detached from reality, your surroundings, or an inability to feel any emotions at all.",
    linkText: "View Coping Steps",
    color: `var(--color-warning)`,
  },
];

function renderEmergencies(emergencyType) {
  let container;
  if (emergencyType == criticalEmergencies) {
    container = document.getElementById("critical-emergencies-container");
  } else if (emergencyType == urgentSituations) {
    container = document.getElementById("urgent-situations-container");
  }
  else container = document.getElementById("high-distress-container");
  
  emergencyType.forEach((emergency) => {
    const article = document.createElement("article");
    if (emergencyType == criticalEmergencies) {
      article.classList.add("critical-emergency-card", "cards");
    } else if (emergencyType == urgentSituations) {
      article.classList.add("urgent-situation-card", "cards");
    } else {
      article.classList.add("high-distress-card", "cards");
    }
    article.innerHTML += `<figure>${emergency.icon}</figure> <h3>${emergency.title}</h3> <p>${emergency.description}</p> <hr /> <a href="#" style="color: ${emergency.color}">${emergency.linkText} <i class="fa-solid fa-arrow-right"></i></a> `;
    container.appendChild(article);
  });
}

renderEmergencies(criticalEmergencies);
renderEmergencies(urgentSituations);
