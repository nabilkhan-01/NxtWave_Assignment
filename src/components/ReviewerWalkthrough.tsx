import React from 'react';

interface ReviewerWalkthroughProps {
  onNavigateToWorkshop?: () => void;
}

export const ReviewerWalkthrough: React.FC<ReviewerWalkthroughProps> = ({
  onNavigateToWorkshop
}) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    if (targetId === 'workshop' && onNavigateToWorkshop) {
      onNavigateToWorkshop();
      return;
    }

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="reviewer-walkthrough-bar" aria-label="Reviewer growth loop navigation">
      <div className="walkthrough-label-group">
        <span className="walkthrough-kicker">EVALUATOR SHORTCUT</span>
        <span className="walkthrough-title">Review the growth loop:</span>
      </div>
      <ul className="walkthrough-links-list">
        <li>
          <a
            href="#diagnostic"
            onClick={(e) => handleNavClick(e, 'diagnostic')}
            className="walkthrough-link"
          >
            <span className="link-num">1</span>
            <span>Student diagnostic</span>
          </a>
        </li>
        <li className="nav-divider" aria-hidden="true">→</li>
        <li>
          <a
            href="#workshop"
            onClick={(e) => handleNavClick(e, 'workshop')}
            className="walkthrough-link"
          >
            <span className="link-num">2</span>
            <span>Workshop bridge</span>
          </a>
        </li>
        <li className="nav-divider" aria-hidden="true">→</li>
        <li>
          <a
            href="#connector-kit"
            onClick={(e) => handleNavClick(e, 'connector-kit')}
            className="walkthrough-link"
          >
            <span className="link-num">3</span>
            <span>Campus Connector Kit</span>
          </a>
        </li>
        <li className="nav-divider" aria-hidden="true">→</li>
        <li>
          <a
            href="#experiment-lab"
            onClick={(e) => handleNavClick(e, 'experiment-lab')}
            className="walkthrough-link"
          >
            <span className="link-num">4</span>
            <span>Experiment Lab</span>
          </a>
        </li>
        <li className="nav-divider" aria-hidden="true">→</li>
        <li>
          <a
            href="#growth-model"
            onClick={(e) => handleNavClick(e, 'growth-model')}
            className="walkthrough-link"
          >
            <span className="link-num">5</span>
            <span>7-day growth model</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

