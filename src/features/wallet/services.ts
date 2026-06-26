import apiClient from '@/lib/axios';
import type { Wallet, Transaction, DepositRequest } from './types';
import { TransactionType, TransactionStatus } from './types';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { normalizeBaseResponse, normalizePaginatedResponse } from '@/lib/api-utils';

/**
 * Normalize wallet payload from backend.
 * Backend returns availableBalance / heldBalance / totalEarned;
 * we also populate the legacy `balance` field for backward compat.
 */
const normalizeWallet = (wallet: Wallet): Wallet => {
  const raw = wallet as unknown as Record<string, unknown>;

  const availableBalance = Number(
    wallet.availableBalance ?? raw.AvailableBalance ?? raw.availableBalance ?? wallet.balance ?? raw.Balance ?? 0
  );
  const heldBalance = Number(
    wallet.heldBalance ?? raw.HeldBalance ?? raw.heldBalance ?? 0
  );
  const totalEarned = Number(
    wallet.totalEarned ?? raw.TotalEarned ?? raw.totalEarned ?? 0
  );

  return {
    ...wallet,
    id: wallet.id || String(raw.Id ?? raw.id ?? ''),
    userId: wallet.userId || String(raw.UserId ?? raw.userId ?? ''),
    availableBalance,
    heldBalance,
    totalEarned,
    balance: availableBalance, // legacy field
    currency: wallet.currency || String(raw.Currency ?? raw.currency ?? 'USD'),
    createdAt: wallet.createdAt || String(raw.CreatedAt ?? raw.createdAt ?? ''),
    updatedAt: wallet.updatedAt || String(raw.UpdatedAt ?? raw.updatedAt ?? ''),
  };
};

/**
 * Normalize a single transaction, mapping backend string enums to frontend types.
 */
const NORMALIZE_TYPE_MAP: Record<string, TransactionType> = {
  credit: TransactionType.CREDIT,
  CREDIT: TransactionType.CREDIT,
  debit: TransactionType.DEBIT,
  DEBIT: TransactionType.DEBIT,
  payment_release: TransactionType.PAYMENT_RELEASE,
  PAYMENT_RELEASE: TransactionType.PAYMENT_RELEASE,
  deposit: TransactionType.DEPOSIT,
  DEPOSIT: TransactionType.DEPOSIT,
  withdrawal: TransactionType.WITHDRAWAL,
  WITHDRAWAL: TransactionType.WITHDRAWAL,
  payment: TransactionType.PAYMENT,
  PAYMENT: TransactionType.PAYMENT,
  refund: TransactionType.REFUND,
  REFUND: TransactionType.REFUND,
};

const NORMALIZE_STATUS_MAP: Record<string, TransactionStatus> = {
  pending: TransactionStatus.PENDING,
  PENDING: TransactionStatus.PENDING,
  completed: TransactionStatus.COMPLETED,
  COMPLETED: TransactionStatus.COMPLETED,
  failed: TransactionStatus.FAILED,
  FAILED: TransactionStatus.FAILED,
};

const normalizeTransaction = (tx: Transaction): Transaction => {
  const raw = tx as unknown as Record<string, unknown>;
  const rawType = String(raw.type ?? raw.Type ?? raw.TransactionType ?? tx.type ?? '');
  const rawStatus = String(raw.status ?? raw.Status ?? raw.TransactionStatus ?? tx.status ?? '');

  return {
    ...tx,
    id: tx.id || String(raw.Id ?? raw.id ?? ''),
    walletId: tx.walletId || String(raw.WalletId ?? raw.walletId ?? ''),
    amount: Number(tx.amount ?? raw.Amount ?? raw.amount ?? 0),
    type: NORMALIZE_TYPE_MAP[rawType] ?? (rawType as TransactionType),
    status: NORMALIZE_STATUS_MAP[rawStatus] ?? (rawStatus as TransactionStatus),
    description: tx.description ?? (typeof raw.Description === 'string' ? raw.Description : null),
    referenceId: tx.referenceId ?? (typeof raw.ReferenceId === 'string' ? raw.ReferenceId : null),
    createdAt: tx.createdAt || String(raw.CreatedAt ?? raw.createdAt ?? ''),
  };
};

export const walletService = {
  getWallet: async (): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.ME);
    const normalized = normalizeBaseResponse<Wallet>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeWallet(normalized.data) : null,
    };
  },

  /**
   * Deposit demo funds for testing purposes.
   * This endpoint is only available in development/demo environments.
   */
  depositDemo: async (data: DepositRequest): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.post(API_ENDPOINTS.WALLET.DEPOSIT_DEMO, data);
    const normalized = normalizeBaseResponse<Wallet>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeWallet(normalized.data) : null,
    };
  },

  getPaymentHistory: async (params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.HISTORY, { params });
    const normalized = normalizePaginatedResponse<Transaction>(response);
    return {
      ...normalized,
      data: (normalized.data || []).map(normalizeTransaction),
    };
  },
};
