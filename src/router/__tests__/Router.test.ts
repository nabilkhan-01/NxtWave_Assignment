import { describe, it, expect } from 'vitest';
import { normalizePath } from '../Router';

describe('Router path normalization', () => {
  it('normalizes standard route paths correctly', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('/diagnose')).toBe('/diagnose');
    expect(normalizePath('/growth')).toBe('/growth');
    expect(normalizePath('/campaign')).toBe('/campaign');
  });

  it('normalizes trailing slashes cleanly', () => {
    expect(normalizePath('/diagnose/')).toBe('/diagnose');
    expect(normalizePath('/growth/')).toBe('/growth');
    expect(normalizePath('/campaign/')).toBe('/campaign');
  });

  it('strips query parameters for route matching', () => {
    expect(normalizePath('/diagnose?utm_source=campus_rep')).toBe('/diagnose');
    expect(normalizePath('/?utm_campaign=workshop')).toBe('/');
    expect(normalizePath('/growth?preview=true&debug=1')).toBe('/growth');
  });

  it('handles hash-based routes for static hosting compatibility', () => {
    expect(normalizePath('#/diagnose')).toBe('/diagnose');
    expect(normalizePath('#/growth')).toBe('/growth');
    expect(normalizePath('#/campaign')).toBe('/campaign');
    expect(normalizePath('#/')).toBe('/');
  });

  it('falls back to root for unrecognized paths', () => {
    expect(normalizePath('/unknown')).toBe('/');
    expect(normalizePath('/admin')).toBe('/');
    expect(normalizePath('')).toBe('/');
  });
});

