import React from 'react';
import { CampusConnectorKit } from '../components/CampusConnectorKit';
import { MessageExperimentLab } from '../components/MessageExperimentLab';

export const GrowthToolkitPage: React.FC = () => {
  return (
    <div className="page-growth-toolkit">
      {/* Page Hero */}
      <section className="toolkit-hero-section" aria-labelledby="toolkit-hero-title">
        <div className="header-meta-row">
          <span className="spec-indicator">DISTRIBUTION & EXPERIMENTATION</span>
          <span className="badge-mono">ACQUISITION TOOLKIT</span>
        </div>
        <h1 id="toolkit-hero-title" className="toolkit-headline">
          Turn student communities into measurable distribution.
        </h1>
        <p className="toolkit-subhead">
          Create trackable campus outreach messages, compare acquisition hooks, and decide which message deserves more distribution.
        </p>
      </section>

      {/* 1. Campus Connector Kit */}
      <CampusConnectorKit />

      {/* 2. Message Experiment Lab */}
      <MessageExperimentLab />
    </div>
  );
};
