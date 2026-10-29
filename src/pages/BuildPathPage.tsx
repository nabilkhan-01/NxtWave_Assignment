import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../router/Router';
import {
  loadAssessmentForBuildPath,
  generateBuildPath,
  loadBuildPathProgress,
  saveBuildPathProgress,
  clearBuildPathProgress,
  BuildPathResult,
  StoredAssessment
} from '../logic/buildPath';
import { DemoLearningModule } from '../data/learningModules';
import { BuildPathStage } from '../components/BuildPathStage';
import { DemoLessonModal } from '../components/DemoLessonModal';

export const BuildPathPage: React.FC = () => {
  const { navigate } = useRouter();

  // Load stored assessment from localStorage
  const [assessment, setAssessment] = useState<StoredAssessment | null>(() => {
    return loadAssessmentForBuildPath();
  });

  // Re-read storage on mount in case it was updated in another tab/page
  useEffect(() => {
    const loaded = loadAssessmentForBuildPath();
    if (loaded) {
      setAssessment(loaded);
    }
  }, []);

  // Generate build path deterministically
  const buildPathResult: BuildPathResult | null = useMemo(() => {
    if (!assessment) return null;
    return generateBuildPath(
      assessment.projectDescription,
      assessment.assessmentResult,
      assessment.presetTitle
    );
  }, [assessment]);

  // Load completed stage progress
  const [completedStageIds, setCompletedStageIds] = useState<string[]>(() => {
    if (!buildPathResult) return [];
    return loadBuildPathProgress(buildPathResult.projectHash);
  });

  // Keep progress in sync if project hash changes
  useEffect(() => {
    if (buildPathResult) {
      const progress = loadBuildPathProgress(buildPathResult.projectHash);
      setCompletedStageIds(progress);
    }
  }, [buildPathResult?.projectHash]);

  // Active stage is the first uncompleted stage
  const activeStageId = useMemo(() => {
    if (!buildPathResult) return null;
    const firstUnfinished = buildPathResult.stages.find(
      (s) => !completedStageIds.includes(s.id)
    );
    return firstUnfinished ? firstUnfinished.id : null;
  }, [buildPathResult, completedStageIds]);

  // Modal state for demo learning lessons
  const [activeLessonModule, setActiveLessonModule] = useState<DemoLearningModule | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  const handleOpenLesson = (module: DemoLearningModule) => {
    setActiveLessonModule(module);
    setIsLessonModalOpen(true);
  };

  const handleCloseLesson = () => {
    setIsLessonModalOpen(false);
    setActiveLessonModule(null);
  };

  const handleVerifyStage = (stageId: string) => {
    if (!buildPathResult) return;
    if (!completedStageIds.includes(stageId)) {
      const updated = [...completedStageIds, stageId];
      setCompletedStageIds(updated);
      saveBuildPathProgress(buildPathResult.projectHash, updated);
    }
  };

  const handleUndoStage = (stageId: string) => {
    if (!buildPathResult) return;
    const updated = completedStageIds.filter((id) => id !== stageId);
    setCompletedStageIds(updated);
    saveBuildPathProgress(buildPathResult.projectHash, updated);
  };

  const handleResetProgress = () => {
    if (!buildPathResult) return;
    clearBuildPathProgress();
    setCompletedStageIds([]);
  };

  // 1. Empty state: No assessment exists yet
  if (!assessment || !buildPathResult) {
    return (
      <div className="page-shell page-build-path">
        <section className="page-section build-header-section" aria-labelledby="build-empty-title">
          <div className="page-inner">
            <span className="page-kicker">EXECUTION ROADMAP</span>
            <h1 id="build-empty-title" className="build-headline page-headline">
              Start with your project idea first.
            </h1>
            <p className="build-subhead page-subtext">
              ShipScope turns an evaluated project scope into a series of focused 60-minute build sessions. Run a quick scope assessment on Diagnose first to generate your build steps.
            </p>
          </div>
        </section>

        <section className="page-section build-content-section page-content-host">
          <div className="page-inner">
            <div className="empty-state-box">
              <div className="empty-icon-wrap" aria-hidden="true">
                <span className="empty-icon">⚡</span>
              </div>
              <h3 className="empty-state-title">No evaluated project found</h3>
              <p className="empty-state-desc">
                Your build path is personalized based on your project description, essential features, and detected complexity risks. Take 60 seconds to assess your project.
              </p>
              <div className="empty-state-actions">
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => navigate('/diagnose')}
                >
                  <span>Go to Diagnose</span>
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 2. Guard: Project was underspecified
  if (buildPathResult.isUnderspecified) {
    return (
      <div className="page-shell page-build-path">
        <section className="page-section build-header-section" aria-labelledby="build-underspecified-title">
          <div className="page-inner">
            <span className="page-kicker">EXECUTION ROADMAP</span>
            <h1 id="build-underspecified-title" className="build-headline page-headline">
              Define your inputs and outputs first.
            </h1>
            <p className="build-subhead page-subtext">
              We cannot build a reliable 60-minute roadmap for an idea that has no concrete inputs or deliverables yet.
            </p>
          </div>
        </section>

        <section className="page-section build-content-section page-content-host">
          <div className="page-inner">
            <div className="underspecified-box">
              <div className="underspecified-badge">SPECIFICATION NEEDED</div>
              <h3 className="underspecified-title">{buildPathResult.projectTitle}</h3>
              <p className="underspecified-message">
                {buildPathResult.underspecifiedMessage}
              </p>
              <div className="underspecified-recommendations">
                <h5 className="sub-kicker">BEFORE GENERATING A BUILD PATH:</h5>
                <ul className="spec-checklist">
                  <li>What exact file or text does the user provide as input?</li>
                  <li>What exact structured output or UI result does the application show?</li>
                  <li>Which single feature is essential for version one?</li>
                </ul>
              </div>
              <div className="underspecified-actions">
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => navigate('/diagnose')}
                >
                  <span>Refine idea on Diagnose</span>
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const isAllComplete = completedStageIds.length === buildPathResult.totalStages;

  return (
    <div className="page-shell page-build-path">
      {/* 1. Page Header */}
      <section className="page-section build-header-section" aria-labelledby="build-page-title">
        <div className="page-inner">
          <span className="page-kicker">PERSONALIZED EXECUTION</span>
          <h1 id="build-page-title" className="build-headline page-headline">
            Your 60-Minute Build Path
          </h1>
          <p className="build-subhead page-subtext">
            A concrete sequence of focused 1-hour sessions designed to build your verified first version step by step.
          </p>
        </div>
      </section>

      <section className="page-section build-content-section page-content-host">
        <div className="page-inner">
          {/* 2. Project & Progress Tracker Bar */}
          <div className="build-path-control-bar">
            <div className="build-project-info">
              <span className="control-kicker">ACTIVE PROJECT:</span>
              <h2 className="build-project-title">{buildPathResult.projectTitle}</h2>
              <p className="build-project-snippet">{buildPathResult.projectDescription}</p>
            </div>

            <div className="build-progress-widget">
              <div className="progress-numeric-row">
                <span className="progress-count-label">PROGRESS:</span>
                <span className="progress-fraction">
                  <code>{completedStageIds.length}</code> of <code>{buildPathResult.totalStages}</code> sessions verified
                </span>
              </div>
              <div className="progress-bar-track" aria-hidden="true">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${(completedStageIds.length / buildPathResult.totalStages) * 100}%`
                  }}
                />
              </div>
              <div className="progress-controls-row">
                <button
                  type="button"
                  className="btn-reset-progress"
                  onClick={handleResetProgress}
                  title="Reset completion checks for this project"
                >
                  Reset session checks
                </button>
                <button
                  type="button"
                  className="btn-link-diagnose"
                  onClick={() => navigate('/diagnose')}
                >
                  Edit project scope →
                </button>
              </div>
            </div>
          </div>

          {/* 3. All Complete Milestone Banner */}
          {isAllComplete && (
            <div className="build-complete-banner" role="status">
              <div className="complete-badge-pill">ALL SESSIONS COMPLETED</div>
              <h3 className="complete-headline">Your first version is ready to test & ship</h3>
              <p className="complete-subtext">
                You have completed the core input-processing-output loop, established validation, connected a minimal interface, and verified edge tests.
              </p>
            </div>
          )}

          {/* 4. Vertical Stage Progression */}
          <div className="build-stages-flow">
            {buildPathResult.stages.map((stage) => {
              const isCompleted = completedStageIds.includes(stage.id);
              const isActive = stage.id === activeStageId;

              return (
                <BuildPathStage
                  key={stage.id}
                  stage={stage}
                  totalStages={buildPathResult.totalStages}
                  isCompleted={isCompleted}
                  isActive={isActive}
                  onVerifyStage={handleVerifyStage}
                  onUndoStage={handleUndoStage}
                  onOpenLesson={handleOpenLesson}
                />
              );
            })}
          </div>

          {/* 5. Restrained Workshop Connection Bridge */}
          <div className="build-workshop-bridge">
            <div className="bridge-meta-row">
              <span className="bridge-kicker">LIVE GUIDED ACCELERATION</span>
              <span className="bridge-tag">OPTIONAL WORKSHOP</span>
            </div>
            <h3 className="bridge-title">
              Want live mentoring beyond self-guided steps?
            </h3>
            <p className="bridge-desc">
              Build your first AI prototype in a structured 60-minute live session with hands-on instructors. We cover model selection, token streaming, schema enforcement, and instant deployment.
            </p>
            <div className="bridge-actions">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => navigate('/diagnose')}
              >
                <span>Explore the 60-Minute Workshop</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Lesson Walkthrough Modal */}
      <DemoLessonModal
        module={activeLessonModule}
        isOpen={isLessonModalOpen}
        onClose={handleCloseLesson}
      />
    </div>
  );
};
