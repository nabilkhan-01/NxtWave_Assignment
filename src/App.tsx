import React from 'react';
import './App.css';

export const App: React.FC = () => {
  return (
    <div className="workbench-shell">
      {/* Top Engineering Banner & Metadata Bar */}
      <header className="workbench-header">
        <div className="container header-container">
          <div className="brand-group">
            <span className="brand-badge">DIAGNOSTIC BENCH v1.0</span>
            <h1 className="brand-title">ShipScope</h1>
          </div>
          <div className="nav-spec">
            <span className="spec-indicator">PROCESS</span>
            <span className="process-flow">
              <code>IDEA</code>
              <span className="flow-arrow" aria-hidden="true">→</span>
              <code>SCOPE</code>
              <span className="flow-arrow" aria-hidden="true">→</span>
              <code>BUILD</code>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container main-content">
        {/* Editorial Header Section */}
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-kicker">AI Capstone Scope Diagnostic</div>
          <h2 id="hero-title" className="hero-headline">
            Your capstone idea deserves a smaller first step.
          </h2>
          <p className="hero-subhead">
            Describe what you want to build. See what belongs in version one, what can wait, and where to start.
          </p>
        </section>

        {/* Milestone 1 Shell Notice */}
        <section className="workbench-status-panel">
          <div className="status-header">
            <div className="status-label-group">
              <span className="status-dot"></span>
              <span className="status-title">Workbench Shell Initialized</span>
            </div>
            <span className="status-mono-id">MILESTONE 1 VERIFIED</span>
          </div>
          <div className="status-body">
            <p>
              ShipScope diagnostic engine foundation is set up with strict TypeScript, Vite, zero external bloat, and an editorial engineering-workbench visual system.
            </p>
            <div className="status-specs-grid">
              <div className="spec-item">
                <span className="spec-key">MODE</span>
                <span className="spec-val">Deterministic Rule-based Diagnostic</span>
              </div>
              <div className="spec-item">
                <span className="spec-key">STACK</span>
                <span className="spec-val">React + TypeScript + Plain CSS</span>
              </div>
              <div className="spec-item">
                <span className="spec-key">TARGET</span>
                <span className="spec-val">Final-Year Engineering Students</span>
              </div>
              <div className="spec-item">
                <span className="spec-key">PRIVACY</span>
                <span className="spec-val">Client-Side Only (No Tracking/Keys)</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="workbench-footer">
        <div className="container footer-container">
          <p className="footer-note">
            ShipScope is a deterministic scoping diagnostic for engineering students. Built for practical first-version execution.
          </p>
          <div className="footer-specs">
            <code>EST. 2026</code>
            <span className="divider">•</span>
            <code>NO-SLOP BENCH</code>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
