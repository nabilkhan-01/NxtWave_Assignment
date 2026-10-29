import React from 'react';
import { BuildPathStageData } from '../logic/buildPath';
import { DemoLearningModule } from '../data/learningModules';
import { LearningModuleCard } from './LearningModuleCard';

interface BuildPathStageProps {
  stage: BuildPathStageData;
  totalStages: number;
  isCompleted: boolean;
  isActive: boolean;
  onVerifyStage: (stageId: string) => void;
  onUndoStage: (stageId: string) => void;
  onOpenLesson: (module: DemoLearningModule) => void;
}

export const BuildPathStage: React.FC<BuildPathStageProps> = ({
  stage,
  totalStages,
  isCompleted,
  isActive,
  onVerifyStage,
  onUndoStage,
  onOpenLesson
}) => {
  const getStageStatusClass = () => {
    if (isCompleted) return 'is-completed';
    if (isActive) return 'is-active';
    return 'is-upcoming';
  };

  return (
    <section
      className={`build-stage-card ${getStageStatusClass()}`}
      aria-labelledby={`stage-heading-${stage.id}`}
    >
      {/* 1. Stage Header */}
      <div className="stage-header-row">
        <div className="stage-meta-left">
          <span className="stage-number-badge">
            {isCompleted ? '✓' : `0${stage.stageNumber}`}
          </span>
          <div className="stage-title-wrap">
            <div className="stage-kicker-row">
              <span className="stage-index-kicker">
                STAGE {stage.stageNumber} OF {totalStages}
              </span>
              <span className="divider">•</span>
              <span className="stage-theme-kicker">{stage.themeKicker}</span>
              <span className="divider">•</span>
              <span className="stage-duration-tag">~60 MIN</span>
            </div>
            <h4 id={`stage-heading-${stage.id}`} className="stage-title">
              {stage.theme}
            </h4>
          </div>
        </div>

        <div className="stage-status-indicator">
          {isCompleted && (
            <span className="status-pill status-tag-manageable">
              Verified Complete
            </span>
          )}
          {isActive && (
            <span className="status-pill status-tag-active">
              Current Session
            </span>
          )}
          {!isCompleted && !isActive && (
            <span className="status-pill status-tag-neutral">
              Upcoming
            </span>
          )}
        </div>
      </div>

      {/* 2. Stage Goal */}
      <div className="stage-goal-box">
        <span className="goal-kicker">SESSION GOAL:</span>
        <p className="goal-statement">{stage.goal}</p>
      </div>

      {/* 3. Actionable 60-Minute Tasks */}
      <div className="stage-tasks-section">
        <div className="tasks-header">
          <span className="section-label">60-MINUTE ACTION CHECKLIST</span>
          <span className="task-count-subtle">{stage.tasks.length} concrete steps</span>
        </div>
        <ul className="stage-task-list">
          {stage.tasks.map((task, idx) => (
            <li key={idx} className="stage-task-item">
              <span className="task-bullet-indicator" aria-hidden="true">
                {isCompleted ? '✓' : idx + 1}
              </span>
              <span className="stage-task-text">{task}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Verification Gate (Done When) */}
      <div className="stage-verification-box">
        <div className="verification-header">
          <span className="verification-kicker">ACCEPTANCE TEST</span>
          <span className="verification-label">How to verify completion</span>
        </div>
        <p className="verification-statement">
          <strong>Done when: </strong>
          {stage.doneWhen}
        </p>

        <div className="verification-actions">
          {isCompleted ? (
            <div className="verification-completed-row">
              <span className="verification-done-badge">
                <span className="check-icon" aria-hidden="true">✓</span>
                <span>Verified working in code</span>
              </span>
              <button
                type="button"
                className="btn-undo-verification"
                onClick={() => onUndoStage(stage.id)}
                aria-label={`Re-open Stage ${stage.stageNumber}`}
              >
                Undo completion
              </button>
            </div>
          ) : (
            <div className="verification-pending-row">
              <p className="verification-prompt-note">
                Before continuing, verify this works: <em>{stage.verificationPrompt}</em>
              </p>
              <button
                type="button"
                className={`btn-verify-stage ${isActive ? 'btn-primary-action' : 'btn-secondary-action'}`}
                onClick={() => onVerifyStage(stage.id)}
                aria-label={`Mark Stage ${stage.stageNumber} as verified and continue`}
              >
                <span>I verified this — continue</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Optional Demo Learning Module */}
      {stage.learningModule && (
        <div className="stage-learning-section">
          <LearningModuleCard
            module={stage.learningModule}
            onOpenLesson={onOpenLesson}
          />
        </div>
      )}
    </section>
  );
};

