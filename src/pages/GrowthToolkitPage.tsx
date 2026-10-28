import React from 'react';
import { CampusConnectorKit } from '../components/CampusConnectorKit';
import { MessageExperimentLab } from '../components/MessageExperimentLab';

export const GrowthToolkitPage: React.FC = () => {
  return (
    <div className="page-shell page-campus-distribution">
      {/* 1. Hero Section: Clean Purpose */}
      <section className="page-section distribution-hero-section" aria-labelledby="distribution-hero-title">
        <div className="page-inner">
          <h1 id="distribution-hero-title" className="distribution-headline">
            Turn student communities into measurable distribution.
          </h1>
          <p className="distribution-subhead">
            Create trackable messages for class reps, coding clubs, placement communities, and peers — then compare which message gets more registrations.
          </p>
        </div>
      </section>

      {/* 2. Section 1: Create a campus message */}
      <section className="page-section distribution-workspace-section">
        <div className="page-inner">
          <CampusConnectorKit />
        </div>
      </section>

      {/* 3. Section 2: Which message performs better? */}
      <section className="page-section distribution-comparison-section">
        <div className="page-inner">
          <MessageExperimentLab />
        </div>
      </section>
    </div>
  );
};
