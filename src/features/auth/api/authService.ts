import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { LoginFormValues, AuthResponse } from '../types';
import type { BaseResponse } from '@/shared/types/api';

export const authService = {
  login: async (data: LoginFormValues): Promise<BaseResponse<AuthResponse>> => {
    const response = await apiClient.post<BaseResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },
  logout: async (): Promise<void> => {
    // Optional: Call logout endpoint if exists
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
