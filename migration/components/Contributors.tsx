"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  img: string;
  contribution: string;
  github?: string;
  linkedin?: string;
}

const teamImage = (file: string) => `/assets/teamImages/${file}`;

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Nanji Lakan",
    img: teamImage("Nanji-Portrait.jpg"),
    role: "Project/Product Lead",
    contribution: "Manage Project Priorities, Documentation and Direction",
    github: "https://github.com/Shaelle11",
    linkedin: "https://www.linkedin.com/in/nanji-lakan-theshaelle",
  },
  {
    id: 2,
    name: "Grace Olabode",
    img: teamImage("Grace Portrait.png"),
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
    img: teamImage("Prisca-Portrait.png"),
    contribution:
      "Ensured the codebase is well-maintained, organized, and adheres to best practices for long-term sustainability.",
    github: "https://github.com/chiomaeze",
    linkedin: "https://www.linkedin.com/in/chiomaeze",
  },
  {
    id: 4,
    name: "Genevieve Agugua",
    role: "Design Lead",
    img: teamImage("Genevieve-Potrait.png"),
    contribution:
      "Led the design efforts, creating visually appealing and user-friendly interfaces for the application.",
    github: "https://github.com/seyiadetola",
    linkedin: "https://www.linkedin.com/in/seyiadetola",
  },
  {
    id: 5,
    name: "Chijioke Uzodinma",
    role: "Frontend/Backend Engineer",
    img: teamImage("Chijioke-Potrait.png"),
    contribution:
      "Developed the server-side logic and integrated the database for efficient data management.",
    github: "https://github.com/chijex5",
    linkedin: "https://www.linkedin.com/in/chijioke-uzodinma-34389b267",
  },
  {
    id: 6,
    name: "Esther Adejola",
    role: "Frontend Engineer",
    img: teamImage("Esther-Portrait.png"),
    contribution:
      "Implemented and refined frontend components, improved UI responsiveness, and enhanced overall user experience.",
    github: "https://github.com/De-jola",
    linkedin: "https://www.linkedin.com/in/esther-adejola",
  },
  {
    id: 7,
    name: "Mariam Omiteru",
    role: "UI/UX Designer",
    img: teamImage("Mariam-Omiteru.jpeg"),
    contribution:
      "Worked on the design of the resource experience, including core pages and category-specific flows. Also created a mini design system and contributed to the landing page as well.",
    linkedin: "http://www.linkedin.com/in/mariamomiteru",
  },
];

function useCardsPerView() {
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const update = () => setCardsPerView(window.innerWidth > 768 ? 3 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cardsPerView;
}

export default function Contributors() {
  const cardsPerView = useCardsPerView();
  const totalSlides = Math.ceil(teamMembers.length / cardsPerView);
  const [current, setCurrent] = useState(0);
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const touchStartX = useRef(0);

  // Derived during render so a viewport change (fewer slides) can never leave
  // the stored index out of range — no clamping effect needed.
  const activeSlide = Math.min(current, totalSlides - 1);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % totalSlides) + totalSlides) % totalSlides);
    },
    [totalSlides]
  );

  // Autoplay, paused while a profile modal is open.
  useEffect(() => {
    if (activeMember) return;
    const timer = setInterval(() => {
      setCurrent((c) => (Math.min(c, totalSlides - 1) + 1) % totalSlides);
    }, 3500);
    return () => clearInterval(timer);
  }, [totalSlides, activeMember]);

  // Close the modal on Escape.
  useEffect(() => {
    if (!activeMember) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMember(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeMember]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(activeSlide + (diff > 0 ? 1 : -1));
  };

  return (
    <>
      <div className="team-carousel-viewport">
        <div
          className="member-list items-center"
          style={{
            display: "flex",
            transition: "transform 0.4s ease",
            transform: `translateX(-${activeSlide * 100}%)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {teamMembers.map((member, i) => {
            const isActive =
              i >= activeSlide * cardsPerView &&
              i < (activeSlide + 1) * cardsPerView;
            const openModal = () => setActiveMember(member);
            return (
              <article
                key={member.id}
                className={`team-card carousel-card ${isActive ? "active" : ""}`}
                style={{
                  minWidth: `calc(${100 / cardsPerView}% - var(--space-4))`,
                  flexShrink: 0,
                }}
                tabIndex={0}
                role="button"
                onClick={openModal}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openModal();
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.img}
                  alt={member.name}
                  className="team-member-photo"
                  loading="lazy"
                />
                <h5 className="team-member-name">{member.name}</h5>
                <p className="team-member-role">{member.role}</p>
                <div className="team-card-affordance">
                  View Profile <ArrowRight size={14} aria-hidden="true" />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="carousel-dots">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === activeSlide ? "active" : ""}`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <div
        className={`modal-overlay ${activeMember ? "active" : ""}`}
        aria-hidden={!activeMember}
        onClick={(e) => {
          if (e.target === e.currentTarget) setActiveMember(null);
        }}
      >
        <div
          className="modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-name"
        >
          <button
            className="modal-close"
            aria-label="Close modal"
            onClick={() => setActiveMember(null)}
          >
            <X size={20} aria-hidden="true" />
          </button>
          {activeMember && (
            <div className="modal-body flex flex-col items-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeMember.img}
                alt={activeMember.name}
                className="team-member-photo"
              />
              <h3 className="team-member-name" id="modal-name">
                {activeMember.name}
              </h3>
              <p className="team-member-role">{activeMember.role}</p>
              <p className="team-member-contribution">
                {activeMember.contribution}
              </p>
              <div className="team-socials justify-center">
                {activeMember.github && (
                  <a
                    href={activeMember.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    <GithubIcon />
                  </a>
                )}
                {activeMember.linkedin && (
                  <a
                    href={activeMember.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <LinkedinIcon />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
