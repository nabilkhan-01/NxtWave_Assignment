import React, { useState, useRef, useMemo } from 'react';
import { PROJECT_PRESETS } from './data/presets';
import { ProjectPreset, ScopeAssessmentResult } from './types';
import { assessScope } from './logic/assessment';
import { parseAttribution } from './logic/attribution';
import { ReviewerWalkthrough } from './components/ReviewerWalkthrough';
import { PresetSelector } from './components/PresetSelector';
import { ProjectInput } from './components/ProjectInput';
import { AssessmentResults } from './components/AssessmentResults';
import { CampusConnectorKit } from './components/CampusConnectorKit';
import { MessageExperimentLab } from './components/MessageExperimentLab';
import { GrowthSimulator } from './components/GrowthSimulator';
import './App.css';

export const App: React.FC = () => {
  // Parse incoming UTM attribution on page load
  const attribution = useMemo(() => {
    return typeof window !== 'undefined' ? parseAttribution(window.location.search) : {};
  }, []);

  // Initial state: starts with the first teaching preset preloaded for immediate exploration
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

  const handleNavigateToWorkshop = () => {
    if (!assessmentResult) {
      const trimmed = projectDescription.trim() || PROJECT_PRESETS[0].fullDescription;
      setAssessmentResult(assessScope(trimmed));
    }
    setTimeout(() => {
      const el = document.getElementById('workshop');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <div className="workbench-shell">
      {/* Top Engineering Banner & Metadata Bar */}
      <header className="workbench-header">
        <div className="container header-container">
          <div className="brand-group">
            <span className="brand-badge">CAPSTONE DIAGNOSTIC</span>
            <h1 className="brand-title">ShipScope</h1>
          </div>
          <div className="nav-spec">
            <span className="spec-indicator">PROCESS</span>
            <span className="process-flow">
              <code>IDEA</code>
              <span className="flow-arrow" aria-hidden="true">→</span>
              <code>SCOPE</code>
              <span className="flow-arrow" aria-hidden="true">→</span>
              <code>BUILD</code>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container main-content">
        {/* Evaluator Fast Navigation Loop */}
        <ReviewerWalkthrough onNavigateToWorkshop={handleNavigateToWorkshop} />

        {/* Editorial Header Section */}
        <section id="diagnostic" className="hero-section" aria-labelledby="hero-title">
          <div className="hero-kicker">AI Capstone Scope Diagnostic</div>
          <h2 id="hero-title" className="hero-headline">
            Your capstone idea deserves a smaller first step.
          </h2>
          <p className="hero-subhead">
            Describe what you want to build. See what belongs in version one, what can wait, and where to start.
          </p>
        </section>

        {/* Preset Selector Section */}
        <PresetSelector
          presets={PROJECT_PRESETS}
          selectedPresetId={selectedPresetId}
          mode={mode}
          onSelectPreset={handleSelectPreset}
          onSelectCustom={handleSelectCustom}
        />

        {/* Project Description Input Section */}
        <div ref={inputSectionRef}>
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

        {/* Results Worksheet Section */}
        {assessmentResult && (
          <div ref={resultsSectionRef} className="results-wrapper">
            <AssessmentResults
              result={assessmentResult}
              presetTitle={currentPreset?.title}
              attribution={attribution}
              onEditIdea={handleEditIdea}
            />
          </div>
        )}

        {/* Campus Connector Distribution Kit */}
        <CampusConnectorKit />

        {/* Message Experimentation Lab */}
        <MessageExperimentLab />

        {/* 7-Day Growth Model Campaign Simulator (Collapsible Section) */}
        <GrowthSimulator />
      </main>

      {/* Footer */}
      <footer className="workbench-footer">
        <div className="container footer-container">
          <p className="footer-note">
            ShipScope is a deterministic scoping diagnostic for engineering students. Built for practical first-version execution.
          </p>
          <div className="footer-specs">
            <code>RULE-BASED EVALUATION</code>
            <span className="divider">•</span>
            <code>CLIENT-SIDE ONLY</code>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
