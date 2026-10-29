import React from 'react';
import { DemoLearningModule } from '../data/learningModules';

interface LearningModuleCardProps {
  module: DemoLearningModule;
  onOpenLesson: (module: DemoLearningModule) => void;
}

export const LearningModuleCard: React.FC<LearningModuleCardProps> = ({
  module,
  onOpenLesson
}) => {
  return (
    <div className="build-module-card" aria-label={`Demo module: ${module.title}`}>
      <div className="build-module-header">
        <div className="build-module-tags">
          <span className="build-module-kicker">OPTIONAL BUILD HELP</span>
          <span className="build-module-category-tag">{module.categoryLabel}</span>
        </div>
        <span className="build-module-duration">
          <code>{module.estimatedDuration}</code> demo
        </span>
      </div>

      <div className="build-module-body">
        <h5 className="build-module-title">{module.title}</h5>
        <p className="build-module-desc">{module.shortDescription}</p>
        <div className="build-module-benefit">
          <span className="benefit-label">HELPS WITH:</span>
          <span className="benefit-text">{module.whatItHelpsWith}</span>
        </div>
      </div>

      <div className="build-module-footer">
        <button
          type="button"
          className="btn-open-lesson"
          onClick={() => onOpenLesson(module)}
          aria-label={`Open demo lesson: ${module.title}`}
        >
          <span>Open demo lesson</span>
          <span className="btn-arrow" aria-hidden="true">→</span>
        </button>
        <span className="build-module-disclaimer">
          Self-guided demo lesson
        </span>
      </div>
    </div>
  );
};
