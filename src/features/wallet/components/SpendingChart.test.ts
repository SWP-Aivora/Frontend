import { describe, expect, it } from 'vitest';
import { formatCompactAxisValue, getNiceYAxisScale } from './spendingChartAxis';

describe('SpendingChart Y-axis helpers', () => {
  it('selects the largest absolute value from positive and negative values', () => {
    const scale = getNiceYAxisScale([-90, -1012, 8250]);

    expect(scale.axisMax).toBe(10000);
  });

  it('generates symmetric positive and negative bounds', () => {
    const scale = getNiceYAxisScale([-120000000, 80000000]);

    expect(scale.axisMin).toBe(-scale.axisMax);
    expect(scale.ticks[0]).toBe(scale.axisMin);
    expect(scale.ticks.at(-1)).toBe(scale.axisMax);
  });

  it('formats thousands with K', () => {
    expect(formatCompactAxisValue(1000)).toBe('1K');
    expect(formatCompactAxisValue(50000)).toBe('50K');
  });

  it('formats millions with M', () => {
    expect(formatCompactAxisValue(1000000)).toBe('1M');
    expect(formatCompactAxisValue(1500000)).toBe('1.5M');
  });

  it('formats billions with B', () => {
    expect(formatCompactAxisValue(1000000000)).toBe('1B');
    expect(formatCompactAxisValue(1500000000)).toBe('1.5B');
  });

  it('formats trillions with T', () => {
    expect(formatCompactAxisValue(1000000000000)).toBe('1T');
    expect(formatCompactAxisValue(50000000000000)).toBe('50T');
  });

  it('preserves the negative sign', () => {
    expect(formatCompactAxisValue(-50000)).toBe('-50K');
    expect(formatCompactAxisValue(-1500000000)).toBe('-1.5B');
  });

  it('formats zero as 0', () => {
    expect(formatCompactAxisValue(0)).toBe('0');
  });

  it('removes unnecessary decimal zeros', () => {
    expect(formatCompactAxisValue(50000)).toBe('50K');
    expect(formatCompactAxisValue(1000000)).toBe('1M');
    expect(formatCompactAxisValue(250)).toBe('250');
  });

  it('produces a safe valid scale for empty and all-zero datasets', () => {
    const emptyScale = getNiceYAxisScale([]);
    const zeroScale = getNiceYAxisScale([0, 0, 0]);

    expect(emptyScale.axisMin).toBeLessThan(0);
    expect(emptyScale.axisMax).toBeGreaterThan(0);
    expect(emptyScale.ticks).toContain(0);
    expect(zeroScale.axisMin).toBeLessThan(0);
    expect(zeroScale.axisMax).toBeGreaterThan(0);
    expect(zeroScale.ticks).toContain(0);
  });

  it('produces readable non-overlapping ticks for mixed small and larger values', () => {
    const scale = getNiceYAxisScale([-90, -1012, 8250]);

    expect(scale.ticks).toEqual([-10000, -5000, 0, 5000, 10000]);
    expect(scale.ticks.map(formatCompactAxisValue)).toEqual(['-10K', '-5K', '0', '5K', '10K']);
    expect(scale.ticks.length).toBeLessThanOrEqual(7);
  });

  it('does not produce NaN or Infinity for large values', () => {
    const scale = getNiceYAxisScale([-Number.MAX_VALUE / 4, Number.MAX_VALUE / 5]);

    expect(Number.isFinite(scale.axisMin)).toBe(true);
    expect(Number.isFinite(scale.axisMax)).toBe(true);
    expect(scale.ticks.every(Number.isFinite)).toBe(true);
  });
});
