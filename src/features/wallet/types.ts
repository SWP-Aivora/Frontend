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
  type: number; // 0: Deposit, 1: Withdrawal, 2: Payment, 3: Refund
  status: number; // 0: Pending, 1: Completed, 2: Failed
  description: string | null;
  referenceId: string | null; // e.g., milestoneId
  createdAt: string;
}

export interface DepositRequest {
  amount: number;
}
