import type { Metadata } from "next";
import { Phone } from "lucide-react";
import CrisisCards from "@/components/CrisisCards";

export const metadata: Metadata = {
  title: "Crisis Handling & Emergency Support — Bloom After",
  description:
    "Immediate crisis guidance for postpartum emergencies. Find actionable steps for self-harm, panic attacks, bonding difficulties, and more.",
};

export default function CrisisHandlingPage() {
  return (
    <main id="main-content">
      {/* Hero */}
      <section
        className="resources-hero"
        style={{
          backgroundImage:
            "url('https://plus.unsplash.com/premium_photo-1672759455710-70c879daf721?q=80&w=1416')",
        }}
        aria-labelledby="crisis-hero-heading"
      >
        <div className="resources-hero-content container">
          <h1 className="resources-hero-title" id="crisis-hero-heading">
            Crisis Handling &amp; Emergency Support
          </h1>
          <p className="resources-hero-subtitle">
            If you or someone else is in immediate danger, do not wait. Select
            the situation below to find actionable steps, or call for help
            immediately.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container">
        {/* Helpline Banner */}
        <article className="helpline-banner" id="helpline-banner">
          <div className="helpline-icon" aria-hidden="true">
            <Phone size={32} strokeWidth={2} />
          </div>
          <div className="helpline-content">
            <h2>24/7 National Mental Health Helpline</h2>
            <p>
              Free, confidential support from trained maternal mental health
              counselors. Available in English, Hausa, Yoruba, and Igbo.
            </p>
            <div className="helpline-actions">
              <a
                href="tel:112"
                className="btn btn-primary"
                style={{
                  background: "var(--color-danger)",
                  borderColor: "var(--color-danger)",
                }}
                id="emergency-call-btn"
              >
                Call 112 (Emergency)
              </a>
            </div>
          </div>
        </article>

        {/* Crisis Scenario Cards + Modal */}
        <CrisisCards />
      </section>
    </main>
  );
}
