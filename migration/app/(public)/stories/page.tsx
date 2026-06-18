"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import FilterButton from "@/components/story/FilterButton";
import StoryCard from "@/components/story/StoryCard";

const FILTERS = [
  "All",
  "Therapy",
  "Lifestyle changes",
  "Peer support",
  "Self-help strategies",
  "Other",
];

const StoriesPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <>
      <Navbar />
      <a href="#main-content" className="visually-hidden">
        Skip to main content
      </a>

      <main id="main-content">
        <section
          className="resources-hero"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1658092967527-4e140d9bdaea?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          }}
          aria-labelledby="stories-hero-heading"
        >
          <div className="resources-hero-content container">
            <h1 className="resources-hero-title" id="stories-hero-heading">
              Stories of Hope
            </h1>
            <p className="resources-hero-subtitle">
              Real journeys, shared with courage. Every story here is a light
              for someone still finding their way through postpartum depression.
            </p>
            <Link
              href="/stories/editor"
              className="btn btn-outline-white stories-hero-cta"
            >
              Share Your Story
            </Link>
          </div>
        </section>

        {/* Search and filters */}
        <div className="page-controls" role="search">
          <div className="container page-controls-inner">
            <div className="search-wrap">
              <span className="search-icon" aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="search"
                id="search-input"
                className="search-input"
                placeholder="Search by name, location, or keyword"
                aria-label="Search stories"
                autoComplete="off"
              />
            </div>

            <div className="filter-dropdown" id="filter-dropdown">
              <button
                className="filter-dropdown-toggle"
                id="filter-toggle"
                aria-haspopup="true"
                aria-expanded={isFilterOpen}
                aria-controls="filter-menu"
                aria-label="Filter stories"
                onClick={() => setIsFilterOpen((open) => !open)}
              >
                <span data-icon="filter" aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11 18q-.425 0-.712-.288T10 17t.288-.712T11 16h2q.425 0 .713.288T14 17t-.288.713T13 18zm-4-5q-.425 0-.712-.288T6 12t.288-.712T7 11h10q.425 0 .713.288T18 12t-.288.713T17 13zM4 8q-.425 0-.712-.288T3 7t.288-.712T4 6h16q.425 0 .713.288T21 7t-.288.713T20 8z"
                    ></path>
                  </svg>
                </span>
                Filter
              </button>

              <nav
                className="filter-dropdown-menu"
                id="filter-menu"
                aria-label="Filter stories by what helped"
                hidden={!isFilterOpen}
              >
                {FILTERS.map((filter) => (
                  <FilterButton
                    key={filter}
                    isActive={activeFilter === filter}
                    text={filter}
                    onClick={() => setActiveFilter(filter)}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Section Grid */}
        <section
          className="resources-grid-section"
          aria-labelledby="stories-list-label"
        >
          <div className="container">
            <h2 className="visually-hidden" id="stories-list-label">
              Stories
            </h2>

            <div
              id="stories-grid"
              className="resources-grid"
              aria-live="polite"
              aria-atomic="false"
            ></div>

            <p id="stories-empty" className="empty-state" hidden role="status">
              <strong>No stories found.</strong>
              <br />
              Try a different search term or filter.
            </p>

            <div
              id="pagination"
              className="pagination-wrap"
              aria-live="polite"
            ></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default StoriesPage;
