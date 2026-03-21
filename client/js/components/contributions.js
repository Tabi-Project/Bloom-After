const teamMembers = [
  {
    id: 1,
    name: "Nanji Lakan",
    img: "../assets/teamImages/Nanji-Portrait.jpg",
    role: "Project/Product Lead",
    contribution: "Manage Project Priorities, Documentation and Direction",
    github: "https://github.com/Shaelle11",
    linkedin: "https://www.linkedin.com/in/nanji-lakan-theshaelle",
  },

  {
    id: 2,
    name: "Grace Olabode",
    img: "../assets/teamImages/Grace Portrait.png",
    role: "Engineering Lead",
    contribution:
      "Led the development of the application's architecture and implemented key features to ensure a robust and scalable solution.",
    github: "https://github.com/adaezeokafor",
    linkedin: "https://www.linkedin.com/in/adaezeokafor",
  },
  {
    id: 3,
    name: "Prisca Onyemaechi",
    role: "Lead Maintainer",
    img: "../assets/teamImages/Prisca-Portrait.png",
    contribution:
      "Ensured the codebase is well-maintained, organized, and adheres to best practices for long-term sustainability.",
    github: "https://github.com/chiomaeze",
    linkedin: "https://www.linkedin.com/in/chiomaeze",
  },
  {
    id: 4,
    name: "Genevieve Agugua",
    role: "Design Lead",
    img: "../assets/teamImages/Genevieve-Potrait.png",
    contribution:
      "Led the design efforts, creating visually appealing and user-friendly interfaces for the application.",
    github: "https://github.com/seyiadetola",
    linkedin: "https://www.linkedin.com/in/seyiadetola",
  },
  {
    id: 5,
    name: "Chijioke Uzodinma",
    role: "Frontend Engineer",
    img: "../assets/teamImages/Chijioke-Potrait.png",
    contribution:
      "Developed the server-side logic and integrated the database for efficient data management.",
    github: "https://github.com/halimayusuf",
    linkedin: "https://www.linkedin.com/in/halimayusuf",
  },
  {
    id: 6,
    name: "Esther Adejola ",
    role: "Frontend Engineer",
    img: "../assets/teamImages/Esther-Portrait.png",
    contribution:
      "Implemented and refined frontend components, improved UI responsiveness, and enhanced overall user experience.",
    github: "https://github.com/De-jola",
    linkedin: "https://www.linkedin.com/in/esther-adejola",
  },
  {
    id: 7,
    name: "Christine Mwangi ",
    role: "Frontend Engineer",
    img: "../assets/teamImages/Christine-Potrait.jpeg",
    contribution:
      "Worked on Footer and contributed to the development of the frontend components and user interface.",
    github: "https://github.com/zainabbello",
    linkedin: "https://www.linkedin.com/in/zainabbello",
  },
  {
    id: 8,
    name: "Amarachi Uvere",
    role: "Backend Engineer",
    img: "../assets/teamImages/amarachiprofilepicture.png",
    contribution:
      "Developed and maintained the backend systems and APIs for the application.",
    github: "https://github.com/bisialade",
    linkedin: "https://www.linkedin.com/in/bisialade",
  },
];

function initCarousel() {
  if (window.innerWidth > 768) return;

  const track = document.getElementById("contributions-container");
  const cards = Array.from(track.children);
  const total = cards.length;
  if (total === 0) return;

  let current = 0;
  let startX = 0;
  let autoPlayTimer;

  track.style.display = "flex";
  track.style.gap = "var(--space-4)";
  track.style.transition = "transform 0.4s ease";

  const cardWidth = cards[0].offsetWidth;

  cards.forEach((card, i) => {
    card.style.minWidth = 96 + "%";
    card.style.flexShrink = "0";
    card.classList.add("carousel-card");
    if (i === 0) card.classList.add("active");
  });

  // Dots
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "carousel-dots";

  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to card ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  track.parentElement.insertAdjacentElement("afterend", dotsContainer);

  function goTo(index) {
    current = ((index % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    cards.forEach((card, i) => {
      card.classList.toggle("active", i === current);
    });

    dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });
  }

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
    memberCard.setAttribute("tabindex", "0"); // Makes it keyboard accessible
    memberCard.setAttribute("role", "button");

    memberCard.innerHTML = `
      <img src="${member.img}" alt="${member.name}" class="team-member-photo" loading="lazy" />
      <h5 class="team-member-name">${member.name}</h5>
      <p class="team-member-role">${member.role}</p>
      <div class="team-card-affordance">
        View Profile <i class="fa-solid fa-arrow-right"></i>
      </div>
    `;

    // Open modal on click or Enter key
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
      <img src="${member.img}" alt="${member.name}" class="team-member-photo" style="width: 120px; height: 120px;" />
      <h3 class="team-member-name" id="modal-name" style="font-size: var(--font-size-2xl); margin-bottom: var(--space-1);">${member.name}</h3>
      <p class="team-member-role" style="font-size: var(--font-size-base); color: var(--color-primary); margin-bottom: var(--space-4);">${member.role}</p>
      <p class="team-member-contribution" style="text-align: left; line-height: 1.6; color: var(--color-gray-700); margin-bottom: var(--space-6);">${contributionText}</p>
      
      <div class="team-socials justify-center" style="display: flex; gap: var(--space-6); font-size: var(--font-size-xl);">
        ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style="color: var(--color-brand-400);"><i class="fa-brands fa-github"></i></a>` : ""}
        ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style="color: var(--color-brand-400);"><i class="fa-brands fa-linkedin"></i></a>` : ""}
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
