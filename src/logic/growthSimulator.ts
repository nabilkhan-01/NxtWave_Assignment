import { GrowthSimulatorInputs, GrowthSimulatorOutputs } from '../types';

export const DEFAULT_GROWTH_INPUTS: GrowthSimulatorInputs = {
  connectors: 15,
  groupsPerConnector: 4,
  averageGroupSize: 120,
  overlapRate: 0.25, // 25% overlap
  visitRate: 0.08, // 8% click/visit rate
  registrationConversionRate: 0.20, // 20% registration conversion
  referralK: 0.25, // 0.25 incremental referral registrations per direct registration
  budget: 2000, // ₹2,000 INR
  registrationTarget: 500 // 500 registrations
};

export interface CampaignScenario {
  id: 'conservative' | 'base' | 'stretch';
  name: string;
  badge: string;
  description: string;
  inputs: GrowthSimulatorInputs;
}

export const CAMPAIGN_SCENARIOS: Record<'conservative' | 'base' | 'stretch', CampaignScenario> = {
  conservative: {
    id: 'conservative',
    name: 'Conservative assumptions',
    badge: 'LOW REACH & CONVERSION',
    description: 'Cautious baseline with lower student connector participation and conservative visit/conversion rates.',
    inputs: {
      connectors: 8,
      groupsPerConnector: 3,
      averageGroupSize: 100,
      overlapRate: 0.30,
      visitRate: 0.05,
      registrationConversionRate: 0.12,
      referralK: 0.15,
      budget: 2000,
      registrationTarget: 500
    }
  },
  base: {
    id: 'base',
    name: 'Base planning assumptions',
    badge: 'DEFAULT MODEL',
    description: 'Realistic middle-ground campaign assumptions across campus connectors and active WhatsApp coding groups.',
    inputs: {
      connectors: 15,
      groupsPerConnector: 4,
      averageGroupSize: 120,
      overlapRate: 0.25,
      visitRate: 0.08,
      registrationConversionRate: 0.20,
      referralK: 0.25,
      budget: 2000,
      registrationTarget: 500
    }
  },
  stretch: {
    id: 'stretch',
    name: 'Stretch assumptions',
    badge: 'TARGET EXCEEDED',
    description: 'Ambitious assumptions requiring high connector engagement, compelling messaging hooks, and active peer referrals.',
    inputs: {
      connectors: 30,
      groupsPerConnector: 5,
      averageGroupSize: 150,
      overlapRate: 0.15,
      visitRate: 0.12,
      registrationConversionRate: 0.25,
      referralK: 0.40,
      budget: 2000,
      registrationTarget: 500
    }
  }
};

export interface ScenarioGuidance {
  bottleneckTitle: string;
  recommendation: string;
  biggestLever: string;
  biggestRisk: string;
}

/**
 * Deterministic rule-based guidance identifying campaign constraints and high-leverage actions.
 */
export function analyzeScenarioGuidance(
  inputs: GrowthSimulatorInputs,
  outputs: GrowthSimulatorOutputs
): ScenarioGuidance {
  if (outputs.estimatedUniqueReach < 3000) {
    return {
      bottleneckTitle: 'Distribution Bottleneck',
      recommendation:
        'Distribution is the bottleneck. The current assumptions do not put enough relevant students in front of the campaign.',
      biggestLever: 'Campus connectors & group reach',
      biggestRisk: 'Insufficient audience reach'
    };
  }

  if (inputs.visitRate < 0.06) {
    return {
      bottleneckTitle: 'Invitation-to-Visit Bottleneck',
      recommendation:
        'The invitation-to-visit step is the main constraint. Test the message and project-preview hook before adding more channels.',
      biggestLever: 'Messaging hook & preview copy',
      biggestRisk: 'Students ignoring connector links'
    };
  }

  if (inputs.registrationConversionRate < 0.15) {
    return {
      bottleneckTitle: 'Registration Conversion Bottleneck',
      recommendation:
        'Traffic is sufficient, but too few visitors register. Focus on CTA clarity and registration friction.',
      biggestLever: 'Registration flow clarity & friction removal',
      biggestRisk: 'High page bounce rate'
    };
  }

  if (inputs.referralK < 0.20) {
    return {
      bottleneckTitle: 'Weak Peer Multiplier',
      recommendation:
        'Peer sharing is contributing little. Treat referrals as upside rather than relying on them to close the target gap.',
      biggestLever: 'Peer-sharing prompts after diagnosis',
      biggestRisk: 'Zero viral distribution'
    };
  }

  if (outputs.targetMet) {
    return {
      bottleneckTitle: 'Target Achievable Under Assumptions',
      recommendation:
        'This scenario reaches the target, but the assumptions still require real-world validation.',
      biggestLever: 'Connector coordination consistency',
      biggestRisk: 'Over-estimating group participation'
    };
  }

  return {
    bottleneckTitle: 'Balanced Funnel Gap',
    recommendation:
      'Balance across distribution and conversion: both incremental reach and higher conversion are required to close the gap.',
    biggestLever: 'Simultaneous reach expansion & conversion rate',
    biggestRisk: 'Short 7-day campaign runway'
  };
}

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
