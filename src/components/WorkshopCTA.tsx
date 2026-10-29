import React, { useState, useRef } from 'react';
import {
  AttributionParams,
  buildShareUrl
} from '../logic/attribution';
import { ShareSheet } from './ShareSheet';
import { ShareContextConfig } from '../logic/shareSheet';

interface WorkshopCTAProps {
  presetTitle?: string;
  attribution: AttributionParams;
}

export const WorkshopCTA: React.FC<WorkshopCTAProps> = ({
  presetTitle,
  attribution
}) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const baseLocation = typeof window !== 'undefined' ? window.location.href : 'https://shipscope.dev';
  const shareUrl = buildShareUrl(baseLocation, attribution, 'copy');

  const shareConfig: ShareContextConfig = {
    context: 'peer',
    baseLocation,
    presetTitle,
    incomingAttribution: attribution
  };

  const handleSimulateRegistration = () => {
    setIsRegistered(true);
  };

  const handleResetRegistration = () => {
    setIsRegistered(false);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setCopyStatus('copied');
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback for non-secure contexts, restricted iframes, or headless sessions
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyStatus(success ? 'copied' : 'error');
      } catch {
        setCopyStatus('error');
      }
    }

    setTimeout(() => {
      setCopyStatus('idle');
    }, 3000);
  };

  return (
    <section id="workshop" className="results-section section-workshop" aria-labelledby="workshop-heading">
      <div className="workshop-card">
        {/* Why this next? Context Bar */}
        <div className="workshop-context-bar">
          <span className="spec-indicator">RECOMMENDED NEXT STEP</span>
          <p className="workshop-connect-text">
            ShipScope helps decide what belongs in version one. The workshop is where the building begins.
          </p>
        </div>

        <div className="workshop-content-grid">
          <div className="workshop-main-info">
            <div className="workshop-badge-row">
              <span className="badge-free">FREE WORKSHOP</span>
              <span className="badge-format">60-MINUTE SPRINT</span>
            </div>
            <h4 id="workshop-heading" className="workshop-title">
              Build Your First AI Project in 60 Minutes
            </h4>
            <p className="workshop-description">
              You now have a smaller first version. The workshop is the next step if you want to turn that scoped idea into something you can start building. Learn hands-on how to establish a clean data flow and run a working first prototype.
            </p>

            <div className="workshop-disclaimer-note">
              <span className="mono-badge">NOTE</span>
              <span>
                Simulated registration preview. Does not require name, email, or college details.
              </span>
            </div>
          </div>

          <div className="workshop-action-panel">
            {!isRegistered ? (
              <div className="registration-prompt">
                <button
                  type="button"
                  className="btn-primary btn-workshop"
                  onClick={handleSimulateRegistration}
                >
                  <span className="btn-icon" aria-hidden="true">↗</span>
                  <span>Simulate registration</span>
                </button>
                <span className="action-hint">
                  Preview the registration interaction (no real submission)
                </span>
              </div>
            ) : (
              <div className="registration-confirmed" role="status" aria-live="polite">
                <div className="confirmed-header">
                  <span className="confirmed-dot" aria-hidden="true">✓</span>
                  <span className="confirmed-title">Demo registration complete</span>
                </div>
                <p className="confirmed-text">
                  This prototype does not submit a real workshop registration. No personal data was collected.
                </p>
                <button
                  type="button"
                  className="text-btn-secondary"
                  onClick={handleResetRegistration}
                >
                  Reset demo state
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Sharing Panel */}
        <div className="sharing-bar" aria-label="Share ShipScope with teammates">
          <div className="sharing-label-group">
            <span className="sharing-title">Share with a teammate</span>
            <span className="sharing-subtitle">
              Send this scoping plan to your project partner via WhatsApp, Telegram, Email, or more apps.
            </span>
          </div>

          <div className="sharing-actions-row">
            <button
              ref={shareButtonRef}
              type="button"
              className="btn-primary share-btn-main"
              onClick={() => setIsShareSheetOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isShareSheetOpen}
            >
              <span className="btn-icon" aria-hidden="true">↗</span>
              <span>Share with a teammate</span>
            </button>

            <button
              type="button"
              className="share-btn share-btn-copy"
              onClick={handleCopyLink}
              aria-label="Copy ShipScope link to clipboard"
            >
              <span className="share-icon" aria-hidden="true">📋</span>
              <span>{copyStatus === 'copied' ? 'Link copied!' : copyStatus === 'error' ? 'Copy failed' : 'Copy link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unified Share Sheet Modal / Bottom Sheet */}
      <ShareSheet
        isOpen={isShareSheetOpen}
        onClose={() => setIsShareSheetOpen(false)}
        triggerRef={shareButtonRef}
        config={shareConfig}
        title="Share with a teammate"
        subtitle="Choose where to send your project scope plan."
      />
    </section>
  );
};
