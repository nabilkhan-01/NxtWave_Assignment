import { describe, it, expect } from 'vitest';
import {
  calculateConversionRate,
  evaluateExperiment
} from '../experimentLab';

describe('Message Experiment Lab Logic', () => {
  it('calculates conversion rate safely for valid and edge cases', () => {
    expect(calculateConversionRate(20, 100)).toBe(0.2);
    expect(calculateConversionRate(0, 50)).toBe(0);
    expect(calculateConversionRate(50, 0)).toBeNull(); // Zero visits
    expect(calculateConversionRate(-5, 100)).toBe(0);
    expect(calculateConversionRate(150, 100)).toBe(1); // Clamps to 100%
    expect(calculateConversionRate(NaN, 100)).toBeNull();
  });

  it('handles zero visits across both variants', () => {
    const result = evaluateExperiment(
      { visits: 0, registrations: 0 },
      { visits: 0, registrations: 0 }
    );

    expect(result.crA).toBeNull();
    expect(result.crB).toBeNull();
    expect(result.absoluteDiff).toBeNull();
    expect(result.leadingVariant).toBe('none');
    expect(result.isSufficientEvidence).toBe(false);
  });

  it('flags insufficient evidence when visits are below threshold', () => {
    // 25 visits each (< 30)
    const result = evaluateExperiment(
      { visits: 25, registrations: 5 },
      { visits: 25, registrations: 2 }
    );

    expect(result.crA).toBe(0.2);
    expect(result.crB).toBe(0.08);
    expect(result.isSufficientEvidence).toBe(false);
    expect(result.guidanceText).toContain('Insufficient evidence');
  });

  it('identifies Variant A as leading when outperforming with sufficient sample', () => {
    const result = evaluateExperiment(
      { visits: 100, registrations: 24 }, // 24%
      { visits: 100, registrations: 16 }  // 16%
    );

    expect(result.crA).toBeCloseTo(0.24);
    expect(result.crB).toBeCloseTo(0.16);
    expect(result.absoluteDiff).toBeCloseTo(0.08);
    expect(result.leadingVariant).toBe('A');
    expect(result.isSufficientEvidence).toBe(true);
    expect(result.guidanceText).toContain('Variant A');
    expect(result.guidanceText).toContain('8.0 percentage points');
  });

  it('identifies Variant B as leading when outperforming with sufficient sample', () => {
    const result = evaluateExperiment(
      { visits: 80, registrations: 12 }, // 15%
      { visits: 80, registrations: 20 }  // 25%
    );

    expect(result.crA).toBeCloseTo(0.15);
    expect(result.crB).toBeCloseTo(0.25);
    expect(result.absoluteDiff).toBeCloseTo(0.1);
    expect(result.leadingVariant).toBe('B');
    expect(result.isSufficientEvidence).toBe(true);
    expect(result.guidanceText).toContain('Variant B');
  });

  it('identifies tied/close results when conversion rates are within threshold', () => {
    const result = evaluateExperiment(
      { visits: 100, registrations: 20 }, // 20.0%
      { visits: 100, registrations: 21 }  // 21.0% (gap 1% < 1.5%)
    );

    expect(result.crA).toBeCloseTo(0.2);
    expect(result.crB).toBeCloseTo(0.21);
    expect(result.leadingVariant).toBe('tied');
    expect(result.isSufficientEvidence).toBe(true);
    expect(result.guidanceText).toContain('Conversion rates are closely aligned');
  });

  it('handles zero registrations with non-zero visits cleanly', () => {
    const result = evaluateExperiment(
      { visits: 50, registrations: 0 },
      { visits: 50, registrations: 5 }
    );

    expect(result.crA).toBe(0);
    expect(result.crB).toBe(0.1);
    expect(result.absoluteDiff).toBeCloseTo(0.1);
    expect(result.leadingVariant).toBe('B');
  });
});
