import { describe, expect, it } from 'vitest';
import {
  BUDGET_RANGE_INVALID_MESSAGE,
  MILESTONE_AMOUNT_INVALID_MESSAGE,
  MILESTONE_TOTAL_ABOVE_MAX_MESSAGE,
  MILESTONE_TOTAL_BELOW_MIN_MESSAGE,
  validateMilestoneBudgetTotal,
} from '../../../features/jobs/budgetValidation';

describe('validateMilestoneBudgetTotal', () => {
  it('accepts a milestone total inside the job budget range', () => {
    const result = validateMilestoneBudgetTotal(1000, 2000, [
      { amount: 500 },
      { amount: 1000 },
    ]);

    expect(result.milestoneTotal).toBe(1500);
    expect(result.isValid).toBe(true);
    expect(result.blockingMessage).toBeNull();
  });

  it('rejects a milestone total below the minimum budget', () => {
    const result = validateMilestoneBudgetTotal(1000, 2000, [
      { amount: 400 },
      { amount: 500 },
    ]);

    expect(result.milestoneTotal).toBe(900);
    expect(result.isValid).toBe(false);
    expect(result.blockingMessage).toBe(MILESTONE_TOTAL_BELOW_MIN_MESSAGE);
  });

  it('rejects a milestone total above the maximum budget', () => {
    const result = validateMilestoneBudgetTotal(1000, 2000, [
      { amount: 1000 },
      { amount: 1100 },
    ]);

    expect(result.milestoneTotal).toBe(2100);
    expect(result.isValid).toBe(false);
    expect(result.blockingMessage).toBe(MILESTONE_TOTAL_ABOVE_MAX_MESSAGE);
  });

  it('rejects an inverted budget range before checking the milestone total', () => {
    const result = validateMilestoneBudgetTotal(2000, 1000, [
      { amount: 1500 },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.blockingMessage).toBe(BUDGET_RANGE_INVALID_MESSAGE);
  });

  it('treats missing or non-numeric milestone amounts as zero and invalid', () => {
    const result = validateMilestoneBudgetTotal(1000, 2000, [
      { amount: null },
      { amount: Number.NaN },
      { amount: 1000 },
    ]);

    expect(result.milestoneTotal).toBe(1000);
    expect(result.isValid).toBe(false);
    expect(result.blockingMessage).toBe(MILESTONE_AMOUNT_INVALID_MESSAGE);
  });
});
