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

export const WalletTransactionType = {
  DEPOSIT: TransactionType.DEPOSIT,
  WITHDRAWAL: TransactionType.WITHDRAWAL,
  PAYMENT: TransactionType.PAYMENT,
  REFUND: TransactionType.REFUND,
} as const satisfies Record<string, TransactionType>;

export const WalletTransactionStatus = {
  PENDING: TransactionStatus.PENDING,
  COMPLETED: TransactionStatus.COMPLETED,
  FAILED: TransactionStatus.FAILED,
} as const satisfies Record<string, TransactionStatus>;

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
  paymentMethod?: string | null;
  paymentToken?: string | null;
  description?: string | null;
}

export interface VnPayDepositRequest {
  amount: number;
}

export interface DepositDemoRequest {
  amount: number;
  description?: string | null;
}

export interface WithdrawRequest {
  amount: number;
  description?: string | null;
  paymentMethod?: string | null;
}

export interface TransferRequest {
  amount: number;
  description?: string | null;
}

export interface TransferResult {
  wallet: {
    id: string;
    userId: string;
    availableBalance: number;
    heldBalance: number;
    totalEarned: number;
    currency: string;
    updatedAt?: string | null;
  };
  transaction: Transaction;
}
