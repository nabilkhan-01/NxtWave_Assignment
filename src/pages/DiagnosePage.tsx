import React, { useState, useRef } from 'react';
import { PROJECT_PRESETS } from '../data/presets';
import { ProjectPreset, ScopeAssessmentResult } from '../types';
import { assessScope } from '../logic/assessment';
import { AttributionParams } from '../logic/attribution';
import { saveAssessmentForBuildPath, loadAssessmentForBuildPath } from '../logic/buildPath';
import { PresetSelector } from '../components/PresetSelector';
import { ProjectInput } from '../components/ProjectInput';
import { AssessmentResults } from '../components/AssessmentResults';

interface DiagnosePageProps {
  attribution: AttributionParams;
}

export const DiagnosePage: React.FC<DiagnosePageProps> = ({ attribution }) => {
  const initialStored = typeof window !== 'undefined' ? loadAssessmentForBuildPath() : null;

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() => {
    if (!initialStored) return PROJECT_PRESETS[0].id;
    if (initialStored.presetTitle) {
      const match = PROJECT_PRESETS.find((p) => p.title === initialStored.presetTitle);
      return match ? match.id : null;
    }
    return null;
  });

  const [mode, setMode] = useState<'preset' | 'custom'>(() => {
    if (!initialStored) return 'preset';
    return initialStored.presetTitle ? 'preset' : 'custom';
  });

  const [projectDescription, setProjectDescription] = useState<string>(() => {
    if (!initialStored) return PROJECT_PRESETS[0].fullDescription;
    return initialStored.projectDescription || PROJECT_PRESETS[0].fullDescription;
  });

  const [assessmentResult, setAssessmentResult] = useState<ScopeAssessmentResult | null>(() => {
    return initialStored ? initialStored.assessmentResult : null;
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const inputSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  const currentPreset = PROJECT_PRESETS.find((p) => p.id === selectedPresetId);

  const handleSelectPreset = (preset: ProjectPreset) => {
    setMode('preset');
    setSelectedPresetId(preset.id);
    setProjectDescription(preset.fullDescription);
    setValidationError(null);
  };

  const handleSelectCustom = () => {
    setMode('custom');
    setSelectedPresetId(null);
    setProjectDescription('');
    setValidationError(null);
    setTimeout(() => {
      const textarea = document.getElementById('project-description');
      if (textarea) textarea.focus();
    }, 50);
  };

  const handleDescriptionChange = (newValue: string) => {
    setProjectDescription(newValue);
    if (validationError && newValue.trim().length >= 10) {
      setValidationError(null);
    }
  };

  const handleResetInput = () => {
    setProjectDescription('');
    setValidationError(null);
  };

  const handleAssessScope = () => {
    const trimmed = projectDescription.trim();
    if (trimmed.length < 10) {
      setValidationError('Please provide at least 10 characters describing your project.');
      return;
    }

    setValidationError(null);
    const result = assessScope(trimmed);
    setAssessmentResult(result);

    // Persist assessment for Build Path and page reloads
    saveAssessmentForBuildPath({
      projectDescription: trimmed,
      presetTitle: mode === 'preset' ? currentPreset?.title : undefined,
      assessmentResult: result
    });

    setTimeout(() => {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleEditIdea = () => {
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const textarea = document.getElementById('project-description');
    if (textarea) textarea.focus();
  };

  return (
    <div className="page-shell page-diagnose">
      {/* 1. Page Header: Clear Question */}
      <section className="page-section diagnose-header-section" aria-labelledby="diagnose-page-title">
        <div className="page-inner">
          <h1 id="diagnose-page-title" className="diagnose-headline">
            Can your idea become a realistic first version?
          </h1>
          <p className="diagnose-subhead">
            Choose an example or describe your own project. ShipScope will show what to build first, what to postpone, and how to start.
          </p>
        </div>
      </section>

      {/* 2. Before Assessment: 65% / 35% 2-Column Layout */}
      <section className="page-section diagnose-workspace-section">
        <div className="page-inner diagnose-workbench-grid">
          {/* Left Column: Examples + Custom Input (65%) */}
          <div className="diagnose-input-col" ref={inputSectionRef}>
            <PresetSelector
              presets={PROJECT_PRESETS}
              selectedPresetId={selectedPresetId}
              mode={mode}
              onSelectPreset={handleSelectPreset}
              onSelectCustom={handleSelectCustom}
            />

            <ProjectInput
              value={projectDescription}
              mode={mode}
              presetTitle={currentPreset?.title}
              onChange={handleDescriptionChange}
              onSubmit={handleAssessScope}
              onReset={handleResetInput}
              validationError={validationError}
            />
          </div>

          {/* Right Column: Simple "What you'll get" Panel (35%) */}
          <aside className="diagnose-sidebar-col" aria-label="What you will receive">
            <div className="sidebar-card-clean">
              <h3 className="sidebar-clean-title">What you’ll get</h3>
              <ul className="clean-deliverables-list">
                <li>
                  <span className="clean-bullet" aria-hidden="true">✓</span>
                  <div>
                    <strong>What belongs in version one</strong>
                    <p>The core capability that demonstrates your idea works.</p>
                  </div>
                </li>
                <li>
                  <span className="clean-bullet" aria-hidden="true">✓</span>
                  <div>
                    <strong>What should wait</strong>
                    <p>High-complexity features you can safely defer.</p>
                  </div>
                </li>
                <li>
                  <span className="clean-bullet" aria-hidden="true">✓</span>
                  <div>
                    <strong>A productive first 60 minutes</strong>
                    <p>Step-by-step guidance to validate data flow before UI.</p>
                  </div>
                </li>
                <li>
                  <span className="clean-bullet" aria-hidden="true">✓</span>
                  <div>
                    <strong>A clear success test</strong>
                    <p>An observable test to verify version one succeeds.</p>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Evaluation Methodology Note placed below workbench to ground the layout */}
        <div className="page-inner diagnose-methodology-container">
          <details className="secondary-disclosure-details methodology-full-disclosure">
            <summary className="disclosure-summary">
              How ShipScope evaluates scope (7 architectural checks)
            </summary>
            <div className="disclosure-content">
              <p className="methodology-lead-text">
                ShipScope checks for 7 common sources of capstone overscoping:
              </p>
              <div className="methodology-chips-grid">
                <span className="methodology-chip">1. Streaming media & live video/audio</span>
                <span className="methodology-chip">2. Custom model training from scratch</span>
                <span className="methodology-chip">3. Multi-platform mobile & device sync</span>
                <span className="methodology-chip">4. Role-based authentication & admin portals</span>
                <span className="methodology-chip">5. Payment gateways & commerce</span>
                <span className="methodology-chip">6. SMS, WhatsApp & external notifications</span>
                <span className="methodology-chip">7. Multi-document vector database clusters</span>
              </div>
              <p className="methodology-small-note">
                Evaluation is deterministic and client-side. It does not predict grades or hiring outcomes.
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* 3. Results Section (Full-Width When Assessed) */}
      {assessmentResult && (
        <section ref={resultsSectionRef} className="page-section results-wrapper-section" aria-label="Diagnostic Result">
          <div className="page-inner">
            <AssessmentResults
              result={assessmentResult}
              presetTitle={currentPreset?.title}
              attribution={attribution}
              onEditIdea={handleEditIdea}
            />
          </div>
        </section>
      )}
    </div>
  );
};
