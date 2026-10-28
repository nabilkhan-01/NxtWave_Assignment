import { describe, it, expect } from 'vitest';
import { assessScope } from '../assessment';
import { PROJECT_PRESETS } from '../../data/presets';

describe('Scope Assessment Engine', () => {
  it('evaluates all 4 presets without errors and with sensible classifications', () => {
    for (const preset of PROJECT_PRESETS) {
      const result = assessScope(preset.fullDescription);
      expect(result).toBeDefined();
      expect(['manageable', 'needs-narrowing', 'too-broad']).toContain(result.classification);
      expect(result.heuristicScopeScore).toBeGreaterThanOrEqual(10);
      expect(result.heuristicScopeScore).toBeLessThanOrEqual(90);
      expect(result.first60MinuteRoadmap.length).toBeGreaterThan(0);
      expect(result.essentialV1Features.length).toBeGreaterThan(0);
      expect(result.featuresToPostpone.length).toBeGreaterThan(0);
      expect(result.successTest.length).toBeGreaterThan(10);
      expect(result.reasons.length).toBeGreaterThan(0);
    }
  });

  it('classifies AI Lecture Companion as too-broad due to real-time audio, translation, and cross-platform sync', () => {
    const lecturePreset = PROJECT_PRESETS.find(p => p.id === 'ai-lecture-companion')!;
    const result = assessScope(lecturePreset.fullDescription);
    expect(result.classification).toBe('too-broad');
    expect(result.detectedComplexityFactors.some(f => f.id === 'realtime-media')).toBe(true);
    expect(result.detectedComplexityFactors.some(f => f.id === 'multi-platform')).toBe(true);
  });

  it('classifies Course Notes Q&A as needs-narrowing due to multi-document RAG and user accounts', () => {
    const notesPreset = PROJECT_PRESETS.find(p => p.id === 'course-notes-qa')!;
    const result = assessScope(notesPreset.fullDescription);
    expect(result.classification).toBe('needs-narrowing');
    expect(result.detectedComplexityFactors.some(f => f.id === 'multi-doc-rag')).toBe(true);
    expect(result.detectedComplexityFactors.some(f => f.id === 'auth-accounts')).toBe(true);
  });

  it('classifies Resume-Job Matcher as needs-narrowing due to web scraping, portals, and predictive ranking', () => {
    const resumePreset = PROJECT_PRESETS.find(p => p.id === 'resume-job-matcher')!;
    const result = assessScope(resumePreset.fullDescription);
    expect(result.classification).toBe('needs-narrowing');
    expect(result.detectedComplexityFactors.some(f => f.id === 'batch-scraping')).toBe(true);
  });

  it('classifies Campus Issue Triage as needs-narrowing due to admin dashboard and auth', () => {
    const triagePreset = PROJECT_PRESETS.find(p => p.id === 'campus-issue-triage')!;
    const result = assessScope(triagePreset.fullDescription);
    expect(result.classification).toBe('needs-narrowing');
    expect(result.detectedComplexityFactors.some(f => f.id === 'admin-dashboard')).toBe(true);
  });

  it('classifies a clean, focused single-input single-output project as manageable', () => {
    const focusedInput = 'A single-page utility where a student pastes Markdown notes and receives a formatted cheat sheet with glossary terms extracted via regex.';
    const result = assessScope(focusedInput);
    expect(result.classification).toBe('manageable');
    expect(result.heuristicScopeScore).toBeGreaterThanOrEqual(70);
    expect(result.detectedComplexityFactors.length).toBe(0);

    const resumePairInput = 'Build a page where I paste one job description and one resume, then show the matching skills and missing skills.';
    const resumeResult = assessScope(resumePairInput);
    expect(resumeResult.classification).toBe('manageable');
    expect(resumeResult.heuristicScopeScore).toBeGreaterThanOrEqual(70);
    expect(resumeResult.detectedComplexityFactors.length).toBe(0);
  });

  it('is completely deterministic: identical inputs yield identical outputs', () => {
    const testInput = 'An automated PDF summarizer that runs locally and outputs 3 bullet points per chapter.';
    const run1 = assessScope(testInput);
    const run2 = assessScope(testInput);
    expect(run1).toEqual(run2);
  });

  it('handles vague or very short input without hallucinating requirements', () => {
    const shortInput = 'AI app';
    const result = assessScope(shortInput);
    expect(result.classification).toBe('needs-narrowing');
    expect(result.verdictTitle).toContain('Too Brief');
    expect(result.reasons[0]).toContain('insufficient technical details');
  });

  it('detects real-time video/camera and computer vision complexity', () => {
    const cvInput = 'A smart attendance system using webcam video stream and YOLO object detection for student face recognition.';
    const result = assessScope(cvInput);
    expect(result.detectedComplexityFactors.some(f => f.id === 'realtime-media')).toBe(true);
    expect(result.featuresToPostpone.some(p => p.toLowerCase().includes('stream') || p.toLowerCase().includes('media'))).toBe(true);
  });

  it('detects user authentication, payments, and admin dashboards', () => {
    const complexSaaS = 'A subscription platform with Stripe checkout, JWT login with role-based permissions, and a superadmin analytics dashboard.';
    const result = assessScope(complexSaaS);
    expect(result.classification).toBe('too-broad');
    expect(result.detectedComplexityFactors.some(f => f.id === 'payments-commerce')).toBe(true);
    expect(result.detectedComplexityFactors.some(f => f.id === 'auth-accounts')).toBe(true);
    expect(result.detectedComplexityFactors.some(f => f.id === 'admin-dashboard')).toBe(true);
  });

  it('safely evaluates empty or whitespace string', () => {
    const emptyResult = assessScope('   ');
    expect(emptyResult.classification).toBe('needs-narrowing');
    expect(emptyResult.heuristicScopeScore).toBe(35);
  });
});
