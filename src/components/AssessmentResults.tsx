import React from 'react';
import { ScopeAssessmentResult } from '../types';
import { AttributionParams } from '../logic/attribution';
import { WorkshopCTA } from './WorkshopCTA';

interface AssessmentResultsProps {
  result: ScopeAssessmentResult;
  presetTitle?: string;
  attribution: AttributionParams;
  onEditIdea: () => void;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  result,
  presetTitle,
  attribution,
  onEditIdea
}) => {
  const getStatusBadge = () => {
    if (result.isUnderspecified) {
      return {
        label: 'Needs More Definition',
        tagClass: 'status-tag-neutral',
        summaryClass: 'summary-neutral'
      };
    }

    switch (result.classification) {
      case 'manageable':
        return {
          label: 'Manageable First Version',
          tagClass: 'status-tag-manageable',
          summaryClass: 'summary-manageable'
        };
      case 'needs-narrowing':
        return {
          label: 'Needs Narrowing',
          tagClass: 'status-tag-narrow',
          summaryClass: 'summary-narrow'
        };
      case 'too-broad':
        return {
          label: 'Too Broad for a 1st Version',
          tagClass: 'status-tag-broad',
          summaryClass: 'summary-broad'
        };
    }
  };

  const status = getStatusBadge();

  // Separate overarching architectural signals (e.g. density, brevity, or clean focus)
  // from rule-level factor items that are detailed in the cards below
  const architecturalSignals = result.reasons.filter(
    (reason) => !result.detectedComplexityFactors.some((factor) => reason.startsWith(`Detected ${factor.name}:`))
  );

  return (
    <article className="results-worksheet" aria-labelledby="results-main-title">
      {/* 1. Header & Verdict Panel */}
      <div className={`verdict-banner ${status.summaryClass}`}>
        <div className="verdict-meta-bar">
          <div className="verdict-tag-group">
            <span className="worksheet-label">DIAGNOSTIC VERDICT</span>
            <span className={`status-pill ${status.tagClass}`}>
              {status.label}
            </span>
          </div>
          <div className="scope-metric-box">
            <span className="metric-label">ESTIMATED FIT:</span>
            <span className="metric-fit-label"><code>{result.fitLabel}</code></span>
            {!result.isUnderspecified && (
              <span className="metric-subdetail">
                (Rule-based score: {result.heuristicScopeScore}/100)
              </span>
            )}
          </div>
        </div>

        <div className="verdict-content">
          <h3 id="results-main-title" className="verdict-headline">
            {result.verdictTitle}
          </h3>
          <p className="verdict-explanation">
            {result.explanation}
          </p>
          <div className="methodology-note">
            <span className="mono-badge">NOTE</span>
            <span>
              Rule-based scope indicator reflects initial architecture complexity and feature breadth. It is an engineering scoping tool, not a prediction of academic grades, viva outcomes, or hiring probability.
            </span>
          </div>
        </div>

        <div className="verdict-actions-bar">
          <button
            type="button"
            className="btn-secondary"
            onClick={onEditIdea}
          >
            <span>← Edit idea description</span>
          </button>
        </div>
      </div>

      {/* Grid: Why & Complexity Factors */}
      <section className="results-section section-reasons" aria-labelledby="reasons-heading">
        <div className="section-title-bar">
          <h4 id="reasons-heading" className="section-heading">
            Why ShipScope reached this result
          </h4>
          <span className="section-meta-count">
            {result.detectedComplexityFactors.length} complexity factor{result.detectedComplexityFactors.length === 1 ? '' : 's'} identified
          </span>
        </div>

        {architecturalSignals.length > 0 && (
          <div className="reasons-list">
            {architecturalSignals.map((reason, idx) => (
              <div key={idx} className="reason-item">
                <span className="reason-bullet" aria-hidden="true">▸</span>
                <p className="reason-text">{reason}</p>
              </div>
            ))}
          </div>
        )}

        {result.detectedComplexityFactors.length > 0 && (
          <div className="complexity-grid">
            {result.detectedComplexityFactors.map((factor) => (
              <div key={factor.id} className="factor-card">
                <div className="factor-header">
                  <span className="factor-category">{factor.category.toUpperCase()}</span>
                  <span className={`factor-severity severity-${factor.severity}`}>
                    {factor.severity} risk
                  </span>
                </div>
                <h5 className="factor-name">{factor.name}</h5>
                <p className="factor-desc">{factor.description}</p>
                <div className="factor-pattern">
                  <span className="pattern-label">Detected from:</span>
                  <code>&ldquo;{factor.detectedPattern}&rdquo;</code>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Core Scoping Contrast: Build First vs Leave for Later */}
      <div className="scoping-contrast-grid">
        {/* 3. Build First */}
        <section className="contrast-column build-first-col" aria-labelledby="build-first-heading">
          <div className="column-header">
            <span className="col-indicator col-green" aria-hidden="true">■</span>
            <div>
              <h4 id="build-first-heading" className="column-title">Build first (Essential V1)</h4>
              <p className="column-subtitle">The smallest feature set that demonstrates your central use case.</p>
            </div>
          </div>
          <ul className="action-list">
            {result.essentialV1Features.map((feat, idx) => (
              <li key={idx} className="action-item">
                <span className="item-num">0{idx + 1}</span>
                <span className="item-text">{feat}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Leave for Later */}
        <section className="contrast-column leave-later-col" aria-labelledby="leave-later-heading">
          <div className="column-header">
            <span className="col-indicator col-neutral" aria-hidden="true">■</span>
            <div>
              <h4 id="leave-later-heading" className="column-title">Leave for later (Defer beyond V1)</h4>
              <p className="column-subtitle">Useful features whose complexity can be safely deferred.</p>
            </div>
          </div>
          <ul className="action-list">
            {result.featuresToPostpone.map((feat, idx) => (
              <li key={idx} className="action-item postpone-item">
                <span className="item-num">POSTPONE</span>
                <span className="item-text">{feat}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 5. A Productive First 60 Minutes */}
      <section className="results-section section-roadmap" aria-labelledby="roadmap-heading">
        <div className="section-title-bar">
          <div>
            <h4 id="roadmap-heading" className="section-heading">
              A productive first 60 minutes
            </h4>
            <p className="section-subtitle">
              A realistic initial execution sequence to validate your project's core data flow before adding interface layers.
            </p>
          </div>
          <span className="badge-mono">4 STEPS • 60 MIN</span>
        </div>

        <div className="roadmap-grid">
          {result.first60MinuteRoadmap.map((step, idx) => (
            <div key={idx} className="roadmap-card">
              <div className="roadmap-phase-row">
                <span className="step-phase">{step.phase}</span>
                <span className="step-duration">{step.durationMinutes} min</span>
              </div>
              <h5 className="step-task">{step.task}</h5>
              <div className="step-deliverable-box">
                <span className="deliv-label">OUTPUT:</span>
                <p className="step-deliverable">{step.deliverable}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. How to Know It Works (Acceptance Test) */}
      <section className="results-section section-test" aria-labelledby="test-heading">
        <div className="test-panel">
          <div className="test-header">
            <span className="test-kicker">ACCEPTANCE TEST CRITERIA</span>
            <h4 id="test-heading" className="test-title">
              How to know your V1 works
            </h4>
          </div>
          <p className="test-body">
            {result.successTest}
          </p>
          <div className="test-rule-footer">
            <code>RULE:</code> If this observable test succeeds, your proof of concept is valid and ready to present to your project advisor.
          </div>
        </div>
      </section>

      {/* 7. Workshop Next Step & Teammate Sharing */}
      <WorkshopCTA
        presetTitle={presetTitle}
        attribution={attribution}
      />

      {/* 8. Methodology Boundaries & Assumptions */}
      <section className="results-section section-assumptions" aria-labelledby="assumptions-heading">
        <h5 id="assumptions-heading" className="assumptions-title">Assumptions & Methodology Boundaries</h5>
        <ul className="assumptions-list">
          {result.assumptionsAndLimitations.map((item, idx) => (
            <li key={idx} className="assumption-item">
              <span className="bullet-sym">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
};

