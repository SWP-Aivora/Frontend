import apiClient from '@/lib/axios';
import type { Wallet, Transaction, DepositRequest } from './types';
import type { BaseResponse } from '@/shared/types/api';
import { API_ENDPOINTS } from '@/shared/constants';

export const walletService = {
  getWallet: async (): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.get<BaseResponse<Wallet>>(API_ENDPOINTS.WALLET.ME);
    return response.data;
  },

  depositDemo: async (data: DepositRequest): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.post<BaseResponse<Wallet>>(API_ENDPOINTS.WALLET.DEPOSIT_DEMO, data);
    return response.data;
  },

  getPaymentHistory: async (params?: Record<string, string | number | boolean>): Promise<BaseResponse<Transaction[]>> => {
    const response = await apiClient.get<BaseResponse<Transaction[]>>(API_ENDPOINTS.WALLET.HISTORY, { params });
    return response.data;
  },
};
