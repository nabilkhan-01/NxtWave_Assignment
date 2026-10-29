import { describe, it, expect, beforeEach } from 'vitest';
import { assessScope } from '../assessment';
import {
  generateBuildPath,
  computeProjectHash,
  saveAssessmentForBuildPath,
  loadAssessmentForBuildPath,
  saveBuildPathProgress,
  loadBuildPathProgress,
  clearBuildPathProgress
} from '../buildPath';
import { PROJECT_PRESETS } from '../../data/presets';

// Set up mock localStorage and window for Node environment
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, String(value)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear()
};

(globalThis as unknown as { window: unknown }).window = globalThis;
(globalThis as unknown as { localStorage: unknown }).localStorage = localStorageMock;

describe('Build Path Generation & Progression Engine', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Underspecified project handling', () => {
    it('returns isUnderspecified: true and zero stages when scope is underspecified', () => {
      const vagueText = 'A smart app that uses artificial intelligence to do cool things for everyone.';
      const assessment = assessScope(vagueText);

      const path = generateBuildPath(vagueText, assessment);

      expect(path.isUnderspecified).toBe(true);
      expect(path.stages).toHaveLength(0);
      expect(path.totalStages).toBe(0);
      expect(path.underspecifiedMessage).toBeDefined();
      expect(path.underspecifiedMessage).toContain('concrete inputs');
    });
  });

  describe('Manageable project build path', () => {
    it('generates a 4-stage build path for a standard scoped project', () => {
      const preset = PROJECT_PRESETS[0]; // Course Notes Q&A
      const assessment = assessScope(preset.fullDescription);

      const path = generateBuildPath(preset.fullDescription, assessment, preset.title);

      expect(path.isUnderspecified).toBe(false);
      expect(path.totalStages).toBe(4);
      expect(path.stages).toHaveLength(4);

      // Verify Stage 1: Prove the core
      expect(path.stages[0].stageNumber).toBe(1);
      expect(path.stages[0].themeKicker).toContain('PROVE THE CORE');
      expect(path.stages[0].tasks.length).toBeGreaterThanOrEqual(3);
      expect(path.stages[0].tasks.length).toBeLessThanOrEqual(5);
      expect(path.stages[0].doneWhen).toBeDefined();
      expect(path.stages[0].verificationPrompt).toBeDefined();

      // Verify Stage 2: Reliability
      expect(path.stages[1].stageNumber).toBe(2);
      expect(path.stages[1].themeKicker).toContain('MAKE IT RELIABLE');

      // Verify Stage 3: Usability
      expect(path.stages[2].stageNumber).toBe(3);
      expect(path.stages[2].themeKicker).toContain('MAKE IT USABLE');

      // Verify Stage 4: Testing & Shipping
      expect(path.stages[3].stageNumber).toBe(4);
      expect(path.stages[3].themeKicker).toContain('TEST & PREPARE TO SHIP');
    });

    it('generates a 3-stage adaptive path for simple straightforward projects', () => {
      // Short simple prompt with no detected complexity factors and manageable scope
      const simpleText = 'A focused web tool that takes one uploaded markdown notes file and extracts a clean 3-bullet summary list.';
      const assessment = assessScope(simpleText);

      const path = generateBuildPath(simpleText, assessment);

      expect(path.isUnderspecified).toBe(false);
      expect(path.totalStages).toBe(3);
      expect(path.stages).toHaveLength(3);
      expect(path.stages[0].stageNumber).toBe(1);
      expect(path.stages[1].stageNumber).toBe(2);
      expect(path.stages[2].stageNumber).toBe(3);
      expect(path.stages[2].themeKicker).toContain('TEST & PREPARE TO SHIP');
    });
  });

  describe('Personalization across archetypes', () => {
    it('customizes tasks and outputs for Resume-Job Matcher', () => {
      const resumePreset = PROJECT_PRESETS.find((p) => p.id === 'resume-job-matcher')!;
      const assessment = assessScope(resumePreset.fullDescription);

      const path = generateBuildPath(resumePreset.fullDescription, assessment, resumePreset.title);

      expect(path.projectTitle).toBe(resumePreset.title);

      // Check that tasks explicitly mention resume/job matching concepts
      const allTasks = path.stages.flatMap((s) => s.tasks).join(' ').toLowerCase();
      expect(allTasks).toMatch(/(resume|job|skill|match)/);

      // Verify stage 1 doneWhen references matching output
      expect(path.stages[0].doneWhen.toLowerCase()).toMatch(/(match|skill|output)/);
    });

    it('customizes tasks and outputs for Document / Notes Q&A', () => {
      const notesPreset = PROJECT_PRESETS.find((p) => p.id === 'course-notes-qa')!;
      const assessment = assessScope(notesPreset.fullDescription);

      const path = generateBuildPath(notesPreset.fullDescription, assessment, notesPreset.title);

      const allTasks = path.stages.flatMap((s) => s.tasks).join(' ').toLowerCase();
      expect(allTasks).toMatch(/(document|notes|citation|paragraph|query)/);
    });

    it('customizes tasks for Campus Issue Triage', () => {
      const triagePreset = PROJECT_PRESETS.find((p) => p.id === 'campus-issue-triage')!;
      const assessment = assessScope(triagePreset.fullDescription);

      const path = generateBuildPath(triagePreset.fullDescription, assessment, triagePreset.title);

      const allTasks = path.stages.flatMap((s) => s.tasks).join(' ').toLowerCase();
      expect(allTasks).toMatch(/(issue|category|triage|ticket|priority)/);
    });
  });

  describe('Demo learning modules recommendation', () => {
    it('associates appropriate demo learning modules to stages', () => {
      const preset = PROJECT_PRESETS[0];
      const assessment = assessScope(preset.fullDescription);
      const path = generateBuildPath(preset.fullDescription, assessment, preset.title);

      const modules = path.stages.map((s) => s.learningModule).filter(Boolean);
      expect(modules.length).toBeGreaterThan(0);

      const firstModule = modules[0]!;
      expect(firstModule.id).toBeDefined();
      expect(firstModule.title).toBeDefined();
      expect(firstModule.estimatedDuration).toMatch(/\d+ min/);
      expect(firstModule.shortDescription).toBeDefined();
      expect(firstModule.whatItHelpsWith).toBeDefined();
      expect(firstModule.whyItMatters).toBeDefined();
      expect(firstModule.teachingPoints.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Deterministic hashing and progress persistence', () => {
    it('computes identical hashes for equivalent strings regardless of case and whitespace', () => {
      const text1 = '  AI Resume Matcher for   Tech Jobs ';
      const text2 = 'ai resume matcher for tech jobs';
      expect(computeProjectHash(text1)).toBe(computeProjectHash(text2));
    });

    it('computes different hashes for distinct projects', () => {
      const hashA = computeProjectHash('Resume Matcher Project');
      const hashB = computeProjectHash('Campus Issue Triage Bot');
      expect(hashA).not.toBe(hashB);
    });

    it('persists and retrieves assessment in localStorage', () => {
      const preset = PROJECT_PRESETS[0];
      const assessment = assessScope(preset.fullDescription);

      saveAssessmentForBuildPath({
        projectDescription: preset.fullDescription,
        presetTitle: preset.title,
        assessmentResult: assessment
      });

      const loaded = loadAssessmentForBuildPath();
      expect(loaded).not.toBeNull();
      expect(loaded?.presetTitle).toBe(preset.title);
      expect(loaded?.projectDescription).toBe(preset.fullDescription);
      expect(loaded?.assessmentResult.classification).toBe(assessment.classification);
    });

    it('persists stage completion progress and isolates it by project hash', () => {
      const projectHash = 'abc12345';
      saveBuildPathProgress(projectHash, ['stage-1', 'stage-2']);

      const progress = loadBuildPathProgress(projectHash);
      expect(progress).toEqual(['stage-1', 'stage-2']);

      // Different project hash resets progress to empty
      const otherProgress = loadBuildPathProgress('different-hash');
      expect(otherProgress).toEqual([]);
    });

    it('clears progress cleanly', () => {
      const projectHash = 'abc12345';
      saveBuildPathProgress(projectHash, ['stage-1']);
      clearBuildPathProgress();

      expect(loadBuildPathProgress(projectHash)).toEqual([]);
    });
  });
});
