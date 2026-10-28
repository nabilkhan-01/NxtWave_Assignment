import { describe, it, expect } from 'vitest';
import { calculateGrowthFunnel, DEFAULT_GROWTH_INPUTS } from '../growthSimulator';

describe('Growth Simulator Engine', () => {
  it('calculates the baseline 7-day campaign funnel correctly', () => {
    // connectors: 8, groupsPerConnector: 4, averageGroupSize: 120
    // gross = 8 * 4 * 120 = 3840
    // unique reach = 3840 * (1 - 0.25) = 2880
    // visits = 2880 * 0.08 = 230.4 -> 230
    // direct reg = 230 * 0.18 = 41.4 -> 41
    // referral reg = 41 * 0.35 = 14.35 -> 14
    // total = 41 + 14 = 55
    const result = calculateGrowthFunnel(DEFAULT_GROWTH_INPUTS);
    expect(result.grossExposures).toBe(3840);
    expect(result.estimatedUniqueReach).toBe(2880);
    expect(result.estimatedVisits).toBe(230);
    expect(result.estimatedDirectRegistrations).toBe(41);
    expect(result.estimatedReferralRegistrations).toBe(14);
    expect(result.estimatedTotalRegistrations).toBe(55);
    expect(result.estimatedCostPerRegistration).toBeCloseTo(2000 / 55, 1);
    expect(result.remainingGap).toBe(500 - 55);
    expect(result.targetMet).toBe(false);
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

  it('calculates target exceeded state correctly', () => {
    const highVolume = calculateGrowthFunnel({
      connectors: 25,
      groupsPerConnector: 8,
      averageGroupSize: 200,
      overlapRate: 0.1,
      visitRate: 0.15,
      registrationConversionRate: 0.25,
      referralK: 0.5,
      budget: 2000,
      registrationTarget: 500
    });

    expect(highVolume.estimatedTotalRegistrations).toBeGreaterThanOrEqual(500);
    expect(highVolume.remainingGap).toBe(0);
    expect(highVolume.targetMet).toBe(true);
    expect(highVolume.progressPercentage).toBe(100);
    expect(highVolume.estimatedCostPerRegistration).toBeLessThan(4.0);
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
});
