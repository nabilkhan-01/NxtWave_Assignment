import React, { useEffect, useRef } from 'react';
import { DemoLearningModule } from '../data/learningModules';

interface DemoLessonModalProps {
  module: DemoLearningModule | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DemoLessonModal: React.FC<DemoLessonModalProps> = ({
  module,
  isOpen,
  onClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on mount
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !module) return null;

  return (
    <div
      className="share-sheet-backdrop"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="share-sheet-dialog demo-lesson-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-modal-title"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="demo-lesson-header">
          <div className="lesson-header-meta">
            <span className="build-module-category-tag">{module.categoryLabel}</span>
            <span className="divider">•</span>
            <span className="lesson-duration-badge"><code>{module.estimatedDuration}</code> read</span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="share-sheet-close"
            onClick={onClose}
            aria-label="Close lesson modal"
          >
            ✕
          </button>
        </div>

        <div className="demo-lesson-content">
          <h3 id="lesson-modal-title" className="demo-lesson-title">
            {module.title}
          </h3>

          <p className="demo-lesson-summary">
            {module.shortDescription}
          </p>

          <div className="lesson-callout-why">
            <h4 className="lesson-section-kicker">WHY THIS MATTERS</h4>
            <p className="lesson-why-text">{module.whyItMatters}</p>
          </div>

          <div className="lesson-section">
            <h4 className="lesson-section-kicker">IMPLEMENTATION PRINCIPLES</h4>
            <ul className="lesson-points-list">
              {module.teachingPoints.map((point, idx) => (
                <li key={idx} className="lesson-point-item">
                  <span className="point-number" aria-hidden="true">0{idx + 1}</span>
                  <span className="point-text">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {module.exampleSnippet && (
            <div className="lesson-section">
              <h4 className="lesson-section-kicker">MINIMAL CODE PATTERN</h4>
              <div className="lesson-code-wrapper">
                <pre className="lesson-code-block">
                  <code>{module.exampleSnippet}</code>
                </pre>
              </div>
            </div>
          )}

          <div className="lesson-disclaimer-box">
            <p className="lesson-disclaimer-text">
              <strong>Demo Prototype Lesson:</strong> Provided as a practical technical reference for your 60-minute build session. Not an official NxtWave course certification.
            </p>
          </div>
        </div>

        <div className="demo-lesson-footer">
          <button
            type="button"
            className="btn-primary-action"
            onClick={onClose}
          >
            Back to Build Path
          </button>
        </div>
      </div>
    </div>
  );
};

