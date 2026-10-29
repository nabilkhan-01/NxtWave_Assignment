/**
 * Message Experiment Lab Logic
 * Pure calculations and decision guidance for comparing Variant A vs Variant B.
 */

export interface VariantData {
  visits: number;
  registrations: number;
}

export interface ExperimentEvaluation {
  crA: number | null; // e.g. 0.24 for 24%
  crB: number | null;
  absoluteDiff: number | null; // e.g. 0.04 for 4%
  leadingVariant: 'A' | 'B' | 'tied' | 'none';
  isSufficientEvidence: boolean;
  guidanceText: string;
  recommendation: string;
}

/**
 * Calculates conversion rate safely. Returns null if visits <= 0 or invalid.
 */
export function calculateConversionRate(registrations: number, visits: number): number | null {
  if (typeof visits !== 'number' || typeof registrations !== 'number' || visits <= 0 || isNaN(visits) || isNaN(registrations)) {
    return null;
  }
  const cleanReg = Math.max(0, Math.min(registrations, visits));
  return cleanReg / visits;
}

/**
 * Evaluates message variant experiment results without pretending false statistical certainty.
 */
export function evaluateExperiment(
  variantA: VariantData,
  variantB: VariantData
): ExperimentEvaluation {
  const vA = Math.max(0, Math.floor(variantA.visits || 0));
  const rA = Math.max(0, Math.floor(variantA.registrations || 0));
  const vB = Math.max(0, Math.floor(variantB.visits || 0));
  const rB = Math.max(0, Math.floor(variantB.registrations || 0));

  const crA = calculateConversionRate(rA, vA);
  const crB = calculateConversionRate(rB, vB);

  // If no visits recorded in either variant
  if (crA === null && crB === null) {
    return {
      crA: null,
      crB: null,
      absoluteDiff: null,
      leadingVariant: 'none',
      isSufficientEvidence: false,
      guidanceText: 'No campaign traffic recorded yet.',
      recommendation: 'Enter observed visits and registrations from distributed broadcast links to analyze message conversion.'
    };
  }

  // If only one variant has traffic
  if (crA === null || crB === null) {
    const active = crA !== null ? 'Variant A' : 'Variant B';
    return {
      crA,
      crB,
      absoluteDiff: null,
      leadingVariant: 'none',
      isSufficientEvidence: false,
      guidanceText: `Only ${active} has recorded traffic so far.`,
      recommendation: 'Distribute the second variant to the next section or club cohort to establish a comparative baseline.'
    };
  }

  const diff = Math.abs(crA - crB);
  const MIN_OBSERVATIONS_PER_VARIANT = 30;
  const isSufficientEvidence = vA >= MIN_OBSERVATIONS_PER_VARIANT && vB >= MIN_OBSERVATIONS_PER_VARIANT;

  // Threshold for closeness: within 1.5% is treated as essentially tied/close
  const CLOSE_THRESHOLD = 0.015;

  let leadingVariant: 'A' | 'B' | 'tied' | 'none' = 'none';
  if (diff < CLOSE_THRESHOLD) {
    leadingVariant = 'tied';
  } else if (crA > crB) {
    leadingVariant = 'A';
  } else {
    leadingVariant = 'B';
  }

  let guidanceText = '';
  let recommendation = '';

  if (!isSufficientEvidence) {
    guidanceText = `Insufficient evidence: Current sample (${vA} and ${vB} visits) is too small to draw dependable conclusions (<${MIN_OBSERVATIONS_PER_VARIANT} visits per variant).`;
    recommendation = 'Continue testing both variants across upcoming broadcast batches before shifting outreach volume.';
  } else if (leadingVariant === 'tied') {
    guidanceText = `Conversion rates are closely aligned (${(crA * 100).toFixed(1)}% vs ${(crB * 100).toFixed(1)}%, ${(diff * 100).toFixed(1)}% gap).`;
    recommendation = 'Neither message demonstrates a decisive conversion edge. Continue distributing both to test response across diverse student departments.';
  } else if (leadingVariant === 'A') {
    guidanceText = `Variant A is currently leading by ${(diff * 100).toFixed(1)} percentage points (${(crA * 100).toFixed(1)}% vs ${(crB * 100).toFixed(1)}%).`;
    recommendation = 'Treat this as a directional signal and continue testing across more campus groups before reallocating outreach.';
  } else {
    guidanceText = `Variant B is currently leading by ${(diff * 100).toFixed(1)} percentage points (${(crB * 100).toFixed(1)}% vs ${(crA * 100).toFixed(1)}%).`;
    recommendation = 'Treat this as a directional signal and continue testing across more campus groups before reallocating outreach.';
  }

  return {
    crA,
    crB,
    absoluteDiff: diff,
    leadingVariant,
    isSufficientEvidence,
    guidanceText,
    recommendation
  };
}

