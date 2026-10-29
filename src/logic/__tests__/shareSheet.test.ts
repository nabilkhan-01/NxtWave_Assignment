import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildTrackedShareUrl,
  buildSharePayload,
  buildWhatsAppUrl,
  buildTelegramUrl,
  buildEmailUrl,
  buildNativeShareData,
  isNativeShareSupported,
  ShareContextConfig
} from '../shareSheet';

describe('Share Sheet Logic & URL Generation', () => {
  const peerConfig: ShareContextConfig = {
    context: 'peer',
    baseLocation: 'https://shipscope.dev/diagnose?draft=super-secret-user-prompt&description=private-data',
    presetTitle: 'Course Notes Q&A',
    incomingAttribution: { utm_campaign: 'capstone-drive-2026' }
  };

  const connectorConfig: ShareContextConfig = {
    context: 'connector',
    baseLocation: 'https://shipscope.dev/growth',
    sourceType: 'coding-club',
    sourceLabel: 'IIT Bombay CSE',
    variant: 'build-first-hook'
  };

  it('builds tracked share URLs with designated utm_medium and strips private user drafts', () => {
    const waUrl = buildTrackedShareUrl(peerConfig, 'whatsapp');
    const tgUrl = buildTrackedShareUrl(peerConfig, 'telegram');
    const emailUrl = buildTrackedShareUrl(peerConfig, 'email');
    const nativeUrl = buildTrackedShareUrl(peerConfig, 'native');
    const instaUrl = buildTrackedShareUrl(peerConfig, 'instagram');
    const copyUrl = buildTrackedShareUrl(peerConfig, 'clipboard');

    // Verify private data is stripped
    expect(waUrl).not.toContain('super-secret-user-prompt');
    expect(waUrl).not.toContain('private-data');

    // Verify utm_source, utm_campaign and respective utm_medium
    expect(new URL(waUrl).searchParams.get('utm_source')).toBe('peer');
    expect(new URL(waUrl).searchParams.get('utm_medium')).toBe('whatsapp');
    expect(new URL(waUrl).searchParams.get('utm_campaign')).toBe('capstone-drive-2026');

    expect(new URL(tgUrl).searchParams.get('utm_medium')).toBe('telegram');
    expect(new URL(emailUrl).searchParams.get('utm_medium')).toBe('email');
    expect(new URL(nativeUrl).searchParams.get('utm_medium')).toBe('native-share');
    expect(new URL(instaUrl).searchParams.get('utm_medium')).toBe('instagram');
    expect(new URL(copyUrl).searchParams.get('utm_medium')).toBe('clipboard');
  });

  it('preserves connector attributes including sanitized slug and message variant', () => {
    const connectorUrl = buildTrackedShareUrl(connectorConfig, 'telegram');
    const parsed = new URL(connectorUrl);

    expect(parsed.searchParams.get('utm_source')).toBe('coding_club_iit-bombay-cse');
    expect(parsed.searchParams.get('utm_medium')).toBe('telegram');
    expect(parsed.searchParams.get('utm_campaign')).toBe('shipscope-workshop');
    expect(parsed.searchParams.get('utm_content')).toBe('build-first-hook');
  });

  it('generates valid, fully encoded WhatsApp deep links', () => {
    const waUrl = buildWhatsAppUrl(peerConfig);

    expect(waUrl.startsWith('https://wa.me/?text=')).toBe(true);
    expect(waUrl).toContain(encodeURIComponent('Course Notes Q&A'));
    expect(waUrl).toContain('utm_medium%3Dwhatsapp');
    expect(waUrl).not.toContain('\n'); // Newlines must be properly encoded
  });

  it('generates official Telegram share links with distinct url and text parameters', () => {
    const tgUrl = buildTelegramUrl(peerConfig);

    expect(tgUrl.startsWith('https://t.me/share/url?')).toBe(true);
    const parsed = new URL(tgUrl);
    expect(parsed.searchParams.get('url')).toContain('utm_medium=telegram');
    expect(parsed.searchParams.get('text')).toContain('Course Notes Q&A');
  });

  it('generates valid mailto links with subject and message body', () => {
    const mailto = buildEmailUrl(peerConfig);

    expect(mailto.startsWith('mailto:?')).toBe(true);
    expect(mailto).toContain('subject=' + encodeURIComponent('Try ShipScope — scope your AI project'));
    expect(mailto).toContain('utm_medium%3Demail');
  });

  it('generates campaign-specific subject and body for connector share payload', () => {
    const payload = buildSharePayload(connectorConfig, 'email');

    expect(payload.subject).toBe('Build Your First AI Project — ShipScope Scope Diagnostic');
    expect(payload.messageText).toContain('Stop collecting AI project ideas');
    expect(payload.trackedUrl).toContain('utm_content=build-first-hook');
    expect(payload.actionUrl).toContain('mailto:?');
  });

  it('constructs correct Web Share API payload without private leakage', () => {
    const data = buildNativeShareData(peerConfig);

    expect(data.title).toBe('ShipScope — AI Capstone Scope Diagnostic');
    expect(data.text).toContain('Course Notes Q&A');
    expect(data.url).toContain('utm_medium=native-share');
    expect(data.url).not.toContain('super-secret');
  });

  describe('Capability check: isNativeShareSupported', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns true when navigator.share is a function', () => {
      vi.stubGlobal('navigator', { share: vi.fn() });
      expect(isNativeShareSupported()).toBe(true);
    });

    it('returns false when navigator.share is undefined', () => {
      vi.stubGlobal('navigator', {});
      expect(isNativeShareSupported()).toBe(false);
    });
  });
});
