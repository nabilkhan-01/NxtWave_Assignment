import React, { useState } from 'react';
import {
  ConnectorSourceType,
  MessageVariant,
  SOURCE_TYPES,
  MESSAGE_VARIANTS,
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
    <section id="connector-kit" className="section-connector-kit" aria-labelledby="connector-kit-title">
      <div className="section-header-box">
        <div className="header-meta-row">
          <span className="spec-indicator">DISTRIBUTION TOOL</span>
          <span className="badge-mono">CAMPUS OUTREACH</span>
        </div>
        <h3 id="connector-kit-title" className="section-title">
          Campus Connector Kit
        </h3>
        <p className="section-subtitle">
          Help Class Representatives, coding clubs, placement communities, and student leads distribute ShipScope through attribution-tagged WhatsApp broadcast messages.
        </p>
      </div>

      <div className="connector-workbench-grid">
        {/* Left Column: Parameter Configuration */}
        <div className="connector-config-col">
          {/* Step 1: Source Type */}
          <div className="config-block">
            <label className="config-label">
              <span className="step-tag">1</span>
              <span>Distribution Source Type</span>
            </label>
            <div className="source-selector-grid" role="radiogroup" aria-label="Connector Source Type">
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

          {/* Step 2: Optional Campus / Source Label */}
          <div className="config-block">
            <label htmlFor="connector-source-label" className="config-label">
              <span className="step-tag">2</span>
              <span>Optional Campus or Section Label</span>
              <span className="config-optional">(helps distinguish channels in UTM data)</span>
            </label>
            <div className="input-with-slug">
              <input
                id="connector-source-label"
                type="text"
                value={sourceLabel}
                onChange={(e) => setSourceLabel(e.target.value)}
                placeholder="e.g. IIT Bombay CSE, Section B, Dev Club"
                className="text-input-field"
                maxLength={40}
              />
              <div className="slug-preview" aria-live="polite">
                <span className="slug-label">Generated utm_source:</span>
                <code>
                  {sanitizedSlug
                    ? `${SOURCE_TYPES.find((s) => s.id === sourceType)?.defaultSource}_${sanitizedSlug}`
                    : SOURCE_TYPES.find((s) => s.id === sourceType)?.defaultSource}
                </code>
              </div>
            </div>
          </div>

          {/* Step 3: Message Variant */}
          <div className="config-block">
            <label className="config-label">
              <span className="step-tag">3</span>
              <span>Campaign Message Hook</span>
            </label>
            <div className="variant-toggle-row" role="radiogroup" aria-label="Message Hook Variant">
              {(Object.keys(MESSAGE_VARIANTS) as MessageVariant[]).map((key) => {
                const v = MESSAGE_VARIANTS[key];
                const isSelected = variant === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`variant-toggle-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setVariant(key)}
                  >
                    <span className="variant-pill">{v.tag}</span>
                    <strong className="variant-name">{v.hook}</strong>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Generated Output & Actions */}
        <div className="connector-preview-col">
          <div className="preview-card">
            <div className="preview-top-bar">
              <span className="preview-badge">WHATSAPP-READY MESSAGE</span>
              <span className="preview-variant-tag">{MESSAGE_VARIANTS[variant].tag}</span>
            </div>

            <div className="message-box">
              <pre className="message-text">{messageText}</pre>
            </div>

            {/* Tracked Link Details */}
            <div className="tracked-url-card">
              <span className="url-kicker">RESOLVED CAMPAIGN URL:</span>
              <code className="url-code-text">{campaignUrl}</code>
              <div className="utm-chips-row">
                <span className="utm-chip">
                  source: <code>{sanitizedSlug ? `${SOURCE_TYPES.find((s) => s.id === sourceType)?.defaultSource}_${sanitizedSlug}` : SOURCE_TYPES.find((s) => s.id === sourceType)?.defaultSource}</code>
                </span>
                <span className="utm-chip">medium: <code>whatsapp</code></span>
                <span className="utm-chip">campaign: <code>shipscope-workshop</code></span>
                <span className="utm-chip">content: <code>{variant}</code></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="connector-actions-bar">
              <button
                type="button"
                className="btn-primary"
                onClick={handleCopyMessage}
                aria-label="Copy entire broadcast message"
              >
                <span className="btn-icon" aria-hidden="true">📋</span>
                <span>{copyMsgStatus === 'copied' ? 'Message copied!' : copyMsgStatus === 'error' ? 'Copy failed' : 'Copy message'}</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopyLink}
                aria-label="Copy tracked campaign URL"
              >
                <span className="btn-icon" aria-hidden="true">🔗</span>
                <span>{copyLinkStatus === 'copied' ? 'Link copied!' : copyLinkStatus === 'error' ? 'Copy failed' : 'Copy tracked link'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-whatsapp-direct"
                aria-label="Open message directly in WhatsApp"
              >
                <span className="btn-icon" aria-hidden="true">💬</span>
                <span>Open in WhatsApp</span>
              </a>
            </div>

            <div className="connector-disclaimer">
              <span className="mono-badge">NOTE</span>
              <span>
                Distribution instrument for student connectors. Generates client-side tracking parameters only; does not log recipients or collect personal phone numbers.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
