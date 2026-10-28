import { GrowthSimulatorInputs, GrowthSimulatorOutputs } from '../types';

export const DEFAULT_GROWTH_INPUTS: GrowthSimulatorInputs = {
  connectors: 8,
  groupsPerConnector: 4,
  averageGroupSize: 120,
  overlapRate: 0.25, // 25% overlap
  visitRate: 0.08, // 8% click/visit rate
  registrationConversionRate: 0.18, // 18% registration conversion
  referralK: 0.35, // 0.35 referral registrations per direct registration
  budget: 2000, // ₹2,000 INR
  registrationTarget: 500 // 500 registrations
};

/**
 * Pure calculation engine for the 7-day hypothetical campaign simulator.
 * All math is deterministic, safe from NaN, division-by-zero, negative values, and unbounded percentages.
 */
export function calculateGrowthFunnel(rawInputs: Partial<GrowthSimulatorInputs>): GrowthSimulatorOutputs {
  const warnings: string[] = [];

  // Clamp and sanitize inputs safely
  const connectors = Math.max(0, Math.floor(rawInputs.connectors ?? 0));
  const groupsPerConnector = Math.max(0, Math.floor(rawInputs.groupsPerConnector ?? 0));
  const averageGroupSize = Math.max(0, Math.floor(rawInputs.averageGroupSize ?? 0));

  // Overlap rate clamped between 0 and 1
  let overlapRate = rawInputs.overlapRate ?? 0;
  if (overlapRate < 0) {
    overlapRate = 0;
    warnings.push('Overlap rate was negative; clamped to 0%.');
  } else if (overlapRate > 1) {
    overlapRate = 1;
    warnings.push('Overlap rate exceeded 100%; clamped to 100%.');
  }

  // Visit rate clamped between 0 and 1
  let visitRate = rawInputs.visitRate ?? 0;
  if (visitRate < 0) {
    visitRate = 0;
    warnings.push('Visit rate was negative; clamped to 0%.');
  } else if (visitRate > 1) {
    visitRate = 1;
    warnings.push('Visit rate exceeded 100%; clamped to 100%.');
  }

  // Conversion rate clamped between 0 and 1
  let registrationConversionRate = rawInputs.registrationConversionRate ?? 0;
  if (registrationConversionRate < 0) {
    registrationConversionRate = 0;
    warnings.push('Conversion rate was negative; clamped to 0%.');
  } else if (registrationConversionRate > 1) {
    registrationConversionRate = 1;
    warnings.push('Conversion rate exceeded 100%; clamped to 100%.');
  }

  // Referral factor K (non-negative)
  let referralK = rawInputs.referralK ?? 0;
  if (referralK < 0) {
    referralK = 0;
    warnings.push('Referral K was negative; clamped to 0.');
  }

  const budget = Math.max(0, rawInputs.budget ?? 0);
  const registrationTarget = Math.max(1, Math.floor(rawInputs.registrationTarget ?? 500));

  // 1. Gross exposures = connectors × groupsPerConnector × averageGroupSize
  const grossExposures = connectors * groupsPerConnector * averageGroupSize;

  // 2. Estimated unique reach = grossExposures × (1 - overlapRate)
  const estimatedUniqueReach = Math.round(grossExposures * (1 - overlapRate));

  // 3. Estimated visits = unique reach × visitRate
  const estimatedVisits = Math.round(estimatedUniqueReach * visitRate);

  // 4. Estimated direct registrations = visits × registrationConversionRate
  const estimatedDirectRegistrations = Math.round(estimatedVisits * registrationConversionRate);

  // 5. Estimated referral registrations = direct registrations × K
  const estimatedReferralRegistrations = Math.round(estimatedDirectRegistrations * referralK);

  // 6. Estimated total registrations = direct + referral
  const estimatedTotalRegistrations = estimatedDirectRegistrations + estimatedReferralRegistrations;

  // 7. Estimated campaign-wide cost per registration = budget / total registrations (handle 0 safely)
  let estimatedCostPerRegistration: number | null = null;
  if (estimatedTotalRegistrations > 0) {
    estimatedCostPerRegistration = Number((budget / estimatedTotalRegistrations).toFixed(2));
  }

  // 8. Progress and Gap metrics
  const progressPercentage = Number(
    Math.min(100, (estimatedTotalRegistrations / registrationTarget) * 100).toFixed(1)
  );
  const remainingGap = Math.max(0, registrationTarget - estimatedTotalRegistrations);
  const targetMet = estimatedTotalRegistrations >= registrationTarget;

  return {
    grossExposures,
    estimatedUniqueReach,
    estimatedVisits,
    estimatedDirectRegistrations,
    estimatedReferralRegistrations,
    estimatedTotalRegistrations,
    estimatedCostPerRegistration,
    progressPercentage,
    remainingGap,
    targetMet,
    warnings
  };
}
