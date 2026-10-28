import React, { useState, useMemo } from 'react';
import {
  calculateGrowthFunnel,
  analyzeScenarioGuidance,
  CAMPAIGN_SCENARIOS,
  DEFAULT_GROWTH_INPUTS,
  CampaignScenario
} from '../logic/growthSimulator';
import { GrowthSimulatorInputs } from '../types';

export const GrowthSimulator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('base');
  const [inputs, setInputs] = useState<GrowthSimulatorInputs>(DEFAULT_GROWTH_INPUTS);

  // Derived outputs from pure calculation engine
  const outputs = useMemo(() => calculateGrowthFunnel(inputs), [inputs]);
  const guidance = useMemo(() => analyzeScenarioGuidance(inputs, outputs), [inputs, outputs]);

  const handleSelectScenario = (scenario: CampaignScenario) => {
    setActiveScenarioId(scenario.id);
    setInputs({ ...scenario.inputs });
  };

  const handleInputChange = (field: keyof GrowthSimulatorInputs, val: number) => {
    setActiveScenarioId('custom');
    setInputs((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  return (
    <section id="growth-model" className="section-simulator" aria-labelledby="simulator-heading">
      <div className="simulator-toggle-wrapper">
        <button
          type="button"
          className="simulator-accordion-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="growth-model-content"
        >
          <div className="accordion-title-group">
            <span className="spec-indicator">SCENARIO PLANNER</span>
            <h3 id="simulator-heading" className="simulator-main-title">
              Explore the 7-day growth model
            </h3>
            <p className="simulator-subtitle">
              Adjust the assumptions to see what would need to be true for the campaign to reach 500 registrations with a ₹2,000 budget.
            </p>
          </div>
          <div className="accordion-action">
            <span className="simulator-disclaimer-pill">Hypothetical planning simulation — not live campaign data</span>
            <span className="accordion-arrow" aria-hidden="true">{isOpen ? '▲ Collapse' : '▼ Expand model'}</span>
          </div>
        </button>
      </div>

      {isOpen && (
        <div id="growth-model-content" className="simulator-body">
          {/* Quick Scenario Presets */}
          <div className="scenarios-bar">
            <span className="scenarios-label">PLANNING SCENARIOS:</span>
            <div className="scenario-buttons-row" role="group" aria-label="Select a planning scenario">
              {(Object.keys(CAMPAIGN_SCENARIOS) as Array<keyof typeof CAMPAIGN_SCENARIOS>).map((key) => {
                const s = CAMPAIGN_SCENARIOS[key];
                const isSelected = activeScenarioId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`scenario-btn ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleSelectScenario(s)}
                    aria-pressed={isSelected}
                  >
                    <span className="scenario-btn-name">{s.name}</span>
                    <span className="scenario-btn-badge">{s.badge}</span>
                  </button>
                );
              })}
              {activeScenarioId === 'custom' && (
                <span className="scenario-custom-pill">CUSTOM PARAMS</span>
              )}
            </div>
          </div>

          {/* Grid Layout: Inputs (Left) and Calculated Funnel (Right) */}
          <div className="simulator-grid">
            {/* Input Columns */}
            <div className="simulator-inputs-col">
              {/* Group 1: Distribution */}
              <div className="input-group-panel">
                <h4 className="group-title">1. Distribution Assumptions</h4>
                <div className="input-fields-list">
                  <div className="field-item">
                    <label htmlFor="input-connectors" className="field-label">
                      Campus connectors
                      <span className="field-unit">(student ambassadors)</span>
                    </label>
                    <div className="field-control">
                      <input
                        id="input-connectors"
                        type="number"
                        min="0"
                        max="200"
                        value={inputs.connectors}
                        onChange={(e) => handleInputChange('connectors', Number(e.target.value))}
                        className="numeric-input"
                      />
                      <span className="unit-affix">connectors</span>
                    </div>
                  </div>

                  <div className="field-item">
                    <label htmlFor="input-groups" className="field-label">
                      Groups per connector
                      <span className="field-unit">(WhatsApp / Telegram)</span>
                    </label>
                    <div className="field-control">
                      <input
                        id="input-groups"
                        type="number"
                        min="0"
                        max="50"
                        value={inputs.groupsPerConnector}
                        onChange={(e) => handleInputChange('groupsPerConnector', Number(e.target.value))}
                        className="numeric-input"
                      />
                      <span className="unit-affix">groups / conn</span>
                    </div>
                  </div>

                  <div className="field-item">
                    <label htmlFor="input-size" className="field-label">
                      Average group size
                      <span className="field-unit">(members per group)</span>
                    </label>
                    <div className="field-control">
                      <input
                        id="input-size"
                        type="number"
                        min="0"
                        max="1000"
                        value={inputs.averageGroupSize}
                        onChange={(e) => handleInputChange('averageGroupSize', Number(e.target.value))}
                        className="numeric-input"
                      />
                      <span className="unit-affix">students / group</span>
                    </div>
                  </div>

                  <div className="field-item">
                    <label htmlFor="input-overlap" className="field-label">
                      Audience overlap
                      <span className="field-unit">(students in multiple groups)</span>
                    </label>
                    <div className="field-control">
                      <input
                        id="input-overlap"
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(inputs.overlapRate * 100)}
                        onChange={(e) => handleInputChange('overlapRate', Number(e.target.value) / 100)}
                        className="numeric-input"
                      />
                      <span className="unit-affix">% overlap</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Conversion */}
              <div className="input-group-panel">
                <h4 className="group-title">2. Conversion Assumptions</h4>
                <div className="input-fields-list">
                  <div className="field-item">
                    <label htmlFor="input-visit-rate" className="field-label">
                      Visit rate
                      <span className="field-unit">(clicks per unique reach)</span>
                    </label>
                    <div className="field-control">
                      <input
                        id="input-visit-rate"
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(inputs.visitRate * 100)}
                        onChange={(e) => handleInputChange('visitRate', Number(e.target.value) / 100)}
                        className="numeric-input"
                      />
                      <span className="unit-affix">% visit rate</span>
                    </div>
                  </div>

                  <div className="field-item">
                    <label htmlFor="input-conv-rate" className="field-label">
                      Registration conversion
                      <span className="field-unit">(signups per visit)</span>
                    </label>
                    <div className="field-control">
                      <input
                        id="input-conv-rate"
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(inputs.registrationConversionRate * 100)}
                        onChange={(e) => handleInputChange('registrationConversionRate', Number(e.target.value) / 100)}
                        className="numeric-input"
                      />
                      <span className="unit-affix">% reg conversion</span>
                    </div>
                  </div>

                  <div className="field-item">
                    <label htmlFor="input-k" className="field-label">
                      Referral factor (K)
                      <span className="field-unit">(incremental referral registrations per direct)</span>
                    </label>
                    <div className="field-control">
                      <input
                        id="input-k"
                        type="number"
                        step="0.05"
                        min="0"
                        max="5"
                        value={inputs.referralK}
                        onChange={(e) => handleInputChange('referralK', Number(e.target.value))}
                        className="numeric-input"
                      />
                      <span className="unit-affix">referral K</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Targets */}
              <div className="input-group-panel">
                <h4 className="group-title">3. Campaign Parameters</h4>
                <div className="input-fields-list">
                  <div className="field-item">
                    <label htmlFor="input-budget" className="field-label">
                      Campaign budget
                      <span className="field-unit">(connector stipends & assets)</span>
                    </label>
                    <div className="field-control">
                      <input
                        id="input-budget"
                        type="number"
                        min="0"
                        value={inputs.budget}
                        onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                        className="numeric-input"
                      />
                      <span className="unit-affix">₹ INR</span>
                    </div>
                  </div>

                  <div className="field-item">
                    <label htmlFor="input-target" className="field-label">
                      Registration target
                      <span className="field-unit">(7-day goal)</span>
                    </label>
                    <div className="field-control">
                      <input
                        id="input-target"
                        type="number"
                        min="1"
                        value={inputs.registrationTarget}
                        onChange={(e) => handleInputChange('registrationTarget', Number(e.target.value))}
                        className="numeric-input"
                      />
                      <span className="unit-affix">registrations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Column (Funnel & Decisions) */}
            <div className="simulator-outputs-col">
              {/* Funnel Steps */}
              <div className="funnel-panel">
                <div className="funnel-header">
                  <span className="funnel-kicker">CALCULATED FUNNEL</span>
                  <span className="badge-mono">STEPPED PROJECTION</span>
                </div>

                <div className="funnel-sequence">
                  <div className="funnel-step">
                    <div className="step-data">
                      <span className="step-val">{outputs.grossExposures.toLocaleString()}</span>
                      <span className="step-name">Gross exposures</span>
                    </div>
                    <span className="step-formula">connectors × groups × group size</span>
                  </div>

                  <div className="funnel-arrow" aria-hidden="true">↓</div>

                  <div className="funnel-step">
                    <div className="step-data">
                      <span className="step-val">{outputs.estimatedUniqueReach.toLocaleString()}</span>
                      <span className="step-name">Estimated unique reach</span>
                    </div>
                    <span className="step-formula">gross exposures × (1 − overlap)</span>
                  </div>

                  <div className="funnel-arrow" aria-hidden="true">↓</div>

                  <div className="funnel-step">
                    <div className="step-data">
                      <span className="step-val">{outputs.estimatedVisits.toLocaleString()}</span>
                      <span className="step-name">Estimated visits</span>
                    </div>
                    <span className="step-formula">unique reach × visit rate</span>
                  </div>

                  <div className="funnel-arrow" aria-hidden="true">↓</div>

                  <div className="funnel-step">
                    <div className="step-data">
                      <span className="step-val">{outputs.estimatedDirectRegistrations.toLocaleString()}</span>
                      <span className="step-name">Estimated direct registrations</span>
                    </div>
                    <span className="step-formula">visits × conversion rate</span>
                  </div>

                  <div className="funnel-arrow" aria-hidden="true">↓</div>

                  <div className="funnel-step referral-step">
                    <div className="step-data">
                      <span className="step-val">+{outputs.estimatedReferralRegistrations.toLocaleString()}</span>
                      <span className="step-name">Referral registrations (lift)</span>
                    </div>
                    <span className="step-formula">direct registrations × K</span>
                  </div>

                  <div className="funnel-arrow" aria-hidden="true">↓</div>

                  <div className="funnel-step total-step">
                    <div className="step-data">
                      <span className="step-val highlight">{outputs.estimatedTotalRegistrations.toLocaleString()}</span>
                      <span className="step-name">Estimated total registrations</span>
                    </div>
                    <span className="step-formula">direct + referral registrations</span>
                  </div>
                </div>

                {/* Performance Summary Box */}
                <div className="performance-summary-panel">
                  <div className="target-progress-row">
                    <div className="target-label-group">
                      <span className="target-title">Target: {inputs.registrationTarget} registrations</span>
                      <span className="target-status">
                        {outputs.targetMet ? (
                          <strong className="status-met">Target Met (+{outputs.estimatedTotalRegistrations - inputs.registrationTarget})</strong>
                        ) : (
                          <strong className="status-gap">Gap: {outputs.remainingGap} registrations</strong>
                        )}
                      </span>
                    </div>
                    <span className="target-pct-text">{outputs.progressPercentage}% reached</span>
                  </div>

                  <div className="progress-track" aria-hidden="true">
                    <div
                      className={`progress-fill ${outputs.targetMet ? 'is-complete' : ''}`}
                      style={{ width: `${Math.min(100, outputs.progressPercentage)}%` }}
                    />
                  </div>

                  <div className="cpr-row">
                    <span className="cpr-label">Estimated CPR under this scenario:</span>
                    <span className="cpr-val">
                      {outputs.estimatedCostPerRegistration !== null
                        ? `₹${outputs.estimatedCostPerRegistration.toFixed(2)} / reg`
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* Decision Guidance Panel */}
                <div className="guidance-panel">
                  <div className="guidance-header">
                    <span className="guidance-kicker">SCENARIO DIAGNOSTIC</span>
                    <h5 className="guidance-title">{guidance.bottleneckTitle}</h5>
                  </div>
                  <p className="guidance-recommendation">{guidance.recommendation}</p>

                  <div className="leverage-grid">
                    <div className="leverage-item">
                      <span className="lev-label">BIGGEST LEVER:</span>
                      <span className="lev-val">{guidance.biggestLever}</span>
                    </div>
                    <div className="leverage-item">
                      <span className="lev-label">BIGGEST RISK:</span>
                      <span className="lev-val">{guidance.biggestRisk}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Campaign Execution Outline */}
          <div className="execution-schedule-section">
            <div className="schedule-header">
              <span className="spec-indicator">PROPOSED SPRINT TIMELINE</span>
              <h4 className="schedule-title">7-Day Campaign Execution Outline</h4>
              <p className="schedule-subtitle">
                Hypothetical phased playbook for campus outreach, funnel verification, and conversion optimization.
              </p>
            </div>

            <div className="schedule-grid">
              <div className="schedule-card">
                <span className="schedule-days">DAYS 1–2</span>
                <h5 className="schedule-task">Seed Distribution</h5>
                <p className="schedule-desc">
                  Recruit campus connectors, club leads, and academic representatives. Provide each connector with an attribution-tagged WhatsApp link and clear sharing guidance.
                </p>
              </div>

              <div className="schedule-card">
                <span className="schedule-days">DAYS 3–4</span>
                <h5 className="schedule-task">Diagnose the Funnel</h5>
                <p className="schedule-desc">
                  Analyze initial incoming traffic. Determine whether the primary bottleneck is connector reach, link visit rate, or on-page registration conversion.
                </p>
              </div>

              <div className="schedule-card">
                <span className="schedule-days">DAYS 5–6</span>
                <h5 className="schedule-task">Concentrate Effort</h5>
                <p className="schedule-desc">
                  Reallocate connector attention toward high-engagement engineering groups. Test alternative preview hooks for lower-performing channels.
                </p>
              </div>

              <div className="schedule-card">
                <span className="schedule-days">DAY 7</span>
                <h5 className="schedule-task">Final Push & Reconciliation</h5>
                <p className="schedule-desc">
                  Send final session reminders through top-performing student networks. Reconcile verified unique registrations and evaluate final cost per acquisition.
                </p>
              </div>
            </div>

            <div className="schedule-footer-note">
              <code>DISCLAIMER:</code> These outline steps represent a hypothetical operational model for discussion and testing. They do not imply that real campaign activities have taken place.
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
