import apiClient from '@/lib/axios';
import type { Wallet, Transaction, DepositRequest } from './types';
import type { BaseResponse } from '@/shared/types/api';

export const walletService = {
  getWallet: async (): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.get<BaseResponse<Wallet>>('/wallet/me');
    return response.data;
  },

  depositDemo: async (data: DepositRequest): Promise<BaseResponse<Wallet>> => {
    const response = await apiClient.post<BaseResponse<Wallet>>('/wallet/deposit-demo', data);
    return response.data;
  },

  getPaymentHistory: async (params?: Record<string, string | number | boolean>): Promise<BaseResponse<Transaction[]>> => {
    const response = await apiClient.get<BaseResponse<Transaction[]>>('/payments/history', { params });
    return response.data;
  },
};
