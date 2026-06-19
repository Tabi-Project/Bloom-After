import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeaturesCards, TrustBanner } from "@/components/Features";
import Voices from "@/components/Voices";
import Contributors from "@/components/Contributors";
import Faqs from "@/components/Faqs";
import SuggestDrawer from "@/components/SuggestDrawer";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="visually-hidden">
        Skip to main content
      </a>

      {/* Hero */}
      <section className="hero" aria-labelledby="hero-heading">
        <article className="hero-content container">
          <h1 className="hero-heading" id="hero-heading">
            Ease your way back in with a community that <em>cares.</em>
          </h1>

          <p className="hero-subheading">
            A safe, clinically grounded space for navigating postpartum
            depression.
          </p>

          <div className="hero-actions">
            <Link href="/resources" className="btn btn-primary">
              Explore Resources
            </Link>
            <Link href="/clinics" className="btn btn-secondary">
              Find Local Clinics
            </Link>
          </div>
        </article>

        <figure className="voices-testimonial">
          <blockquote>
            &quot;Finding Bloom After helped me realize I wasn&apos;t failing, I
            was just healing. It&apos;s the sisterhood I didn&apos;t know I
            needed.&quot;
          </blockquote>
          <figcaption>&mdash; Anonymous Mother, Lagos</figcaption>
        </figure>
      </section>

      <main id="main-content">
        <section className="features-section">
          <div className="container">
            <h2 className="features-heading">
              Support that meets you where you are
            </h2>
            <p className="features-subheading text-inverse-muted">
              Speaking about maternal mental health can feel daunting due to
              cultural expectations and stigma. Bloom After changes that by
              combining medical insight, local care access and community
              understanding into one safe digital space.
            </p>
          </div>

          <div className="container grid-3 card-grid">
            <FeaturesCards />
          </div>
        </section>

        <aside className="features-trust strip">
          <div className="container">
            <TrustBanner />
          </div>
        </aside>

        <section
          className="voices-section container voices-container"
          id="voices-section"
          aria-labelledby="voices-heading"
        >
          <header className="voices-header">
            <h2 className="voices-heading" id="voices-heading">
              Voices that understand.
            </h2>
            <p className="voices-subheading">
              Listen to experts and mothers discussing real experiences.
            </p>
          </header>

          <Voices />

          <section className="voices-cta-wrap" aria-label="Media section actions">
            <Link className="voices-cta" id="voices-cta" href="/resources">
              <span>See More Resources</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </section>

          <section className="voices-story" aria-labelledby="voices-story-heading">
            <h3 className="visually-hidden" id="voices-story-heading">
              Community reflection
            </h3>
          </section>
        </section>

        {/* Contributors */}
        <section id="team" className="team-section strip">
          <div className="section-header container">
            <h2>Meet our Contributors</h2>
            <p className="content-centered">
              Get to know the passionate minds behind Bloom After. Select a
              profile to read their story and contributions.
            </p>
            <Contributors />
          </div>
        </section>

        <section className="container ngo-section">
          <div className="section-header">
            <h2 className="section-header">Local Support &amp; NGOs</h2>
            <p>
              Discover organizations across Nigeria dedicated to mental health
              and family wellbeing.
            </p>
          </div>
          <div className="partner-list flex">
            <div className="partner-card">PostPartum Support Network</div>
            <div className="partner-card">Mentally Aware Nigeria</div>
            <div className="partner-card">Neem Foundation</div>
          </div>
          <Link href="/ngos" className="btn btn-primary btn-ngo">
            Explore the NGO directory <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>

        <section className="faq-section">
          <div className="container">
            <div className="section-header">
              <h2>Frequently Asked Questions</h2>
              <p>
                Find answers to common questions about postpartum depression and
                navigating the Bloom After platform.
              </p>
            </div>

            <Faqs />
          </div>
        </section>
      </main>

      <SuggestDrawer />
    </>
  );
}
