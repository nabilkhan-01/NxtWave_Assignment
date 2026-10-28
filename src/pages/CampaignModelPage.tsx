import React from 'react';
import { GrowthSimulator } from '../components/GrowthSimulator';

export const CampaignModelPage: React.FC = () => {
  return (
    <div className="page-campaign-model">
      <GrowthSimulator standalone={true} />
    </div>
  );
};
