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

  // Generate plain-language summary string for "Current signal"
  const getSignalSentence = () => {
    if (evaluation.crA === null || evaluation.crB === null) {
      return 'Enter visits and registrations for both message angles to see comparison results.';
    }

    const diffPct = (evaluation.absoluteDiff! * 100).toFixed(1);

    if (evaluation.leadingVariant === 'tied') {
      return `Both message angles are performing equally at ${(evaluation.crA * 100).toFixed(1)}% conversion.`;
    }

    const leaderName = evaluation.leadingVariant === 'A' ? 'Project scope message (Variant A)' : 'Build-first message (Variant B)';
    const sampleClause = evaluation.isSufficientEvidence
      ? 'with enough data collected to support this direction.'
      : 'but the sample is still too small to make a final decision.';

    return `${leaderName} is currently leading by ${diffPct} percentage points, ${sampleClause}`;
  };

  return (
    <section id="compare-messages" className="section-compare-messages" aria-labelledby="compare-messages-title">
      <div className="section-header-box">
        <div className="title-with-actions">
          <div>
            <h2 id="compare-messages-title" className="section-title">
              Which message performs better?
            </h2>
            <p className="section-subtitle">
              Enter visits and registrations when campaign data becomes available.
            </p>
          </div>
          <div className="lab-controls-bar">
            {isUsingIllustrative ? (
              <span className="illustrative-pill" title="Sample numbers showing how calculations work">
                Sample numbers shown
              </span>
            ) : (
              <button
                type="button"
                className="text-btn-secondary"
                onClick={handleLoadIllustrative}
              >
                Load sample numbers
              </button>
            )}
            <button
              type="button"
              className="text-btn-secondary"
              onClick={handleClear}
            >
              Clear numbers
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="experiment-grid">
        {/* Variant A: Project Scope */}
        <div className="variant-card">
          <div className="variant-header-row">
            <div>
              <span className="variant-kicker">VARIANT A</span>
              <h3 className="variant-title">Project scope message</h3>
            </div>
            <span className="variant-focus-pill">Scope angle</span>
          </div>

          <p className="variant-excerpt">
            &ldquo;{MESSAGE_VARIANTS['scope-hook'].body}&rdquo;
          </p>

          <div className="variant-inputs-row">
            <div className="lab-field">
              <label htmlFor="input-va-visits" className="lab-field-label">
                Visits
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
                Registrations
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
            <span className="rate-label">Conversion Rate:</span>
            <span className="rate-value">
              {evaluation.crA !== null ? `${(evaluation.crA * 100).toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>

        {/* Variant B: Build First */}
        <div className="variant-card">
          <div className="variant-header-row">
            <div>
              <span className="variant-kicker">VARIANT B</span>
              <h3 className="variant-title">Build-first message</h3>
            </div>
            <span className="variant-focus-pill">Build angle</span>
          </div>

          <p className="variant-excerpt">
            &ldquo;{MESSAGE_VARIANTS['build-first-hook'].body}&rdquo;
          </p>

          <div className="variant-inputs-row">
            <div className="lab-field">
              <label htmlFor="input-vb-visits" className="lab-field-label">
                Visits
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
                Registrations
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
            <span className="rate-label">Conversion Rate:</span>
            <span className="rate-value">
              {evaluation.crB !== null ? `${(evaluation.crB * 100).toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Large Plain-Language Conclusion: Current Signal */}
      <div className="current-signal-panel">
        <span className="signal-kicker">CURRENT SIGNAL</span>
        <p className="signal-sentence">{getSignalSentence()}</p>
        <p className="signal-recommendation">{evaluation.recommendation}</p>
      </div>
    </section>
  );
};
