export const TransactionType = {
  DEPOSIT: 0,
  WITHDRAWAL: 1,
  PAYMENT: 2,
  REFUND: 3,
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionStatus = {
  PENDING: 0,
  COMPLETED: 1,
  FAILED: 2,
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
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
