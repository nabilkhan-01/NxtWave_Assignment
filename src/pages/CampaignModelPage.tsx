import React from 'react';
import { GrowthSimulator } from '../components/GrowthSimulator';

export const CampaignModelPage: React.FC = () => {
  return (
    <div className="page-shell page-campaign-model">
      <section className="page-section campaign-model-section">
        <div className="page-inner">
          <GrowthSimulator standalone={true} />
        </div>
      </section>
    </div>
  );
};
