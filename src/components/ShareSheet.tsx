import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ShareContextConfig,
  buildSharePayload,
  buildTrackedShareUrl,
  isNativeShareSupported
} from '../logic/shareSheet';

export interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  config: ShareContextConfig;
  title?: string;
  subtitle?: string;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({
  isOpen,
  onClose,
  triggerRef,
  config,
  title = 'Share ShipScope',
  subtitle = 'Choose where you want to send this message.'
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const [feedback, setFeedback] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [canNativeShare, setCanNativeShare] = useState<boolean>(false);

  useEffect(() => {
    setCanNativeShare(isNativeShareSupported());
  }, []);

  // Capture previously focused element when opened & restore on close
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = (document.activeElement as HTMLElement) || triggerRef?.current || null;
      setFeedback(null);

      // Focus the close button or first interactive element after open
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      // Prevent body scrolling while modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      // Restore focus to trigger
      const target = triggerRef?.current || previouslyFocusedElementRef.current;
      if (target && typeof target.focus === 'function') {
        setTimeout(() => target.focus(), 50);
      }
    }
  }, [isOpen, triggerRef]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap inside dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Copy helper with Clipboard API and robust fallback
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
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
        return success;
      } catch {
        return false;
      }
    }
  }, []);

  // WhatsApp Action
  const handleWhatsApp = () => {
    const payload = buildSharePayload(config, 'whatsapp');
    if (payload.actionUrl) {
      window.open(payload.actionUrl, '_blank', 'noopener,noreferrer');
      setFeedback({ message: 'Opening WhatsApp...', type: 'info' });
      setTimeout(onClose, 800);
    }
  };

  // Telegram Action
  const handleTelegram = () => {
    const payload = buildSharePayload(config, 'telegram');
    if (payload.actionUrl) {
      window.open(payload.actionUrl, '_blank', 'noopener,noreferrer');
      setFeedback({ message: 'Opening Telegram...', type: 'info' });
      setTimeout(onClose, 800);
    }
  };

  // Email Action
  const handleEmail = () => {
    const payload = buildSharePayload(config, 'email');
    if (payload.actionUrl) {
      window.location.href = payload.actionUrl;
      setFeedback({ message: 'Opening email client...', type: 'info' });
      setTimeout(onClose, 800);
    }
  };

  // Native Web Share Action ("More apps")
  const handleNativeShare = async () => {
    const payload = buildSharePayload(config, 'native');
    if (navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: `${payload.messageText}\n\n${payload.callToAction}:`,
          url: payload.trackedUrl
        });
        setFeedback({ message: 'Shared successfully', type: 'success' });
        setTimeout(onClose, 600);
      } catch (err: unknown) {
        // Handle user cancellation gracefully
        if (err instanceof Error && err.name === 'AbortError') {
          // User cancelled native share sheet — do not treat as error
          return;
        }
        setFeedback({ message: 'Unable to open system share sheet', type: 'error' });
      }
    }
  };

  // Instagram Action
  const handleInstagram = async () => {
    const instaUrl = buildTrackedShareUrl(config, 'instagram');
    const { title, messageText, callToAction } = buildSharePayload(config, 'instagram');

    if (canNativeShare && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${messageText}\n\n${callToAction}:`,
          url: instaUrl
        });
        setFeedback({ message: 'Choose Instagram from your device\'s share sheet.', type: 'info' });
        setTimeout(onClose, 1000);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Fall back to clipboard flow if native share fails
      }
    }

    // Fallback: Copy link and open Instagram web
    const success = await copyToClipboard(instaUrl);
    if (success) {
      setFeedback({
        message: 'Link copied — opening Instagram. Paste it into your message or story.',
        type: 'success'
      });
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
        onClose();
      }, 1400);
    } else {
      setFeedback({ message: 'Could not copy link to clipboard.', type: 'error' });
    }
  };

  // Copy Link Action
  const handleCopyLink = async () => {
    const copyUrl = buildTrackedShareUrl(config, 'clipboard');
    const success = await copyToClipboard(copyUrl);
    if (success) {
      setFeedback({ message: 'Link copied', type: 'success' });
      setTimeout(onClose, 1000);
    } else {
      setFeedback({ message: 'Failed to copy link', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-sheet-backdrop" onClick={onClose} aria-hidden="true">
      <div
        ref={dialogRef}
        className="share-sheet-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-sheet-title"
        aria-describedby="share-sheet-subtitle"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="share-sheet-header">
          <div className="share-sheet-title-group">
            <h3 id="share-sheet-title" className="share-sheet-title">
              {title}
            </h3>
            <p id="share-sheet-subtitle" className="share-sheet-subtitle">
              {subtitle}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="share-sheet-close-btn"
            onClick={onClose}
            aria-label="Close share sheet"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="share-sheet-body">
          {/* Feedback Live Region */}
          {feedback && (
            <div
              className={`share-sheet-feedback feedback-${feedback.type}`}
              role="status"
              aria-live="polite"
            >
              <span className="feedback-icon" aria-hidden="true">
                {feedback.type === 'success' ? '✓' : feedback.type === 'error' ? '⚠' : 'ℹ'}
              </span>
              <span className="feedback-text">{feedback.message}</span>
            </div>
          )}

          {/* Sharing Options Grid / List */}
          <div className="share-options-list" role="menu" aria-label="Sharing services">
            {/* 1. WhatsApp */}
            <button
              type="button"
              role="menuitem"
              className="share-option-btn share-option-whatsapp"
              onClick={handleWhatsApp}
            >
              <div className="share-option-icon-box icon-whatsapp" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="share-option-text">
                <div className="share-option-title-row">
                  <strong className="option-name">WhatsApp</strong>
                  <span className="share-option-badge">Direct</span>
                </div>
                <span className="option-desc">Send via chat or group message</span>
              </div>
              <span className="option-arrow" aria-hidden="true">→</span>
            </button>

            {/* 2. Telegram */}
            <button
              type="button"
              role="menuitem"
              className="share-option-btn share-option-telegram"
              onClick={handleTelegram}
            >
              <div className="share-option-icon-box icon-telegram" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.827.965z" />
                </svg>
              </div>
              <div className="share-option-text">
                <div className="share-option-title-row">
                  <strong className="option-name">Telegram</strong>
                </div>
                <span className="option-desc">Share to contacts, channel, or saved messages</span>
              </div>
              <span className="option-arrow" aria-hidden="true">→</span>
            </button>

            {/* 3. Email */}
            <button
              type="button"
              role="menuitem"
              className="share-option-btn share-option-email"
              onClick={handleEmail}
            >
              <div className="share-option-icon-box icon-email" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div className="share-option-text">
                <div className="share-option-title-row">
                  <strong className="option-name">Email</strong>
                </div>
                <span className="option-desc">Open draft in your default email client</span>
              </div>
              <span className="option-arrow" aria-hidden="true">→</span>
            </button>

            {/* 4. Instagram */}
            <button
              type="button"
              role="menuitem"
              className="share-option-btn share-option-instagram"
              onClick={handleInstagram}
            >
              <div className="share-option-icon-box icon-instagram" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div className="share-option-text">
                <div className="share-option-title-row">
                  <strong className="option-name">Instagram</strong>
                </div>
                <span className="option-desc">Share via system sheet or copy link for DM/Story</span>
              </div>
              <span className="option-arrow" aria-hidden="true">→</span>
            </button>

            {/* 5. Native "More apps" (when supported) */}
            {canNativeShare && (
              <button
                type="button"
                role="menuitem"
                className="share-option-btn share-option-native"
                onClick={handleNativeShare}
              >
                <div className="share-option-icon-box icon-native" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
                  </svg>
                </div>
                <div className="share-option-text">
                  <div className="share-option-title-row">
                    <strong className="option-name">More apps</strong>
                    <span className="share-option-badge">System</span>
                  </div>
                  <span className="option-desc">Open native device share sheet</span>
                </div>
                <span className="option-arrow" aria-hidden="true">→</span>
              </button>
            )}

            {/* 6. Copy Link */}
            <button
              type="button"
              role="menuitem"
              className="share-option-btn share-option-copy"
              onClick={handleCopyLink}
            >
              <div className="share-option-icon-box icon-copy" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              </div>
              <div className="share-option-text">
                <div className="share-option-title-row">
                  <strong className="option-name">Copy link</strong>
                </div>
                <span className="option-desc">Copy tracked campaign URL to clipboard</span>
              </div>
              <span className="option-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="share-sheet-footer">
          <p className="share-sheet-note">
            Campaign attribution parameters are attached automatically. User drafts are never shared.
          </p>
        </div>
      </div>
    </div>
  );
};
