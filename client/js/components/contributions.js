import { teamMembers } from "../data/contributions";

function initCarousel() {
  const track = document.getElementById("contributions-container");
  if (!track) return;

  let viewport = track.parentElement;
  if (!viewport.classList.contains("team-carousel-viewport")) {
    viewport = document.createElement("div");
    viewport.className = "team-carousel-viewport";
    track.parentNode.insertBefore(viewport, track);
    viewport.appendChild(track);
  }

  const cards = Array.from(track.children);
  const total = cards.length;
  if (total === 0) return;

  let current = 0;
  let startX = 0;
  let autoPlayTimer;

  track.style.display = "flex";
  track.style.transition = "transform 0.4s ease";

  function getCardsPerView() {
    return window.innerWidth > 768 ? 3 : 1;
  }

  function setupCards() {
    const cardsPerView = getCardsPerView();
    cards.forEach((card, i) => {
      card.style.minWidth = `calc(${100 / cardsPerView}% - var(--space-4))`;
      card.style.flexShrink = "0";
      card.classList.add("carousel-card");
      if (i < cardsPerView) card.classList.add("active");
    });
  }

  const dotsContainer = document.createElement("div");
  dotsContainer.className = "carousel-dots";

  function totalSlides() {
    return Math.ceil(total / getCardsPerView());
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    for (let i = 0; i < totalSlides(); i++) {
      const dot = document.createElement("button");
      dot.className = "carousel-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  viewport.insertAdjacentElement("afterend", dotsContainer);

  function goTo(index) {
    const cardsPerView = getCardsPerView();
    const slides = totalSlides();
    current = ((index % slides) + slides) % slides;

    const slideWidth = viewport.clientWidth;
    track.style.transform = `translateX(-${current * slideWidth}px)`;

    cards.forEach((card, i) => {
      const isActive =
        i >= current * cardsPerView && i < (current + 1) * cardsPerView;
      card.classList.toggle("active", isActive);
    });

    dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });
  }

  setupCards();
  buildDots();
  goTo(0);

  window.addEventListener("resize", () => {
    setupCards();
    buildDots();
    goTo(0);
  });

  function startAutoPlay() {
    autoPlayTimer = setInterval(() => goTo(current + 1), 3500);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
  }

  startAutoPlay();

  track.addEventListener("mouseenter", stopAutoPlay);
  track.addEventListener("mouseleave", startAutoPlay);

  track.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      stopAutoPlay();
    },
    { passive: true },
  );

  track.addEventListener(
    "touchend",
    (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
      startAutoPlay();
    },
    { passive: true },
  );
}

function renderTeamMembers() {
  const container = document.getElementById("contributions-container");
  if (!container) return;
  container.innerHTML = "";

  teamMembers.forEach((member) => {
    const memberCard = document.createElement("article");
    memberCard.className = "team-card";
    memberCard.setAttribute("tabindex", "0");
    memberCard.setAttribute("role", "button");

    memberCard.innerHTML = `
      <img src="${member.img}" alt="${member.name}" class="team-member-photo" loading="lazy" />
      <h5 class="team-member-name">${member.name}</h5>
      <p class="team-member-role">${member.role}</p>
      <div class="team-card-affordance">
        View Profile <i class="fa-solid fa-arrow-right"></i>
      </div>
    `;

    const triggerModal = () => showModal(member);
    memberCard.addEventListener("click", triggerModal);
    memberCard.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerModal();
      }
    });

    container.appendChild(memberCard);
  });

  initCarousel();
}
function showModal(member) {
  const modal = document.getElementById("team-modal");
  const modalBody = document.getElementById("modal-body");
  if (!modal || !modalBody) return;

  const contributionText =
    member.contribution || "Specific contribution details coming soon.";

  // Populate the modal with the clicked member's data
  modalBody.innerHTML = `
    <div class="flex flex-col items-center text-center">
      <img src="${member.img}" alt="${member.name}" class="team-member-photo" />
      <h3 class="team-member-name" id="modal-name">${member.name}</h3>
      <p class="team-member-role">${member.role}</p>
      <p class="team-member-contribution" >${contributionText}</p>
      
      <div class="team-socials justify-center">
        ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>` : ""}
        ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>` : ""}
      </div>
    </div>
  `;

  // Show the modal
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  // Handle closing
  const closeModal = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", handleEscape);
  };

  modal.querySelector(".modal-close").onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  }; // Close if clicking the dark overlay
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  }); // Close on Esc key
}

export { teamMembers, renderTeamMembers };
