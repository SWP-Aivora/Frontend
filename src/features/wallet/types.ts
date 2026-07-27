export const TransactionType = {
  DEMO_DEPOSIT: 'DEMO_DEPOSIT',
  DEPOSIT: 'DEPOSIT',
  ESCROW_HOLD: 'ESCROW_HOLD',
  PAYMENT_RELEASE: 'PAYMENT_RELEASE',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  WITHDRAWAL: 'WITHDRAWAL',
  WITHDRAWAL_REQUEST: 'WITHDRAWAL_REQUEST',
  WITHDRAWAL_COMPLETED: 'WITHDRAWAL_COMPLETED',
  TRANSFER: 'TRANSFER',
  MILESTONE_RELEASE: 'MILESTONE_RELEASE',
  PLATFORM_FEE: 'PLATFORM_FEE',
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionStatus = {
  PENDING: 0,
  COMPLETED: 1,
  FAILED: 2,
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const WalletTransactionType = {
  DEMO_DEPOSIT: TransactionType.DEMO_DEPOSIT,
  DEPOSIT: TransactionType.DEPOSIT,
  ESCROW_HOLD: TransactionType.ESCROW_HOLD,
  PAYMENT_RELEASE: TransactionType.PAYMENT_RELEASE,
  WITHDRAWAL: TransactionType.WITHDRAWAL,
  PAYMENT: TransactionType.PAYMENT,
  REFUND: TransactionType.REFUND,
  WITHDRAWAL_REQUEST: TransactionType.WITHDRAWAL_REQUEST,
  WITHDRAWAL_COMPLETED: TransactionType.WITHDRAWAL_COMPLETED,
  TRANSFER: TransactionType.TRANSFER,
  MILESTONE_RELEASE: TransactionType.MILESTONE_RELEASE,
  PLATFORM_FEE: TransactionType.PLATFORM_FEE,
} as const satisfies Record<string, TransactionType>;

export const TransactionDirection = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
} as const;
export type TransactionDirection = (typeof TransactionDirection)[keyof typeof TransactionDirection];

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
  direction?: TransactionDirection | null;
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
