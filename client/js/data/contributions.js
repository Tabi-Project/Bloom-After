const teamMembers = [
  {
    id: 1,
    name: "Nanji Lakan",
    img: resolveTeamImage("Nanji-Portrait.jpg"),
    role: "Project/Product Lead",
    contribution: "Manage Project Priorities, Documentation and Direction",
    github: "https://github.com/Shaelle11",
    linkedin: "https://www.linkedin.com/in/nanji-lakan-theshaelle",
  },

  {
    id: 2,
    name: "Grace Olabode",
    img: resolveTeamImage("Grace Portrait.png"),
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
    img: resolveTeamImage("Prisca-Portrait.png"),
    contribution:
      "Ensured the codebase is well-maintained, organized, and adheres to best practices for long-term sustainability.",
    github: "https://github.com/chiomaeze",
    linkedin: "https://www.linkedin.com/in/chiomaeze",
  },
  {
    id: 4,
    name: "Genevieve Agugua",
    role: "Design Lead",
    img: resolveTeamImage("Genevieve-Potrait.png"),
    contribution:
      "Led the design efforts, creating visually appealing and user-friendly interfaces for the application.",
    github: "https://github.com/seyiadetola",
    linkedin: "https://www.linkedin.com/in/seyiadetola",
  },
  {
    id: 5,
    name: "Chijioke Uzodinma",
    role: "Frontend/Backend Engineer",
    img: resolveTeamImage("Chijioke-Potrait.png"),
    contribution:
      "Developed the server-side logic and integrated the database for efficient data management.",
    github: "https://github.com/chijex5",
    linkedin: "https://www.linkedin.com/in/chijioke-uzodinma-34389b267",
  },
  {
    id: 6,
    name: "Esther Adejola ",
    role: "Frontend Engineer",
    img: resolveTeamImage("Esther-Portrait.png"),
    contribution:
      "Implemented and refined frontend components, improved UI responsiveness, and enhanced overall user experience.",
    github: "https://github.com/De-jola",
    linkedin: "https://www.linkedin.com/in/esther-adejola",
  },
  {
    id: 7,
    name: "Mariam Omiteru",
    role: "UI/UX DESIGNER",
    img: resolveTeamImage("Mariam-Omiteru.jpeg"),
    contribution:
      "Worked on the design of the resource experience, including core pages and category-specific flows. Also created a mini design system and contributed to the landing page as well.",
    github: "",
    linkedin: "http://www.linkedin.com/in/mariamomiteru",
  }
];

function resolveTeamImage(fileName) {
  return new URL(`../../assets/teamImages/${fileName}`, import.meta.url).href;
}

export { teamMembers };
