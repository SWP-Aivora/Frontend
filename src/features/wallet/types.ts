/**
 * Backend returns transaction types as strings (e.g. "CREDIT", "DEBIT", "PAYMENT_RELEASE").
 * These string literals mirror the backend enum values.
 */
export const TransactionType = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
  PAYMENT_RELEASE: 'PAYMENT_RELEASE',
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

/**
 * Backend returns transaction statuses as strings (e.g. "COMPLETED", "PENDING", "FAILED").
 */
export const TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export interface Wallet {
  id: string;
  userId: string;
  /** @deprecated use availableBalance instead — kept for backward compat */
  balance?: number;
  /** Actual available balance returned by backend */
  availableBalance: number;
  /** Funds held in escrow */
  heldBalance: number;
  /** Lifetime earnings total */
  totalEarned: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  referenceId: string | null; // e.g., milestoneId
  createdAt: string;
}

export interface DepositRequest {
  amount: number;
}
