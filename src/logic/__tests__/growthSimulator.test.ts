import { describe, it, expect } from 'vitest';
import {
  calculateGrowthFunnel,
  analyzeScenarioGuidance,
  CAMPAIGN_SCENARIOS,
  DEFAULT_GROWTH_INPUTS
} from '../growthSimulator';

describe('Growth Simulator Engine', () => {
  it('calculates the base planning scenario funnel correctly', () => {
    // connectors: 15, groups: 4, size: 120 -> gross: 7200
    // unique reach: 7200 * (1 - 0.25) = 5400
    // visits: 5400 * 0.08 = 432
    // direct reg: 432 * 0.20 = 86.4 -> 86
    // referral reg: 86 * 0.25 = 21.5 -> 22
    // total: 86 + 22 = 108
    const result = calculateGrowthFunnel(DEFAULT_GROWTH_INPUTS);
    expect(result.grossExposures).toBe(7200);
    expect(result.estimatedUniqueReach).toBe(5400);
    expect(result.estimatedVisits).toBe(432);
    expect(result.estimatedDirectRegistrations).toBe(86);
    expect(result.estimatedReferralRegistrations).toBe(22);
    expect(result.estimatedTotalRegistrations).toBe(108);
    expect(result.estimatedCostPerRegistration).toBeCloseTo(2000 / 108, 1);
    expect(result.remainingGap).toBe(500 - 108);
    expect(result.targetMet).toBe(false);
  });

  it('correctly calculates the conservative scenario with large gap', () => {
    const conservative = calculateGrowthFunnel(CAMPAIGN_SCENARIOS.conservative.inputs);
    expect(conservative.grossExposures).toBe(2400);
    expect(conservative.estimatedUniqueReach).toBe(1680);
    expect(conservative.estimatedVisits).toBe(84);
    expect(conservative.estimatedTotalRegistrations).toBeLessThan(30);
    expect(conservative.remainingGap).toBeGreaterThan(450);
    expect(conservative.targetMet).toBe(false);

    // Guidance flags distribution bottleneck
    const guidance = analyzeScenarioGuidance(CAMPAIGN_SCENARIOS.conservative.inputs, conservative);
    expect(guidance.bottleneckTitle).toBe('Distribution Bottleneck');
    expect(guidance.recommendation).toContain('Distribution is the bottleneck');
  });

  it('correctly calculates the stretch scenario where target is met', () => {
    const stretch = calculateGrowthFunnel(CAMPAIGN_SCENARIOS.stretch.inputs);
    expect(stretch.grossExposures).toBe(22500);
    expect(stretch.estimatedUniqueReach).toBe(19125);
    expect(stretch.estimatedTotalRegistrations).toBeGreaterThanOrEqual(500);
    expect(stretch.targetMet).toBe(true);
    expect(stretch.remainingGap).toBe(0);

    const guidance = analyzeScenarioGuidance(CAMPAIGN_SCENARIOS.stretch.inputs, stretch);
    expect(guidance.bottleneckTitle).toContain('Target Achievable');
    expect(guidance.recommendation).toContain('assumptions still require real-world validation');
  });

  it('safely handles zero values without throwing errors or NaN', () => {
    const zeroResult = calculateGrowthFunnel({
      connectors: 0,
      groupsPerConnector: 0,
      averageGroupSize: 0,
      overlapRate: 0,
      visitRate: 0,
      registrationConversionRate: 0,
      referralK: 0,
      budget: 2000,
      registrationTarget: 500
    });

    expect(zeroResult.grossExposures).toBe(0);
    expect(zeroResult.estimatedUniqueReach).toBe(0);
    expect(zeroResult.estimatedVisits).toBe(0);
    expect(zeroResult.estimatedTotalRegistrations).toBe(0);
    expect(zeroResult.estimatedCostPerRegistration).toBeNull(); // Clean division-by-zero protection
    expect(zeroResult.progressPercentage).toBe(0);
    expect(zeroResult.remainingGap).toBe(500);
    expect(zeroResult.targetMet).toBe(false);
  });

  it('handles 100% overlap correctly (yielding 0 unique reach and 0 registrations)', () => {
    const result = calculateGrowthFunnel({
      ...DEFAULT_GROWTH_INPUTS,
      overlapRate: 1.0 // 100% overlap
    });

    expect(result.estimatedUniqueReach).toBe(0);
    expect(result.estimatedVisits).toBe(0);
    expect(result.estimatedTotalRegistrations).toBe(0);
    expect(result.estimatedCostPerRegistration).toBeNull();
  });

  it('handles zero conversion rate gracefully', () => {
    const result = calculateGrowthFunnel({
      ...DEFAULT_GROWTH_INPUTS,
      registrationConversionRate: 0
    });

    expect(result.estimatedDirectRegistrations).toBe(0);
    expect(result.estimatedReferralRegistrations).toBe(0);
    expect(result.estimatedTotalRegistrations).toBe(0);
    expect(result.remainingGap).toBe(500);
  });

  it('handles referral K = 0 (no viral referral lift)', () => {
    const result = calculateGrowthFunnel({
      ...DEFAULT_GROWTH_INPUTS,
      referralK: 0
    });

    expect(result.estimatedReferralRegistrations).toBe(0);
    expect(result.estimatedTotalRegistrations).toBe(result.estimatedDirectRegistrations);
  });

  it('clamps out-of-bound percentages and records warnings', () => {
    const clampedResult = calculateGrowthFunnel({
      ...DEFAULT_GROWTH_INPUTS,
      overlapRate: 1.8, // 180% -> clamp to 1.0
      visitRate: -0.2, // -20% -> clamp to 0.0
      referralK: -1 // negative -> clamp to 0
    });

    expect(clampedResult.warnings.length).toBeGreaterThanOrEqual(3);
    expect(clampedResult.estimatedUniqueReach).toBe(0); // 100% overlap
    expect(clampedResult.estimatedVisits).toBe(0); // 0% visit rate
  });

  it('analyzes different bottleneck stages deterministically', () => {
    // Low visit rate test
    const lowVisitInputs = {
      ...DEFAULT_GROWTH_INPUTS,
      visitRate: 0.03
    };
    const lowVisitOutputs = calculateGrowthFunnel(lowVisitInputs);
    const lowVisitGuidance = analyzeScenarioGuidance(lowVisitInputs, lowVisitOutputs);
    expect(lowVisitGuidance.bottleneckTitle).toBe('Invitation-to-Visit Bottleneck');

    // Low conversion test
    const lowConvInputs = {
      ...DEFAULT_GROWTH_INPUTS,
      visitRate: 0.10,
      registrationConversionRate: 0.08
    };
    const lowConvOutputs = calculateGrowthFunnel(lowConvInputs);
    const lowConvGuidance = analyzeScenarioGuidance(lowConvInputs, lowConvOutputs);
    expect(lowConvGuidance.bottleneckTitle).toBe('Registration Conversion Bottleneck');
  });
});
