import type { SuggestedMilestone } from './types';

export const MILESTONE_TOTAL_BELOW_MIN_MESSAGE = 'The total milestone amount is below the minimum job budget.';
export const MILESTONE_TOTAL_ABOVE_MAX_MESSAGE = 'The total milestone amount exceeds the maximum job budget.';
export const BUDGET_RANGE_INVALID_MESSAGE = 'The minimum budget cannot be greater than the maximum budget.';
export const MILESTONE_AMOUNT_INVALID_MESSAGE = 'Milestone amounts must be greater than 0.';

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const getSafeCurrencyAmount = (value: unknown): number => toFiniteNumber(value) ?? 0;

export interface MilestoneBudgetValidation {
  milestoneTotal: number;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetRangeLabel: string;
  isBudgetRangeInvalid: boolean;
  hasInvalidMilestoneAmount: boolean;
  milestoneTotalMessage: string | null;
  blockingMessage: string | null;
  isValid: boolean;
}

export const validateMilestoneBudgetTotal = (
  budgetMinValue: unknown,
  budgetMaxValue: unknown,
  milestones: Pick<SuggestedMilestone, 'amount'>[] | null | undefined,
): MilestoneBudgetValidation => {
  const budgetMin = toFiniteNumber(budgetMinValue);
  const budgetMax = toFiniteNumber(budgetMaxValue);
  const milestoneItems = milestones ?? [];
  const milestoneTotal = milestoneItems.reduce(
    (total, milestone) => total + getSafeCurrencyAmount(milestone.amount),
    0,
  );
  const hasInvalidMilestoneAmount = milestoneItems.some((milestone) => {
    const amount = toFiniteNumber(milestone.amount);
    return amount === null || amount <= 0;
  });
  const isBudgetRangeInvalid = budgetMin !== null && budgetMax !== null && budgetMin > budgetMax;

  let milestoneTotalMessage: string | null = null;
  if (!isBudgetRangeInvalid && budgetMin !== null && budgetMax !== null) {
    if (milestoneTotal < budgetMin) {
      milestoneTotalMessage = MILESTONE_TOTAL_BELOW_MIN_MESSAGE;
    } else if (milestoneTotal > budgetMax) {
      milestoneTotalMessage = MILESTONE_TOTAL_ABOVE_MAX_MESSAGE;
    }
  }

  const blockingMessage =
    (isBudgetRangeInvalid ? BUDGET_RANGE_INVALID_MESSAGE : null) ??
    (hasInvalidMilestoneAmount ? MILESTONE_AMOUNT_INVALID_MESSAGE : null) ??
    milestoneTotalMessage;

  return {
    milestoneTotal,
    budgetMin,
    budgetMax,
    budgetRangeLabel: `${getSafeCurrencyAmount(budgetMinValue).toLocaleString()} - ${getSafeCurrencyAmount(budgetMaxValue).toLocaleString()} Aivora Coin`,
    isBudgetRangeInvalid,
    hasInvalidMilestoneAmount,
    milestoneTotalMessage,
    blockingMessage,
    isValid: blockingMessage === null,
  };
};
