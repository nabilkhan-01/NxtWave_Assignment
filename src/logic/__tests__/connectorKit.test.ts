import { describe, it, expect } from 'vitest';
import {
  sanitizeSourceLabel,
  buildConnectorUrl,
  buildConnectorMessage,
  buildConnectorWhatsAppUrl,
  SOURCE_TYPES,
  MESSAGE_VARIANTS
} from '../connectorKit';

describe('Campus Connector Kit Logic', () => {
  it('sanitizes arbitrary source labels cleanly', () => {
    expect(sanitizeSourceLabel('')).toBe('');
    expect(sanitizeSourceLabel('IIT Bombay CSE')).toBe('iit-bombay-cse');
    expect(sanitizeSourceLabel('  Campus_Ambassadors 2026!  ')).toBe('campus-ambassadors-2026');
    expect(sanitizeSourceLabel('ECE--Dept---Batch#4')).toBe('ece-dept-batch4');
    expect(sanitizeSourceLabel(undefined)).toBe('');
  });

  it('builds tracked campaign URLs for all 4 source types', () => {
    const base = 'https://shipscope.dev';

    SOURCE_TYPES.forEach((source) => {
      const url = buildConnectorUrl(base, source.id, 'Alpha Batch', 'scope-hook');
      const parsed = new URL(url);

      expect(parsed.searchParams.get('utm_source')).toBe(`${source.defaultSource}_alpha-batch`);
      expect(parsed.searchParams.get('utm_medium')).toBe('whatsapp');
      expect(parsed.searchParams.get('utm_campaign')).toBe('shipscope-workshop');
      expect(parsed.searchParams.get('utm_content')).toBe('scope-hook');
    });
  });

  it('builds tracked campaign URLs without optional source label', () => {
    const url = buildConnectorUrl('https://shipscope.dev', 'coding-club', undefined, 'build-first-hook');
    const parsed = new URL(url);

    expect(parsed.searchParams.get('utm_source')).toBe('coding_club');
    expect(parsed.searchParams.get('utm_content')).toBe('build-first-hook');
  });

  it('generates natural, non-generic WhatsApp messages for both variants', () => {
    const testUrl = 'https://shipscope.dev/?utm_source=class_rep&utm_medium=whatsapp';

    const msgA = buildConnectorMessage('scope-hook', testUrl);
    expect(msgA).toContain(MESSAGE_VARIANTS['scope-hook'].body);
    expect(msgA).toContain(testUrl);

    const msgB = buildConnectorMessage('build-first-hook', testUrl);
    expect(msgB).toContain(MESSAGE_VARIANTS['build-first-hook'].body);
    expect(msgB).toContain(testUrl);
  });

  it('encodes wa.me deep links properly', () => {
    const testUrl = 'https://shipscope.dev/?utm_source=peer';
    const waUrl = buildConnectorWhatsAppUrl('scope-hook', testUrl);

    expect(waUrl.startsWith('https://wa.me/?text=')).toBe(true);
    expect(waUrl).toContain(encodeURIComponent('Have an AI project idea'));
    expect(waUrl).toContain(encodeURIComponent(testUrl));
  });
});
