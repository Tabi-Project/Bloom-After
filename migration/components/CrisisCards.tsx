"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowRight, X } from "lucide-react";
import {
  crisisSections,
  type CrisisScenario,
} from "@/data/crisis-handling";

export default function CrisisCards() {
  const [activeScenario, setActiveScenario] = useState<CrisisScenario | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openModal = useCallback((scenario: CrisisScenario, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setActiveScenario(scenario);
  }, []);

  const closeModal = useCallback(() => {
    setActiveScenario(null);
    // Return focus to the card that opened the modal
    triggerRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!activeScenario) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeScenario, closeModal]);

  // Focus trap inside modal
  useEffect(() => {
    if (!activeScenario || !modalRef.current) return;

    const focusableEls = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableEls[0];
    firstEl?.focus();
  }, [activeScenario]);

  return (
    <>
      {crisisSections.map((section) => (
        <section key={section.title} className="ch-section" aria-labelledby={`ch-title-${section.title.replace(/\s/g, "-")}`}>
          <h2 className="ch-section-title" id={`ch-title-${section.title.replace(/\s/g, "-")}`}>
            {section.title}
          </h2>

          <div className="ch-grid" role="list">
            {section.scenarios.map((scenario) => (
              <button
                key={scenario.id}
                className={`ch-card ch-card--${scenario.severity}`}
                onClick={(e) => openModal(scenario, e.currentTarget)}
                role="listitem"
                aria-label={`${scenario.title} — ${scenario.severity} severity. ${scenario.ctaLabel}`}
                id={`crisis-card-${scenario.id}`}
              >
                <div className="ch-card-icon" aria-hidden="true">
                  <scenario.icon size={20} strokeWidth={2} />
                </div>
                <h3 className="ch-card-title">{scenario.title}</h3>
                <p className="ch-card-desc">{scenario.description}</p>
                <span className="ch-card-cta" aria-hidden="true">
                  {scenario.ctaLabel}
                  <ArrowRight size={14} strokeWidth={2.5} />
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}

      {/* Crisis Detail Modal */}
      <div
        className={`modal-overlay${activeScenario ? " active" : ""}`}
        aria-hidden={!activeScenario}
        onClick={(e) => {
          // Close when clicking the overlay background
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        {activeScenario && (
          <div
            className="modal-content ch-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crisis-modal-title"
            ref={modalRef}
          >
            <button
              className="modal-close"
              aria-label="Close modal"
              onClick={closeModal}
            >
              <X size={20} strokeWidth={2} />
            </button>

            <div className="ch-modal-header">
              <span
                className="ch-modal-tag"
                style={{
                  color: activeScenario.modalTagColor,
                  background: activeScenario.modalTagBg,
                }}
              >
                {activeScenario.modalTag}
              </span>
              <h2 className="ch-modal-title" id="crisis-modal-title">
                {activeScenario.title}
              </h2>
            </div>

            <ol className="ch-modal-steps">
              {activeScenario.steps.map((step, i) => (
                <li key={i} className="ch-modal-step-item">
                  <span className="ch-modal-step-number" aria-hidden="true">
                    {i + 1}
                  </span>
                  <p className="ch-modal-step-text">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  );
}
