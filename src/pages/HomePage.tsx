import React from 'react';
import { useRouter, Link } from '../router/Router';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="page-home">
      {/* 1. Full-Width contained Hero Grid */}
      <section className="home-hero-section" aria-labelledby="home-hero-heading">
        <div className="home-hero-grid">
          {/* Left Column: Core Positioning & Actions */}
          <div className="hero-left-col">
            <div className="hero-label-badge">
              <span className="badge-kicker">AI CAPSTONE SCOPE DIAGNOSTIC</span>
            </div>
            <h1 id="home-hero-heading" className="home-hero-headline">
              Turn an ambitious AI project into a buildable first version.
            </h1>
            <p className="home-hero-subhead">
              ShipScope helps final-year engineering students decide what to build first, what to postpone, and how to start — then connects that value to a measurable workshop growth loop.
            </p>

            <div className="hero-cta-group">
              <button
                type="button"
                className="btn-primary btn-hero"
                onClick={() => navigate('/diagnose')}
              >
                <span>Assess a project</span>
                <span className="cta-arrow" aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className="btn-secondary btn-hero"
                onClick={() => navigate('/campaign')}
              >
                <span>Explore the growth system</span>
              </button>
            </div>

            <div className="hero-target-meta">
              <span className="meta-icon" aria-hidden="true">ℹ</span>
              <span>
                Engineered for final-year engineering students • Built for NxtWave's 7-Day / 500-Registration Growth Challenge
              </span>
            </div>
          </div>

          {/* Right Column: Authentic Product Output Preview */}
          <div className="hero-right-col" aria-label="ShipScope diagnostic sample output">
            <div className="preview-sheet-frame">
              <div className="preview-sheet-header">
                <div className="preview-chip-group">
                  <span className="preview-label">SAMPLE DIAGNOSTIC VERDICT</span>
                  <span className="status-pill status-tag-narrow">Needs Narrowing</span>
                </div>
                <div className="preview-metric">
                  <span className="metric-fit-label"><code>Moderate fit</code></span>
                </div>
              </div>

              <div className="preview-sheet-body">
                <h4 className="preview-verdict-title">Scope Needs Narrowing</h4>
                <p className="preview-verdict-desc">
                  Trimming 2–3 peripheral systems will dramatically increase first-version delivery speed while preserving your core capability.
                </p>

                <div className="preview-contrast-mini">
                  <div className="mini-col mini-build">
                    <span className="mini-col-kicker">■ BUILD FIRST (V1)</span>
                    <p className="mini-text">Single PDF ingestion with verbatim passage citation</p>
                  </div>
                  <div className="mini-col mini-postpone">
                    <span className="mini-col-kicker">■ LEAVE FOR LATER</span>
                    <p className="mini-text">Multi-format parsers, vector DB clusters & user auth</p>
                  </div>
                </div>

                <div className="preview-step-callout">
                  <span className="step-callout-phase">PHASE 01 • FIRST 15 MIN</span>
                  <strong className="step-callout-task">Establish Single-Document Input/Output Contract</strong>
                </div>
              </div>

              <div className="preview-sheet-footer">
                <span className="preview-footer-note">
                  Deterministic analysis based on 7 technical complexity heuristics.
                </span>
                <Link to="/diagnose" className="preview-interactive-link">
                  Try live diagnostic →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How it works: 4 Horizontal Steps */}
      <section className="home-process-section" aria-labelledby="process-heading">
        <div className="section-head-compact">
          <span className="spec-indicator">METHODOLOGY</span>
          <h2 id="process-heading" className="home-section-title">
            How ShipScope works
          </h2>
        </div>

        <div className="process-horizontal-grid">
          <div className="process-step-item">
            <div className="step-num-badge">01</div>
            <h3 className="step-title">IDEA</h3>
            <p className="step-desc">
              Describe what you want to build or select an intentional teaching case study.
            </p>
          </div>

          <div className="process-step-arrow" aria-hidden="true">→</div>

          <div className="process-step-item">
            <div className="step-num-badge">02</div>
            <h3 className="step-title">SCOPE</h3>
            <p className="step-desc">
              Identify high-risk infrastructure and separate Essential V1 from deferred features.
            </p>
          </div>

          <div className="process-step-arrow" aria-hidden="true">→</div>

          <div className="process-step-item">
            <div className="step-num-badge">03</div>
            <h3 className="step-title">BUILD</h3>
            <p className="step-desc">
              Follow an observable 60-minute roadmap and connect to NxtWave's live workshop.
            </p>
          </div>

          <div className="process-step-arrow" aria-hidden="true">→</div>

          <div className="process-step-item">
            <div className="step-num-badge">04</div>
            <h3 className="step-title">GROW</h3>
            <p className="step-desc">
              Equip campus connectors with trackable links to reach the 500-registration goal.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Product Modules Overview */}
      <section className="home-modules-section" aria-labelledby="modules-heading">
        <div className="section-head-compact">
          <span className="spec-indicator">PRODUCT MODULES</span>
          <h2 id="modules-heading" className="home-section-title">
            Three dedicated engineering workbenches
          </h2>
        </div>

        <div className="modules-triad-grid">
          {/* Module 1 */}
          <div className="module-card">
            <div className="module-card-header">
              <span className="module-tag">STUDENT TOOL</span>
              <span className="module-status-chip">WORKBENCH 01</span>
            </div>
            <h3 className="module-card-title">Scope Diagnostic</h3>
            <p className="module-card-desc">
              Turn an ambitious AI capstone idea into a realistic, buildable first-version plan. Evaluates complexity heuristics, separates V1 from V2, and provides an observable acceptance test.
            </p>
            <div className="module-features-list">
              <span>• 4 preloaded case study presets</span>
              <span>• Custom specification evaluation</span>
              <span>• 60-minute execution sequence</span>
            </div>
            <div className="module-card-footer">
              <Link to="/diagnose" className="btn-secondary btn-module">
                <span>Open Diagnostic Workbench</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Module 2 */}
          <div className="module-card">
            <div className="module-card-header">
              <span className="module-tag">DISTRIBUTION TOOL</span>
              <span className="module-status-chip">WORKBENCH 02</span>
            </div>
            <h3 className="module-card-title">Campus Growth Toolkit</h3>
            <p className="module-card-desc">
              Empower Class Representatives, coding clubs, and campus leads with trackable WhatsApp distribution messages. Test Project Scope hooks against Build-First hooks with sample-size-aware analytics.
            </p>
            <div className="module-features-list">
              <span>• Campus connector link generator</span>
              <span>• Automated UTM source sanitization</span>
              <span>• Message Experiment Lab (A/B testing)</span>
            </div>
            <div className="module-card-footer">
              <Link to="/growth" className="btn-secondary btn-module">
                <span>Open Growth Toolkit</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Module 3 */}
          <div className="module-card">
            <div className="module-card-header">
              <span className="module-tag">PLANNING INSTRUMENT</span>
              <span className="module-status-chip">WORKBENCH 03</span>
            </div>
            <h3 className="module-card-title">7-Day Campaign Model</h3>
            <p className="module-card-desc">
              Stress-test the assumptions required to achieve 500 workshop registrations on a ₹2,000 budget. Models exposures, overlap, visit rates, conversion, and referral multipliers.
            </p>
            <div className="module-features-list">
              <span>• Conservative, Base & Stretch planning</span>
              <span>• Automated bottleneck diagnosis</span>
              <span>• 7-day tactical sprint timeline</span>
            </div>
            <div className="module-card-footer">
              <Link to="/campaign" className="btn-secondary btn-module">
                <span>Open Campaign Model</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Complete Growth Loop Flow */}
      <section className="home-loop-section" aria-labelledby="loop-heading">
        <div className="section-head-compact">
          <span className="spec-indicator">ACQUISITION STRATEGY</span>
          <h2 id="loop-heading" className="home-section-title">
            The Complete Acquisition Loop
          </h2>
          <p className="home-section-subtitle">
            How a genuine engineering problem creates organic, high-intent workshop demand.
          </p>
        </div>

        <div className="loop-flow-bar">
          <div className="loop-node">
            <span className="node-kicker">PROBLEM</span>
            <strong className="node-text">Student Capstone Overscoping</strong>
          </div>
          <span className="loop-arrow" aria-hidden="true">→</span>
          <div className="loop-node">
            <span className="node-kicker">VALUE</span>
            <strong className="node-text">Objective Scope Diagnosis</strong>
          </div>
          <span className="loop-arrow" aria-hidden="true">→</span>
          <div className="loop-node">
            <span className="node-kicker">CONVERSION</span>
            <strong className="node-text">Free 60-Min Workshop Bridge</strong>
          </div>
          <span className="loop-arrow" aria-hidden="true">→</span>
          <div className="loop-node">
            <span className="node-kicker">DISTRIBUTION</span>
            <strong className="node-text">Connector Kit Sharing</strong>
          </div>
          <span className="loop-arrow" aria-hidden="true">→</span>
          <div className="loop-node">
            <span className="node-kicker">SCALE</span>
            <strong className="node-text">7-Day Growth Target</strong>
          </div>
        </div>
      </section>

      {/* 5. Methodology & Trust Note */}
      <section className="home-trust-section" aria-labelledby="trust-heading">
        <div className="trust-card">
          <div className="trust-head">
            <span className="mono-badge">METHODOLOGY BOUNDARIES</span>
            <h3 id="trust-heading" className="trust-title">
              Engineered for Transparent Trust
            </h3>
          </div>
          <div className="trust-grid">
            <div className="trust-item">
              <strong>Rule-Based & Deterministic</strong>
              <p>Evaluates technical architecture using transparent complexity heuristics, not black-box LLM predictions.</p>
            </div>
            <div className="trust-item">
              <strong>100% Client-Side Privacy</strong>
              <p>Project descriptions remain in your browser. No user tracking, no authentication, and no private data collected.</p>
            </div>
            <div className="trust-item">
              <strong>Hypothetical Planning Projections</strong>
              <p>All campaign metrics and simulator outputs are mathematical planning estimates, not live analytics claims.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
