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

  // Separate overarching architectural signals from factor items
  const architecturalSignals = result.reasons.filter(
    (reason) => !result.detectedComplexityFactors.some((factor) => reason.startsWith(`Detected ${factor.name}:`))
  );

  return (
    <article className="results-worksheet" aria-labelledby="results-main-title">
      {/* 1. Full-Width Verdict Banner */}
      <div className={`verdict-banner ${status.summaryClass}`}>
        <div className="verdict-meta-bar">
          <div className="verdict-tag-group">
            <span className="worksheet-label">RESULT</span>
            <span className={`status-pill ${status.tagClass}`}>
              {status.label}
            </span>
          </div>
          <div className="scope-metric-box">
            <span className="metric-label">FIT:</span>
            <span className="metric-fit-label"><code>{result.fitLabel}</code></span>
            {!result.isUnderspecified && (
              <span className="metric-subdetail">
                ({result.heuristicScopeScore}/100)
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

      {/* 2. Wide 2-Column Comparison: Build First vs Leave for Later */}
      <div className="scoping-contrast-grid">
        {/* Left: Build First */}
        <section className="contrast-column build-first-col" aria-labelledby="build-first-heading">
          <div className="column-header">
            <span className="col-indicator col-green" aria-hidden="true">■</span>
            <div>
              <h4 id="build-first-heading" className="column-title">Build first</h4>
              <p className="column-subtitle">The smallest feature set that demonstrates your central idea.</p>
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

        {/* Right: Leave for Later */}
        <section className="contrast-column leave-later-col" aria-labelledby="leave-later-heading">
          <div className="column-header">
            <span className="col-indicator col-neutral" aria-hidden="true">■</span>
            <div>
              <h4 id="leave-later-heading" className="column-title">Leave for later</h4>
              <p className="column-subtitle">Secondary features that should wait until version one works.</p>
            </div>
          </div>
          <ul className="action-list">
            {result.featuresToPostpone.map((feat, idx) => (
              <li key={idx} className="action-item postpone-item">
                <span className="item-num">LATER</span>
                <span className="item-text">{feat}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 3. Your First 60 Minutes */}
      <section className="results-section section-roadmap" aria-labelledby="roadmap-heading">
        <div className="section-title-bar">
          <div>
            <h4 id="roadmap-heading" className="section-heading">
              Your first 60 minutes
            </h4>
            <p className="section-subtitle">
              A clear execution sequence to validate your project before adding secondary layers.
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

      {/* 4. How to Know It Works (Acceptance Test) */}
      <section className="results-section section-test" aria-labelledby="test-heading">
        <div className="test-panel">
          <div className="test-header">
            <span className="test-kicker">SUCCESS TEST</span>
            <h4 id="test-heading" className="test-title">
              How to know it works
            </h4>
          </div>
          <p className="test-body">
            {result.successTest}
          </p>
          <div className="test-rule-footer">
            <code>TEST:</code> If this observable test succeeds, your first version works.
          </div>
        </div>
      </section>

      {/* 5. Workshop Next Step & Teammate Sharing */}
      <WorkshopCTA
        presetTitle={presetTitle}
        attribution={attribution}
      />

      {/* 6. Secondary Disclosure: How this result was evaluated */}
      {(architecturalSignals.length > 0 || result.detectedComplexityFactors.length > 0) && (
        <details className="secondary-disclosure-details">
          <summary className="disclosure-summary">
            How this result was evaluated ({result.detectedComplexityFactors.length} technical factors checked)
          </summary>
          <div className="disclosure-content">
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
          </div>
        </details>
      )}

      {/* 7. Secondary Disclosure: Methodology & Boundaries */}
      <details className="secondary-disclosure-details">
        <summary className="disclosure-summary">
          Methodology & planning notes
        </summary>
        <div className="disclosure-content">
          <ul className="assumptions-list">
            {result.assumptionsAndLimitations.map((item, idx) => (
              <li key={idx} className="assumption-item">
                <span className="bullet-sym">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </article>
  );
};
