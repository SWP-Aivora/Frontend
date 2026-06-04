import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { LoginFormValues, AuthResponse, RegisterFormValues } from './types';
import type { BaseResponse } from '@/shared/types/api';

export const authService = {
  login: async (data: LoginFormValues): Promise<BaseResponse<AuthResponse>> => {
    const response = await apiClient.post<BaseResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },
  register: async (data: RegisterFormValues): Promise<BaseResponse<void>> => {
    // Backend expects specific fields, confirmPassword is only for client-side validation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    const response = await apiClient.post<BaseResponse<void>>(API_ENDPOINTS.AUTH.REGISTER, registerData);
    return response.data;
  },
  logout: async (): Promise<void> => {
    // Optional: Call logout endpoint if exists
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
