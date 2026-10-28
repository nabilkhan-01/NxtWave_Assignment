import { describe, it, expect } from 'vitest';
import {
  parseAttribution,
  buildShareUrl,
  buildWhatsAppMessage,
  buildWhatsAppUrl
} from '../attribution';

describe('Attribution and Share Utilities', () => {
  it('parses incoming query string correctly', () => {
    const search = '?utm_source=college-club&utm_medium=whatsapp&utm_campaign=capstone-demo';
    const parsed = parseAttribution(search);

    expect(parsed.utm_source).toBe('college-club');
    expect(parsed.utm_medium).toBe('whatsapp');
    expect(parsed.utm_campaign).toBe('capstone-demo');
  });

  it('handles empty or missing search string gracefully', () => {
    expect(parseAttribution('')).toEqual({});
    expect(parseAttribution('?')).toEqual({});
  });

  it('builds peer share URL with proper UTM tags without leaking user data', () => {
    const base = 'https://shipscope.dev/app?draft=confidential-user-idea';
    const incoming = { utm_campaign: 'campus-drive' };

    const whatsappUrl = buildShareUrl(base, incoming, 'whatsapp');
    const copyUrl = buildShareUrl(base, incoming, 'copy');

    expect(whatsappUrl).toContain('utm_source=peer');
    expect(whatsappUrl).toContain('utm_medium=whatsapp');
    expect(whatsappUrl).toContain('utm_campaign=campus-drive');

    expect(copyUrl).toContain('utm_source=peer');
    expect(copyUrl).toContain('utm_medium=clipboard');
  });

  it('constructs respectful WhatsApp message with optional preset title', () => {
    const url = 'https://shipscope.dev?utm_source=peer';
    const messageWithPreset = buildWhatsAppMessage(url, 'Course Notes Q&A');
    const messageGeneric = buildWhatsAppMessage(url);

    expect(messageWithPreset).toContain('Course Notes Q&A');
    expect(messageWithPreset).toContain(url);
    expect(messageGeneric).toContain('scoping an AI capstone idea');
    expect(messageGeneric).toContain(url);
  });

  it('properly encodes the message for wa.me link', () => {
    const url = 'https://shipscope.dev?utm_source=peer';
    const waLink = buildWhatsAppUrl(url, 'Resume–Job Matcher');

    expect(waLink.startsWith('https://wa.me/?text=')).toBe(true);
    // Must be valid URI component
    expect(waLink).toContain(encodeURIComponent('Resume–Job Matcher'));
    expect(waLink).not.toContain('\n'); // Newlines must be percent-encoded
  });
});
