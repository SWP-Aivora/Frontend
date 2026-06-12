import apiClient from '@/lib/axios';
import type { Wallet, Transaction, DepositRequest } from './types';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { normalizeBaseResponse, normalizePaginatedResponse } from '@/lib/api-utils';

export const walletService = {
  getWallet: async (): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.ME);
    return normalizeBaseResponse<Wallet>(response);
  },

  depositDemo: async (data: DepositRequest): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.post(API_ENDPOINTS.WALLET.DEPOSIT_DEMO, data);
    return normalizeBaseResponse<Wallet>(response);
  },

  getPaymentHistory: async (params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.HISTORY, { params });
    return normalizePaginatedResponse<Transaction>(response);
  },
};
