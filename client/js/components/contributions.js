const teamMembers = [
  {
    id: 1,
    name: "Grace Olabode",
    img: "../assets/teamImages/Grace Portrait.png",
    role: "Engineering Lead",
    contribution:
      "Led the development of the application's architecture and implemented key features to ensure a robust and scalable solution.",
    github: "https://github.com/adaezeokafor",
    linkedin: "https://www.linkedin.com/in/adaezeokafor",
  },
  {
    id: 2,
    name: "Tunde Adebayo",
    role: "Backend Developer",
    img: "../assets/teamImages/Grace Portrait.png",
    contribution:
      "Developed the server-side logic and integrated the database for efficient data management.",
    github: "https://github.com/tundeadebayo",
    linkedin: "https://www.linkedin.com/in/tundeadebayo",
  },
  {
    id: 3,
    name: "Zainab Bello",
    role: "UI/UX Designer",
    img: "../assets/teamImages/Esther-Portrait.png",
    contribution:
      "Designed the user interface and created a seamless user experience for the application.",
    github: "https://github.com/zainabbello",
    linkedin: "https://www.linkedin.com/in/zainabbello",
  },
  {
    id: 4,
    name: "Emeka Nwosu",
    role: "Project Manager",
    img: "../assets/teamImages/Prisca-Portrait.png",
    contribution:
      "Coordinated the project, managed timelines, and ensured effective communication among team members.",
    github: "https://github.com/emekanwosu",
    linkedin: "https://www.linkedin.com/in/emekanwosu",
  },
  {
    id: 5,
    name: "Prisca Onyemaechi",
    role: "Lead Maintainer",
    img: "../assets/teamImages/Prisca-Portrait.png",
    contribution:
      "Ensured the codebase is well-maintained, organized, and adheres to best practices for long-term sustainability.",
    github: "https://github.com/chiomaeze",
    linkedin: "https://www.linkedin.com/in/chiomaeze",
  },
  {
    id: 6,
    name: "Genevieve Agugua",
    role: "Design Lead",
    img: "../assets/teamImages/Genevieve-Potrait.png",
    contribution:
      "Led the design efforts, creating visually appealing and user-friendly interfaces for the application.",
    github: "https://github.com/seyiadetola",
    linkedin: "https://www.linkedin.com/in/seyiadetola",
  },
  {
    id: 7,
    name: "Chijioke Uzodinma",
    role: "Content Creator",
    img: "../assets/teamImages/Chijioke-Potrait.png",
    contribution:
      "Created engaging content for the application and managed social media presence.",
    github: "https://github.com/halimayusuf",
    linkedin: "https://www.linkedin.com/in/halimayusuf",
  },
  {
    id: 8,
    name: "Esther Adejola",
    role: "Frontend Engineer",
    img: "../assets/teamImages/Esther-Portrait.png",
    contribution:
      "Implemented the frontend components and ensured a smooth user experience across different browsers and devices.",
    github: "https://github.com/kunleiro",
    linkedin: "https://www.linkedin.com/in/kunleiro",
  },
  {
    id: 9,
    name: "Amarachi Uvere",
    role: "Backend Engineer",
    img: "../assets/teamImages/amarachiprofilepicture.png",
    contribution:
      "Developed and maintained the backend systems and APIs for the application.",
    github: "https://github.com/bisialade",
    linkedin: "https://www.linkedin.com/in/bisialade",
  },
  {
    id: 10,
    name: "Ifeanyi Okon",
    role: "Security Specialist",
    img: "../assets/teamImages/Genevieve-Potrait.png",
    contribution:
      "Implemented security measures to protect user data and ensure the application's integrity.",
    github: "https://github.com/ifeanyiokon",
    linkedin: "https://www.linkedin.com/in/ifeanyiokon",
  },
];

function renderTeamMembers() {
  const container = document.getElementById("contributions-container");

  teamMembers.forEach((member) => {
    const memberCard = document.createElement("div");
    memberCard.classList.add("team-member");
    memberCard.classList.add("flex");
    memberCard.classList.add("flex-col");
    memberCard.classList.add("text-center");
    memberCard.classList.add("items-center");
    memberCard.innerHTML = `
      <img src="${member.img}" alt="${member.name}'s profile picture" class="team-member-photo">
      <h5>${member.name}</h5>
      <div class="member-info">
        <p><strong>Role:</strong> ${member.role}</p>
        <p><strong>Contribution:</strong> ${member.contribution}</p>
        <a href="${member.github}" target="_blank" rel="noopener noreferrer">
        <i class="fa-brands fa-github"></i></a>
        <a href="${member.linkedin}" target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-linkedin"></i></a>
      </div>
    `;

    container.appendChild(memberCard);
  });
}

export { teamMembers, renderTeamMembers };
