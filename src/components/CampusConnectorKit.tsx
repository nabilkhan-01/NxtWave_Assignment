import React, { useState } from 'react';
import {
  ConnectorSourceType,
  MessageVariant,
  SOURCE_TYPES,
  sanitizeSourceLabel,
  buildConnectorUrl,
  buildConnectorMessage,
  buildConnectorWhatsAppUrl
} from '../logic/connectorKit';

export const CampusConnectorKit: React.FC = () => {
  const [sourceType, setSourceType] = useState<ConnectorSourceType>('class-rep');
  const [sourceLabel, setSourceLabel] = useState<string>('');
  const [variant, setVariant] = useState<MessageVariant>('scope-hook');
  const [copyMsgStatus, setCopyMsgStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyLinkStatus, setCopyLinkStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  // Base URL from current browser window (fallback for tests/SSR)
  const baseLocation = typeof window !== 'undefined' ? window.location.href : 'https://shipscope.dev';

  const campaignUrl = buildConnectorUrl(baseLocation, sourceType, sourceLabel, variant);
  const messageText = buildConnectorMessage(variant, campaignUrl);
  const whatsappUrl = buildConnectorWhatsAppUrl(variant, campaignUrl);
  const sanitizedSlug = sanitizeSourceLabel(sourceLabel);

  const handleCopyMessage = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(messageText);
        setCopyMsgStatus('copied');
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = messageText;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyMsgStatus(success ? 'copied' : 'error');
      } catch {
        setCopyMsgStatus('error');
      }
    }
    setTimeout(() => setCopyMsgStatus('idle'), 3000);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(campaignUrl);
        setCopyLinkStatus('copied');
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = campaignUrl;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyLinkStatus(success ? 'copied' : 'error');
      } catch {
        setCopyLinkStatus('error');
      }
    }
    setTimeout(() => setCopyLinkStatus('idle'), 3000);
  };

  return (
    <section id="create-message" className="section-connector-kit" aria-labelledby="create-message-title">
      <div className="section-header-box">
        <h2 id="create-message-title" className="section-title">
          Create a campus message
        </h2>
        <p className="section-subtitle">
          Generate ready-to-share WhatsApp messages with built-in tracking for different student communities.
        </p>
      </div>

      <div className="connector-workbench-grid">
        {/* Left Column: Who is sharing, Campus/section, Message angle */}
        <div className="connector-config-col">
          {/* Who is sharing? */}
          <div className="config-block">
            <label className="config-label">
              <span>Who is sharing?</span>
            </label>
            <div className="source-selector-grid" role="radiogroup" aria-label="Who is sharing">
              {SOURCE_TYPES.map((source) => {
                const isSelected = sourceType === source.id;
                return (
                  <button
                    key={source.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`source-chip ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSourceType(source.id)}
                  >
                    <span className="source-name">{source.label}</span>
                    <span className="source-meta">{source.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campus / section */}
          <div className="config-block">
            <label htmlFor="connector-source-label" className="config-label">
              <span>Campus / section</span>
              <span className="config-optional">(optional)</span>
            </label>
            <input
              id="connector-source-label"
              type="text"
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
              placeholder="e.g. IIT Bombay CSE, Section B, Dev Club"
              className="text-input-field"
              maxLength={40}
            />
          </div>

          {/* Message angle */}
          <div className="config-block">
            <label className="config-label">
              <span>Message angle</span>
            </label>
            <div className="variant-toggle-row" role="radiogroup" aria-label="Message angle">
              <button
                type="button"
                role="radio"
                aria-checked={variant === 'scope-hook'}
                className={`variant-toggle-btn ${variant === 'scope-hook' ? 'is-selected' : ''}`}
                onClick={() => setVariant('scope-hook')}
              >
                <strong className="variant-name">Project scope</strong>
                <span className="variant-submeta">Focus on avoiding overscoping</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={variant === 'build-first-hook'}
                className={`variant-toggle-btn ${variant === 'build-first-hook' ? 'is-selected' : ''}`}
                onClick={() => setVariant('build-first-hook')}
              >
                <strong className="variant-name">Build-first</strong>
                <span className="variant-submeta">Focus on getting version one working</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Message preview & Actions */}
        <div className="connector-preview-col">
          <div className="preview-card-clean">
            <div className="preview-header-clean">
              <span className="preview-kicker">MESSAGE PREVIEW</span>
              <span className="preview-tag-badge">WhatsApp</span>
            </div>

            <div className="message-box">
              <pre className="message-text">{messageText}</pre>
            </div>

            {/* Action Buttons */}
            <div className="connector-actions-bar">
              <button
                type="button"
                className="btn-primary btn-copy"
                onClick={handleCopyMessage}
                aria-live="polite"
              >
                <span>{copyMsgStatus === 'copied' ? '✓ Message Copied' : 'Copy Message'}</span>
              </button>

              <button
                type="button"
                className="btn-secondary btn-copy"
                onClick={handleCopyLink}
                aria-live="polite"
              >
                <span>{copyLinkStatus === 'copied' ? '✓ Link Copied' : 'Copy Link'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-whatsapp"
                aria-label="Open WhatsApp with pre-filled message"
              >
                <span>Open WhatsApp</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            {/* Tracking details in a small expandable */}
            <details className="secondary-disclosure-details tracking-disclosure">
              <summary className="disclosure-summary">
                Tracking details
              </summary>
              <div className="disclosure-content">
                <p className="tracking-url-label">Generated campaign link:</p>
                <code className="url-code-text">{campaignUrl}</code>
                <div className="utm-chips-row">
                  <span className="utm-chip">source: <code>{sanitizedSlug ? `${SOURCE_TYPES.find((s) => s.id === sourceType)?.defaultSource}_${sanitizedSlug}` : SOURCE_TYPES.find((s) => s.id === sourceType)?.defaultSource}</code></span>
                  <span className="utm-chip">medium: <code>whatsapp</code></span>
                  <span className="utm-chip">campaign: <code>shipscope-workshop</code></span>
                  <span className="utm-chip">content: <code>{variant}</code></span>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
};
