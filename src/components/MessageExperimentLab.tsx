import React, { useState } from 'react';
import {
  VariantData,
  evaluateExperiment
} from '../logic/experimentLab';
import { MESSAGE_VARIANTS } from '../logic/connectorKit';

// Visibly marked illustrative initial example values
const ILLUSTRATIVE_EXAMPLE: { variantA: VariantData; variantB: VariantData } = {
  variantA: { visits: 120, registrations: 29 }, // 24.2%
  variantB: { visits: 110, registrations: 19 }  // 17.3%
};

const EMPTY_STATE: { variantA: VariantData; variantB: VariantData } = {
  variantA: { visits: 0, registrations: 0 },
  variantB: { visits: 0, registrations: 0 }
};

export const MessageExperimentLab: React.FC = () => {
  const [data, setData] = useState<{ variantA: VariantData; variantB: VariantData }>(ILLUSTRATIVE_EXAMPLE);
  const [isUsingIllustrative, setIsUsingIllustrative] = useState<boolean>(true);

  const evaluation = evaluateExperiment(data.variantA, data.variantB);

  const handleInputChange = (
    variant: 'variantA' | 'variantB',
    field: 'visits' | 'registrations',
    val: number
  ) => {
    setIsUsingIllustrative(false);
    setData((prev) => ({
      ...prev,
      [variant]: {
        ...prev[variant],
        [field]: Math.max(0, isNaN(val) ? 0 : val)
      }
    }));
  };

  const handleLoadIllustrative = () => {
    setData(ILLUSTRATIVE_EXAMPLE);
    setIsUsingIllustrative(true);
  };

  const handleClear = () => {
    setData(EMPTY_STATE);
    setIsUsingIllustrative(false);
  };

  return (
    <section id="experiment-lab" className="section-experiment-lab" aria-labelledby="experiment-lab-title">
      <div className="section-header-box">
        <div className="header-meta-row">
          <span className="spec-indicator">CAMPAIGN EXPERIMENTATION</span>
          <span className="badge-mono">MESSAGE OPTIMIZATION</span>
        </div>
        <div className="title-with-actions">
          <div>
            <h3 id="experiment-lab-title" className="section-title">
              Message Experiment Lab
            </h3>
            <p className="section-subtitle">
              Model and evaluate A/B message variant performance once broadcast links generate inbound visits and signups.
            </p>
          </div>
          <div className="lab-controls-bar">
            {isUsingIllustrative ? (
              <span className="illustrative-pill" title="These numbers are sample figures to illustrate calculation behavior">
                Illustrative inputs — replace with observed campaign data
              </span>
            ) : (
              <button
                type="button"
                className="text-btn-secondary"
                onClick={handleLoadIllustrative}
              >
                Load illustrative numbers
              </button>
            )}
            <button
              type="button"
              className="text-btn-secondary"
              onClick={handleClear}
            >
              Clear inputs
            </button>
          </div>
        </div>
      </div>

      <div className="experiment-grid">
        {/* Variant A Column */}
        <div className="variant-card">
          <div className="variant-header-row">
            <div>
              <span className="variant-kicker">VARIANT A</span>
              <h4 className="variant-title">{MESSAGE_VARIANTS['scope-hook'].name}</h4>
            </div>
            <span className="variant-focus-pill">{MESSAGE_VARIANTS['scope-hook'].hook}</span>
          </div>

          <p className="variant-excerpt">
            &ldquo;{MESSAGE_VARIANTS['scope-hook'].body}&rdquo;
          </p>

          <div className="variant-inputs-row">
            <div className="lab-field">
              <label htmlFor="input-va-visits" className="lab-field-label">
                Visits <code>(clicks)</code>
              </label>
              <input
                id="input-va-visits"
                type="number"
                min="0"
                value={data.variantA.visits || ''}
                onChange={(e) => handleInputChange('variantA', 'visits', parseInt(e.target.value, 10))}
                placeholder="0"
                className="numeric-input"
              />
            </div>

            <div className="lab-field">
              <label htmlFor="input-va-reg" className="lab-field-label">
                Registrations <code>(signups)</code>
              </label>
              <input
                id="input-va-reg"
                type="number"
                min="0"
                value={data.variantA.registrations || ''}
                onChange={(e) => handleInputChange('variantA', 'registrations', parseInt(e.target.value, 10))}
                placeholder="0"
                className="numeric-input"
              />
            </div>
          </div>

          <div className="variant-rate-box">
            <span className="rate-label">Conversion Rate (Reg / Visits):</span>
            <span className="rate-value">
              {evaluation.crA !== null ? `${(evaluation.crA * 100).toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>

        {/* Variant B Column */}
        <div className="variant-card">
          <div className="variant-header-row">
            <div>
              <span className="variant-kicker">VARIANT B</span>
              <h4 className="variant-title">{MESSAGE_VARIANTS['build-first-hook'].name}</h4>
            </div>
            <span className="variant-focus-pill">{MESSAGE_VARIANTS['build-first-hook'].hook}</span>
          </div>

          <p className="variant-excerpt">
            &ldquo;{MESSAGE_VARIANTS['build-first-hook'].body}&rdquo;
          </p>

          <div className="variant-inputs-row">
            <div className="lab-field">
              <label htmlFor="input-vb-visits" className="lab-field-label">
                Visits <code>(clicks)</code>
              </label>
              <input
                id="input-vb-visits"
                type="number"
                min="0"
                value={data.variantB.visits || ''}
                onChange={(e) => handleInputChange('variantB', 'visits', parseInt(e.target.value, 10))}
                placeholder="0"
                className="numeric-input"
              />
            </div>

            <div className="lab-field">
              <label htmlFor="input-vb-reg" className="lab-field-label">
                Registrations <code>(signups)</code>
              </label>
              <input
                id="input-vb-reg"
                type="number"
                min="0"
                value={data.variantB.registrations || ''}
                onChange={(e) => handleInputChange('variantB', 'registrations', parseInt(e.target.value, 10))}
                placeholder="0"
                className="numeric-input"
              />
            </div>
          </div>

          <div className="variant-rate-box">
            <span className="rate-label">Conversion Rate (Reg / Visits):</span>
            <span className="rate-value">
              {evaluation.crB !== null ? `${(evaluation.crB * 100).toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Summary & Decision Guidance */}
      <div className="experiment-analysis-panel">
        <div className="analysis-kpis-row">
          <div className="analysis-kpi-block">
            <span className="analysis-label">Current Leading Variant:</span>
            <span className="analysis-value">
              {evaluation.leadingVariant === 'A' ? (
                <strong className="lead-tag lead-a">Variant A (Scope Hook)</strong>
              ) : evaluation.leadingVariant === 'B' ? (
                <strong className="lead-tag lead-b">Variant B (Build-First Hook)</strong>
              ) : evaluation.leadingVariant === 'tied' ? (
                <strong className="lead-tag lead-tied">Closely Aligned / Tied</strong>
              ) : (
                <span className="lead-tag lead-none">—</span>
              )}
            </span>
          </div>

          <div className="analysis-kpi-block">
            <span className="analysis-label">Absolute Difference:</span>
            <span className="analysis-value">
              {evaluation.absoluteDiff !== null ? (
                <code>+{(evaluation.absoluteDiff * 100).toFixed(1)} percentage points</code>
              ) : (
                '—'
              )}
            </span>
          </div>

          <div className="analysis-kpi-block">
            <span className="analysis-label">Sample Evidence Status:</span>
            <span className="analysis-value">
              {evaluation.isSufficientEvidence ? (
                <span className="evidence-pill evidence-sufficient">Adequate sample size (30+ each)</span>
              ) : (
                <span className="evidence-pill evidence-insufficient">Sample size too small (&lt;30 each)</span>
              )}
            </span>
          </div>
        </div>

        <div className="decision-guidance-box">
          <div className="guidance-head">
            <span className="spec-indicator">DECISION GUIDANCE</span>
            <p className="guidance-headline">{evaluation.guidanceText}</p>
          </div>
          <p className="guidance-body">{evaluation.recommendation}</p>
        </div>
      </div>
    </section>
  );
};
