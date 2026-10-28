import React, { useMemo } from 'react';
import { parseAttribution } from './logic/attribution';
import { RouterProvider, useRouter } from './router/Router';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { DiagnosePage } from './pages/DiagnosePage';
import { GrowthToolkitPage } from './pages/GrowthToolkitPage';
import { CampaignModelPage } from './pages/CampaignModelPage';
import './App.css';

const AppContent: React.FC = () => {
  const { currentRoute } = useRouter();

  // Parse incoming UTM attribution on page load
  const attribution = useMemo(() => {
    return typeof window !== 'undefined' ? parseAttribution(window.location.search) : {};
  }, []);

  const renderActivePage = () => {
    switch (currentRoute) {
      case '/':
        return <HomePage />;
      case '/diagnose':
        return <DiagnosePage attribution={attribution} />;
      case '/growth':
        return <GrowthToolkitPage />;
      case '/campaign':
        return <CampaignModelPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="workbench-shell">
      {/* Global Professional Navigation Bar */}
      <Navigation />

      {/* Main Multi-Page Content Host */}
      <main className="app-main-layout" id="main-content">
        {renderActivePage()}
      </main>

      {/* Global Footer */}
      <footer className="workbench-footer" role="contentinfo">
        <div className="container footer-container">
          <div className="footer-left">
            <span className="footer-brand">ShipScope</span>
            <p className="footer-note">
              An objective, deterministic scoping diagnostic for engineering students. Built for practical first-version delivery and measurable campaign growth.
            </p>
          </div>
          <div className="footer-specs">
            <code>DETERMINISTIC EVALUATION</code>
            <span className="divider">•</span>
            <code>CLIENT-SIDE ONLY</code>
            <span className="divider">•</span>
            <code>PRIVACY FIRST</code>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
};

export default App;
