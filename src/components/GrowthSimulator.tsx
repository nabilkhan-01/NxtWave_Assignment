import React, { useState, useMemo } from 'react';
import {
  calculateGrowthFunnel,
  analyzeScenarioGuidance,
  CAMPAIGN_SCENARIOS,
  DEFAULT_GROWTH_INPUTS,
  CampaignScenario
} from '../logic/growthSimulator';
import { GrowthSimulatorInputs } from '../types';

interface GrowthSimulatorProps {
  standalone?: boolean;
}

export const GrowthSimulator: React.FC<GrowthSimulatorProps> = ({ standalone: _standalone = true }) => {
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

  const activeScenarioName = activeScenarioId === 'base'
    ? 'Base scenario'
    : activeScenarioId === 'conservative'
    ? 'Conservative scenario'
    : activeScenarioId === 'stretch'
    ? 'Stretch scenario'
    : 'Custom scenario';

  return (
    <div id="growth-model" className="simulator-workbench" aria-labelledby="simulator-heading">
      {/* 1. Page Hero: The Core Question */}
      <section className="campaign-page-hero">
        <h1 id="simulator-heading" className="campaign-headline">
          What must be true to reach 500 registrations?
        </h1>
        <p className="campaign-subhead">
          Adjust reach, conversion, and referral assumptions to see whether the 7-day campaign can hit the target within ₹2,000.
        </p>
      </section>

      {/* 2. Large Scenario Summary Banner (Understandable in 5 Seconds) */}
      <div className="large-scenario-summary-banner" aria-label="Current scenario summary">
        <div className="summary-banner-top">
          <span className="summary-scenario-name">{activeScenarioName}</span>
          <span className="summary-status-pill">
            {outputs.targetMet ? 'Target Met' : `${outputs.remainingGap} short of target`}
          </span>
        </div>

        <div className="summary-banner-stats">
          <div className="summary-stat-box">
            <span className="stat-number">{outputs.estimatedTotalRegistrations.toLocaleString()}</span>
            <span className="stat-label">estimated registrations</span>
          </div>

          <div className="summary-stat-divider" aria-hidden="true" />

          <div className="summary-stat-box">
            <span className="stat-number">
              {outputs.targetMet ? `+${outputs.estimatedTotalRegistrations - inputs.registrationTarget}` : `${outputs.remainingGap}`}
            </span>
            <span className="stat-label">{outputs.targetMet ? 'surplus registrations' : 'short of target'}</span>
          </div>

          <div className="summary-stat-divider" aria-hidden="true" />

          <div className="summary-stat-box">
            <span className="stat-number">
              {outputs.estimatedCostPerRegistration !== null
                ? `₹${outputs.estimatedCostPerRegistration.toFixed(2)}`
                : '—'}
            </span>
            <span className="stat-label">estimated cost per registration</span>
          </div>
        </div>

        <div className="summary-banner-issue">
          <span className="issue-kicker">MAIN ISSUE:</span>
          <strong className="issue-text">{guidance.bottleneckTitle}</strong>
          <span className="issue-desc">— {guidance.recommendation}</span>
        </div>
      </div>

      {/* 3. Wide 2-Column Layout: Left (38% Assumptions) & Right (62% Funnel) */}
      <div className="campaign-workbench-columns">
        {/* Left Column: Assumptions (38%) */}
        <div className="campaign-assumptions-col">
          <h2 className="column-section-title">Assumptions</h2>

          {/* Group 1: Distribution */}
          <div className="assumption-block">
            <h3 className="assumption-group-heading">Distribution</h3>
            <div className="input-fields-list">
              <div className="field-item">
                <label htmlFor="input-connectors" className="field-label">
                  Campus connectors
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
                  <span className="unit-affix">groups</span>
                </div>
              </div>

              <div className="field-item">
                <label htmlFor="input-size" className="field-label">
                  Average group size
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
                  <span className="unit-affix">students</span>
                </div>
              </div>

              <div className="field-item">
                <label htmlFor="input-overlap" className="field-label">
                  Audience overlap
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
                  <span className="unit-affix">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Conversion */}
          <div className="assumption-block">
            <h3 className="assumption-group-heading">Conversion</h3>
            <div className="input-fields-list">
              <div className="field-item">
                <label htmlFor="input-visit-rate" className="field-label">
                  Visit rate
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
                  <span className="unit-affix">%</span>
                </div>
              </div>

              <div className="field-item">
                <label htmlFor="input-conv-rate" className="field-label">
                  Registration conversion
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
                  <span className="unit-affix">%</span>
                </div>
              </div>

              <div className="field-item">
                <label htmlFor="input-k" className="field-label">
                  Referral factor (K)
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
                  <span className="unit-affix">ratio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Group 3: Budget */}
          <div className="assumption-block">
            <h3 className="assumption-group-heading">Budget</h3>
            <div className="input-fields-list">
              <div className="field-item">
                <label htmlFor="input-budget" className="field-label">
                  Campaign budget
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
                  <span className="unit-affix">₹</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Funnel & Outcomes (62%) */}
        <div className="campaign-funnel-col">
          <h2 className="column-section-title">Funnel</h2>

          {/* Stepped Funnel List */}
          <div className="plain-funnel-sequence">
            <div className="plain-funnel-step">
              <span className="step-val">{outputs.grossExposures.toLocaleString()}</span>
              <span className="step-name">people reached</span>
            </div>

            <div className="plain-funnel-arrow" aria-hidden="true">↓</div>

            <div className="plain-funnel-step">
              <span className="step-val">{outputs.estimatedUniqueReach.toLocaleString()}</span>
              <span className="step-name">estimated unique reach</span>
            </div>

            <div className="plain-funnel-arrow" aria-hidden="true">↓</div>

            <div className="plain-funnel-step">
              <span className="step-val">{outputs.estimatedVisits.toLocaleString()}</span>
              <span className="step-name">visits</span>
            </div>

            <div className="plain-funnel-arrow" aria-hidden="true">↓</div>

            <div className="plain-funnel-step">
              <span className="step-val">{outputs.estimatedDirectRegistrations.toLocaleString()}</span>
              <span className="step-name">direct registrations</span>
            </div>

            <div className="plain-funnel-arrow" aria-hidden="true">↓</div>

            <div className="plain-funnel-step">
              <span className="step-val">+{outputs.estimatedReferralRegistrations.toLocaleString()}</span>
              <span className="step-name">referrals</span>
            </div>

            <div className="plain-funnel-arrow" aria-hidden="true">↓</div>

            <div className="plain-funnel-step total-step">
              <span className="step-val highlight">{outputs.estimatedTotalRegistrations.toLocaleString()}</span>
              <span className="step-name">total</span>
            </div>
          </div>

          {/* Key Planning Outcomes */}
          <div className="plan-outcomes-card">
            <div className="outcomes-grid">
              <div className="outcome-item">
                <span className="outcome-label">TARGET</span>
                <span className="outcome-val">{inputs.registrationTarget}</span>
              </div>

              <div className="outcome-item">
                <span className="outcome-label">GAP</span>
                <span className="outcome-val">{outputs.remainingGap}</span>
              </div>

              <div className="outcome-item">
                <span className="outcome-label">BIGGEST LEVER</span>
                <span className="outcome-val-text">{guidance.biggestLever}</span>
              </div>

              <div className="outcome-item">
                <span className="outcome-label">BIGGEST RISK</span>
                <span className="outcome-val-text">{guidance.biggestRisk}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Compare Scenarios: Conservative / Base / Stretch */}
      <section className="compare-scenarios-section">
        <h3 className="section-subheading">Compare scenarios</h3>
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
                <strong className="scenario-btn-name">{s.name}</strong>
                <span className="scenario-btn-badge">{s.badge}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. 7-Day Execution Timeline */}
      <section className="execution-schedule-section">
        <div className="schedule-header">
          <h3 className="section-subheading">7-day execution timeline</h3>
          <p className="schedule-subtitle">
            What the team would focus on each day during the campaign sprint.
          </p>
        </div>

        <div className="schedule-grid">
          <div className="schedule-card">
            <span className="schedule-days">DAYS 1–2</span>
            <h4 className="schedule-task">Seed Distribution</h4>
            <p className="schedule-desc">
              Recruit campus connectors, club leads, and academic representatives. Provide each connector with an attribution-tagged WhatsApp link and clear sharing guidance.
            </p>
          </div>

          <div className="schedule-card">
            <span className="schedule-days">DAYS 3–4</span>
            <h4 className="schedule-task">Diagnose the Funnel</h4>
            <p className="schedule-desc">
              Analyze initial incoming traffic. Determine whether the primary bottleneck is connector reach, link visit rate, or on-page registration conversion.
            </p>
          </div>

          <div className="schedule-card">
            <span className="schedule-days">DAYS 5–6</span>
            <h4 className="schedule-task">Concentrate Effort</h4>
            <p className="schedule-desc">
              Reallocate connector attention toward high-engagement engineering groups. Test alternative preview hooks for lower-performing channels.
            </p>
          </div>

          <div className="schedule-card">
            <span className="schedule-days">DAY 7</span>
            <h4 className="schedule-task">Final Push & Reconciliation</h4>
            <p className="schedule-desc">
              Send final session reminders through top-performing student networks. Reconcile verified unique registrations and evaluate final cost per acquisition.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
