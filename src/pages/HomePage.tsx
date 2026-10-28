import React from 'react';
import { useRouter, Link } from '../router/Router';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="page-shell page-home">
      {/* 1. Hero Section: 5-Second Comprehension */}
      <section className="page-section hero-full-section" aria-labelledby="home-hero-heading">
        <div className="page-inner home-hero-grid">
          {/* Left Column: Core Promise & Immediate Action */}
          <div className="hero-left-col">
            <h1 id="home-hero-heading" className="home-hero-headline">
              Turn a big AI project idea into a version you can actually start.
            </h1>
            <p className="home-hero-subhead">
              ShipScope helps final-year engineering students decide what to build first, what to postpone, and how to begin — then shows how that student value could drive workshop registrations.
            </p>

            <div className="hero-cta-group">
              <button
                type="button"
                className="btn-primary btn-hero"
                onClick={() => navigate('/diagnose')}
              >
                <span>Try ShipScope</span>
                <span className="cta-arrow" aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className="btn-secondary btn-hero"
                onClick={() => navigate('/campaign')}
              >
                <span>See the Growth Plan</span>
              </button>
            </div>
          </div>

          {/* Right Column: Clean, Uncomplicated Realistic Preview */}
          <div className="hero-right-col" aria-label="Sample ShipScope diagnostic result preview">
            <div className="preview-card-clean">
              <div className="preview-header-clean">
                <span className="preview-kicker">SAMPLE RESULT</span>
                <span className="preview-tag-badge">Manageable First Version</span>
              </div>

              <div className="preview-body-clean">
                <div className="preview-section-group">
                  <span className="preview-section-label">BUILD FIRST</span>
                  <ul className="preview-items-list">
                    <li>1:1 text matching of one resume against one job description</li>
                    <li>Direct keyword relevance scoring without live web scraping</li>
                  </ul>
                </div>

                <div className="preview-section-group">
                  <span className="preview-section-label">LEAVE FOR LATER</span>
                  <ul className="preview-items-list preview-postpone-list">
                    <li>Live multi-platform job scraping and sync</li>
                    <li>Predictive interview likelihood ranking models</li>
                  </ul>
                </div>

                <div className="preview-step-box">
                  <span className="preview-step-label">FIRST 60 MINUTES</span>
                  <p className="preview-step-content">
                    Compare two plain text files using cosine keyword similarity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Exactly Three Product Pillars */}
      <section className="page-section pillars-section" aria-labelledby="pillars-heading">
        <div className="page-inner">
          <h2 id="pillars-heading" className="sr-only">Product Pillars</h2>
          <div className="pillars-triad-grid">
            {/* Pillar 1: For Students */}
            <div className="pillar-card">
              <span className="pillar-kicker">FOR STUDENTS</span>
              <h3 className="pillar-title">Scope an idea</h3>
              <p className="pillar-desc">
                Turn an ambitious project into a smaller first version.
              </p>
              <div className="pillar-action">
                <Link to="/diagnose" className="pillar-link">
                  <span>Scope your idea</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Pillar 2: For Distribution */}
            <div className="pillar-card">
              <span className="pillar-kicker">FOR DISTRIBUTION</span>
              <h3 className="pillar-title">Reach student communities</h3>
              <p className="pillar-desc">
                Create trackable WhatsApp outreach for class reps, clubs, and placement groups.
              </p>
              <div className="pillar-action">
                <Link to="/growth" className="pillar-link">
                  <span>Create campus message</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Pillar 3: For Growth */}
            <div className="pillar-card">
              <span className="pillar-kicker">FOR GROWTH</span>
              <h3 className="pillar-title">Model the path to 500</h3>
              <p className="pillar-desc">
                See what reach and conversion assumptions would be required.
              </p>
              <div className="pillar-action">
                <Link to="/campaign" className="pillar-link">
                  <span>View 500 plan</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Small Methodology Trust Footer */}
      <section className="page-section trust-footer-section">
        <div className="page-inner">
          <p className="trust-simple-note">
            Deterministic, client-side evaluation. No remote AI calls. Your ideas stay in your browser.
          </p>
        </div>
      </section>
    </div>
  );
};
