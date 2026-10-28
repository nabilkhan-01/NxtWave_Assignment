import React, { useState } from 'react';
import { useRouter, Link, AppRoute } from '../router/Router';

export const Navigation: React.FC = () => {
  const { currentRoute, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: Array<{ to: AppRoute; label: string; tag?: string }> = [
    { to: '/', label: 'Home' },
    { to: '/diagnose', label: 'Diagnose' },
    { to: '/growth', label: 'Growth Toolkit' },
    { to: '/campaign', label: 'Campaign Model' }
  ];

  const handleLinkClick = (to: AppRoute) => {
    navigate(to);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header" role="banner">
      <div className="site-header-container">
        {/* Brand Lockup */}
        <div className="brand-lockup">
          <Link to="/" className="brand-link" aria-label="ShipScope Home">
            <span className="brand-name">ShipScope</span>
            <span className="brand-dot" aria-hidden="true">•</span>
            <span className="brand-tagline">AI Capstone Scope Diagnostic</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main navigation">
          <ul className="nav-list">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.to;
              return (
                <li key={link.to} className="nav-item">
                  <Link
                    to={link.to}
                    className={`nav-link ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="active-dot" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right CTA Button */}
        <div className="header-actions">
          <button
            type="button"
            className="btn-header-cta"
            onClick={() => handleLinkClick('/diagnose')}
          >
            <span>Assess Project</span>
            <span className="cta-arrow" aria-hidden="true">→</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="hamburger-icon" aria-hidden="true">
              {mobileMenuOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav id="mobile-nav-drawer" className="mobile-nav-drawer" aria-label="Mobile navigation">
          <ul className="mobile-nav-list">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.to;
              return (
                <li key={link.to} className="mobile-nav-item">
                  <button
                    type="button"
                    className={`mobile-nav-link ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleLinkClick(link.to)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="active-pill">ACTIVE</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
};
