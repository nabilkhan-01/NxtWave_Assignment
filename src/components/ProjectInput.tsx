import React from 'react';

interface ProjectInputProps {
  value: string;
  mode: 'preset' | 'custom';
  presetTitle?: string;
  onChange: (newValue: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  validationError: string | null;
}

export const ProjectInput: React.FC<ProjectInputProps> = ({
  value,
  mode,
  presetTitle,
  onChange,
  onSubmit,
  onReset,
  validationError
}) => {
  const trimmed = value.trim();
  const charCount = trimmed.length;
  const isTooShort = charCount > 0 && charCount < 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <section className="section-input-workbench" aria-labelledby="input-heading">
      <div className="input-header-bar">
        <div className="input-meta">
          <span className="spec-indicator">SPECIFICATION DRAFT</span>
          <h3 id="input-heading" className="input-title">
            {mode === 'preset' && presetTitle ? (
              <>
                <span className="title-prefix">Preset:</span> {presetTitle}
              </>
            ) : (
              'Custom Project Specification'
            )}
          </h3>
        </div>
        <div className="input-controls">
          {mode === 'preset' && (
            <span className="editable-notice">
              Editable draft — you can modify this description before assessment
            </span>
          )}
          {value.length > 0 && (
            <button
              type="button"
              className="text-btn-secondary"
              onClick={onReset}
              aria-label="Clear description"
            >
              Clear input
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="textarea-wrapper">
          <label htmlFor="project-description" className="visually-hidden">
            Project Description
          </label>
          <textarea
            id="project-description"
            rows={5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe what the project should do, who it is for, and the main features you are considering (e.g. inputs, transformations, external APIs, target users)..."
            className={`workbench-textarea ${validationError || isTooShort ? 'has-error' : ''}`}
            aria-invalid={Boolean(validationError || isTooShort)}
            aria-describedby="char-hint validation-msg"
          />
        </div>

        <div className="textarea-footer">
          <div className="char-status">
            <span id="char-hint" className="char-count">
              <code>{charCount}</code> characters (minimum 10 required)
            </span>
            {(validationError || isTooShort) && (
              <span id="validation-msg" className="inline-error" role="alert">
                {validationError || 'Please provide at least 10 meaningful characters describing your project.'}
              </span>
            )}
          </div>

          <div className="action-row">
            <button
              type="submit"
              className="btn-primary"
              disabled={charCount < 10}
            >
              <span className="btn-icon" aria-hidden="true">⚡</span>
              <span>Assess scope</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

