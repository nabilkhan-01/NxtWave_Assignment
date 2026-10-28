import React, { useState, useRef } from 'react';
import { PROJECT_PRESETS } from '../data/presets';
import { ProjectPreset, ScopeAssessmentResult } from '../types';
import { assessScope } from '../logic/assessment';
import { AttributionParams } from '../logic/attribution';
import { PresetSelector } from '../components/PresetSelector';
import { ProjectInput } from '../components/ProjectInput';
import { AssessmentResults } from '../components/AssessmentResults';

interface DiagnosePageProps {
  attribution: AttributionParams;
}

export const DiagnosePage: React.FC<DiagnosePageProps> = ({ attribution }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(PROJECT_PRESETS[0].id);
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [projectDescription, setProjectDescription] = useState<string>(PROJECT_PRESETS[0].fullDescription);
  const [assessmentResult, setAssessmentResult] = useState<ScopeAssessmentResult | null>(null);
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
      setValidationError('Please provide at least 10 meaningful characters describing your project.');
      return;
    }

    setValidationError(null);
    const result = assessScope(trimmed);
    setAssessmentResult(result);

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
    <div className="page-diagnose">
      {/* Page Header */}
      <section className="diagnose-header-section" aria-labelledby="diagnose-page-title">
        <div className="header-meta-row">
          <span className="spec-indicator">STUDENT DIAGNOSTIC WORKBENCH</span>
          <span className="badge-mono">RULE-BASED ENGINE</span>
        </div>
        <h1 id="diagnose-page-title" className="diagnose-headline">
          Capstone Scope Diagnostic
        </h1>
        <p className="diagnose-subhead">
          Select an intentional case study or enter your own project specification to identify architecture risks, isolate your Essential V1 build, and view an observable 60-minute roadmap.
        </p>
      </section>

      {/* Primary Diagnostic Workspace Grid */}
      <div className="diagnose-workbench-grid">
        {/* Left Column: Preset Selector + Description Input */}
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

        {/* Right Column: Architectural Guidance & Methodology Sidebar (Desktop) */}
        <aside className="diagnose-sidebar-col" aria-label="Diagnostic criteria and methodology">
          <div className="sidebar-card">
            <div className="sidebar-header">
              <span className="sidebar-kicker">WHAT SHIPSCOPE CHECKS</span>
              <h3 className="sidebar-title">7 Architecture Complexity Layers</h3>
            </div>
            <p className="sidebar-desc">
              ShipScope evaluates submitted project text against common technical bottlenecks that cause final-year capstone teams to miss first-version milestones:
            </p>
            <ul className="criteria-list">
              <li>
                <strong>Streaming Media & CV:</strong> Live video, camera feeds, YOLO/OpenCV models.
              </li>
              <li>
                <strong>Custom Model Training:</strong> Training neural networks from scratch, manual annotation.
              </li>
              <li>
                <strong>Multi-Platform Sync:</strong> Native iOS, Android, and cross-device sync before core API.
              </li>
              <li>
                <strong>Auth & Admin Roles:</strong> RBAC, permission hierarchies, and multi-tenant portals.
              </li>
              <li>
                <strong>Commerce & Gateways:</strong> Payment integrations, wallets, and subscription workflows.
              </li>
              <li>
                <strong>Notification Systems:</strong> SMS, WhatsApp, and multi-channel alert queues.
              </li>
              <li>
                <strong>Heavy RAG Pipelines:</strong> Multi-format parsers and vector database clusters.
              </li>
            </ul>

            <div className="sidebar-note">
              <span className="mono-badge">NOTE</span>
              <span>
                Rule-based indicator evaluates software engineering scope. It is not an evaluation of academic grades, viva outcomes, or hiring probability.
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Results Section (Full-Width Workspace when Assessed) */}
      {assessmentResult && (
        <section ref={resultsSectionRef} className="results-wrapper-section" aria-label="Diagnostic Results Worksheet">
          <AssessmentResults
            result={assessmentResult}
            presetTitle={currentPreset?.title}
            attribution={attribution}
            onEditIdea={handleEditIdea}
          />
        </section>
      )}
    </div>
  );
};
