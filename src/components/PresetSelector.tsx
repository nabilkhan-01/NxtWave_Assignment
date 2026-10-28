import React from 'react';
import { ProjectPreset } from '../types';

interface PresetSelectorProps {
  presets: ProjectPreset[];
  selectedPresetId: string | null;
  mode: 'preset' | 'custom';
  onSelectPreset: (preset: ProjectPreset) => void;
  onSelectCustom: () => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  selectedPresetId,
  mode,
  onSelectPreset,
  onSelectCustom
}) => {
  return (
    <section className="section-presets" aria-labelledby="presets-heading">
      <div className="section-header-row">
        <div>
          <h3 id="presets-heading" className="section-title">
            Try an example idea
          </h3>
          <p className="section-subtitle">
            Four intentional case studies showing how ShipScope narrows broad capstone concepts into buildable starting points.
          </p>
        </div>
        <button
          type="button"
          className={`custom-toggle-btn ${mode === 'custom' ? 'is-active' : ''}`}
          onClick={onSelectCustom}
          aria-pressed={mode === 'custom'}
        >
          <span className="toggle-bullet" aria-hidden="true">✏️</span>
          <span>Assess my own idea</span>
        </button>
      </div>

      <div className="presets-grid" role="radiogroup" aria-label="Capstone Project Presets">
        {presets.map((preset) => {
          const isSelected = mode === 'preset' && selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`preset-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectPreset(preset)}
            >
              <div className="preset-top-row">
                <span className="preset-chip">CASE STUDY</span>
                {isSelected && <span className="preset-active-indicator" aria-label="Currently selected">ACTIVE</span>}
              </div>
              <h4 className="preset-title">{preset.title}</h4>
              <p className="preset-desc">{preset.shortDescription}</p>
              <div className="preset-focus-note">
                <span className="focus-label">Scope challenge:</span>
                <span className="focus-text">{preset.knownComplexityFactors[0]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
