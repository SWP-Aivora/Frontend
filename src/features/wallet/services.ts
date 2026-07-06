import apiClient from '@/lib/axios';
import { TransactionStatus, TransactionType } from './types';
import type { Wallet, Transaction, DepositRequest, DepositDemoRequest, VnPayDepositRequest, WithdrawRequest } from './types';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { normalizeBaseResponse, normalizePaginatedResponse } from '@/lib/api-utils';

const DEFAULT_HISTORY_PARAMS = {
  PageSize: 20,
  PageIndex: 1,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

const toStringValue = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value : null;

const normalizeTransactionType = (value: unknown): Transaction['type'] => {
  const numeric = toNumber(value);
  if (numeric === TransactionType.DEPOSIT || numeric === TransactionType.WITHDRAWAL || numeric === TransactionType.PAYMENT || numeric === TransactionType.REFUND) {
    return numeric;
  }

  const text = toStringValue(value)?.toLowerCase();
  if (text?.includes('deposit')) return TransactionType.DEPOSIT;
  if (text?.includes('withdraw')) return TransactionType.WITHDRAWAL;
  if (text?.includes('refund')) return TransactionType.REFUND;
  return TransactionType.PAYMENT;
};

const normalizeTransactionStatus = (
  value: unknown,
  item?: Record<string, unknown>
): Transaction['status'] => {
  const numeric = toNumber(value);
  if (numeric === TransactionStatus.PENDING || numeric === TransactionStatus.COMPLETED || numeric === TransactionStatus.FAILED) {
    return numeric;
  }

  const text = toStringValue(value)?.toLowerCase();
  if (text?.includes('success') || text?.includes('complete') || text?.includes('paid')) return TransactionStatus.COMPLETED;
  if (text?.includes('fail') || text?.includes('cancel') || text?.includes('reject')) return TransactionStatus.FAILED;
  if (text?.includes('pending')) return TransactionStatus.PENDING;

  if (item) {
    const isCompleted = item.isCompleted ?? item.IsCompleted ?? item.completed ?? item.Completed;
    const isFailed = item.isFailed ?? item.IsFailed ?? item.failed ?? item.Failed;

    if (typeof isCompleted === 'boolean' && isCompleted) {
      return TransactionStatus.COMPLETED;
    }

    if (typeof isFailed === 'boolean' && isFailed) {
      return TransactionStatus.FAILED;
    }

    const completionDate = [
      item.completedAt,
      item.CompletedAt,
      item.paidAt,
      item.PaidAt,
      item.releasedAt,
      item.ReleasedAt,
      item.processedAt,
      item.ProcessedAt,
    ].find(value => toStringValue(value));

    if (completionDate) {
      return TransactionStatus.COMPLETED;
    }
  }

  // BE ledger only records transactions after the balance has moved,
  // so entries without an explicit status are already completed.
  return TransactionStatus.COMPLETED;
};

const buildFallbackTransactionId = (
  item: Record<string, unknown>,
  amount: number,
  index: number
): string => [
  item.createdAt ?? item.paidAt ?? item.paymentDate ?? item.transactionDate ?? item.date ?? 'unknown-date',
  item.amount ?? item.totalAmount ?? item.paymentAmount ?? item.value ?? amount,
  item.type ?? item.paymentType ?? item.transactionType ?? 'unknown-type',
  item.status ?? item.paymentStatus ?? 'unknown-status',
  item.walletId ?? item.orderId ?? item.referenceId ?? item.milestoneId ?? item.paymentMethod ?? 'unknown-reference',
  index,
].map(value => String(value).trim() || 'unknown').join('-');

const mapHistoryItemToTransaction = (item: unknown, index: number): Transaction | null => {
  if (!isRecord(item)) return null;

  const amount = [
    item.amount,
    item.totalAmount,
    item.paymentAmount,
    item.value,
  ].map(toNumber).find((value): value is number => value !== null);

  if (amount === undefined) return null;

  const description = toStringValue(item.description) ?? toStringValue(item.note) ?? toStringValue(item.content) ?? toStringValue(item.paymentMethod);

  return {
    id: toStringValue(item.id) ?? toStringValue(item.paymentId) ?? toStringValue(item.transactionId) ?? buildFallbackTransactionId(item, amount, index),
    walletId: toStringValue(item.walletId) ?? '',
    amount,
    type: normalizeTransactionType(
      item.type ??
      item.Type ??
      item.paymentType ??
      item.PaymentType ??
      item.transactionType ??
      item.TransactionType ??
      item.walletTransactionType ??
      item.WalletTransactionType ??
      description,
    ),
    status: normalizeTransactionStatus(
      item.status ??
      item.Status ??
      item.paymentStatus ??
      item.PaymentStatus ??
      item.transactionStatus ??
      item.TransactionStatus ??
      item.walletTransactionStatus ??
      item.WalletTransactionStatus ??
      item.state ??
      item.State,
      item,
    ),
    description,
    referenceId: toStringValue(item.referenceId) ?? toStringValue(item.orderId) ?? toStringValue(item.milestoneId),
    createdAt: toStringValue(item.createdAt) ?? toStringValue(item.paidAt) ?? toStringValue(item.paymentDate) ?? toStringValue(item.transactionDate) ?? toStringValue(item.date) ?? new Date().toISOString(),
  };
};

export const walletService = {
  getWallet: async (): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.ME);
    return normalizeBaseResponse<Wallet>(response);
  },

  deposit: async (data: DepositRequest): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.post(API_ENDPOINTS.WALLET.DEPOSIT, data);
    return normalizeBaseResponse<Wallet>(response);
  },

  depositDemo: async (data: DepositDemoRequest): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.post(API_ENDPOINTS.WALLET.DEPOSIT_DEMO, data);
    return normalizeBaseResponse<Wallet>(response);
  },

  createVnPayDeposit: async (data: VnPayDepositRequest): Promise<BaseResponse<unknown>> => {
    const response = await apiClient.post(API_ENDPOINTS.WALLET.VNPAY_DEPOSIT, data);
    return normalizeBaseResponse<unknown>(response);
  },

  withdraw: async (data: WithdrawRequest): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.post(API_ENDPOINTS.WALLET.WITHDRAW, data);
    return normalizeBaseResponse<Wallet>(response);
  },

  getTransactions: async (params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Transaction>> => {
    return walletService.getPaymentHistory(params);
  },

  getPaymentHistory: async (params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.PAYMENT_HISTORY, {
      params: { ...DEFAULT_HISTORY_PARAMS, ...params },
    });
    const normalized = normalizePaginatedResponse<unknown>(response);
    return {
      ...normalized,
      data: (normalized.data ?? []).map((item, index) => mapHistoryItemToTransaction(item, index)).filter((item): item is Transaction => item !== null),
    };
  },
};
