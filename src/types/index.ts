/**
 * Shared Type Definitions for ShipScope Diagnostic & Growth Simulator
 */

export type ScopeClassification = 'manageable' | 'needs-narrowing' | 'too-broad';

export interface ComplexityFactor {
  id: string;
  name: string;
  category: 'ml-ai' | 'media-streaming' | 'infrastructure' | 'platform' | 'feature-creep';
  description: string;
  severity: 'low' | 'medium' | 'high';
  detectedPattern: string;
}

export interface RoadmapStep {
  phase: string;
  durationMinutes: number;
  task: string;
  deliverable: string;
}

export interface ScopeAssessmentResult {
  classification: ScopeClassification;
  heuristicScopeScore: number; // 0 to 100 indicator (heuristic scope-fit indicator, NOT success/viva/employability probability)
  verdictTitle: string;
  explanation: string;
  reasons: string[];
  detectedComplexityFactors: ComplexityFactor[];
  essentialV1Features: string[];
  featuresToPostpone: string[];
  first60MinuteRoadmap: RoadmapStep[];
  successTest: string;
  assumptionsAndLimitations: string[];
}

export interface ProjectPreset {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  intendedUser: string;
  centralUseCase: string;
  knownComplexityFactors: string[];
  recommendedFirstVersion: string;
  exampleSuccessTest: string;
}

export interface GrowthSimulatorInputs {
  connectors: number;
  groupsPerConnector: number;
  averageGroupSize: number;
  overlapRate: number; // 0.0 to 1.0 (fractional, e.g. 0.20 = 20%)
  visitRate: number; // 0.0 to 1.0 (fractional, e.g. 0.05 = 5%)
  registrationConversionRate: number; // 0.0 to 1.0 (fractional, e.g. 0.15 = 15%)
  referralK: number; // >= 0: incremental unique referral registrations per direct registration
  budget: number; // INR
  registrationTarget: number;
}

export interface GrowthSimulatorOutputs {
  grossExposures: number;
  estimatedUniqueReach: number;
  estimatedVisits: number;
  estimatedDirectRegistrations: number;
  estimatedReferralRegistrations: number;
  estimatedTotalRegistrations: number;
  estimatedCostPerRegistration: number | null; // null if 0 total registrations
  progressPercentage: number;
  remainingGap: number;
  targetMet: boolean;
  warnings: string[];
}
