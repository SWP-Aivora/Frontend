import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { LoginFormValues, AuthResponse, RegisterFormValues, User } from './types';
import type { BaseResponse } from '@/shared/types/api';
import { Role } from '@/shared/types/enums';

interface LoginBackendResponse {
  role?: string; Role?: string;
  userId?: string; UserId?: string; id?: string;
  email?: string; Email?: string;
  fullName?: string; FullName?: string;
  accessToken?: string; AccessToken?: string;
  refreshToken?: string; RefreshToken?: string;
}

interface MeBackendResponse {
  role?: string; Role?: string;
  userId?: string; UserId?: string; id?: string; Id?: string;
  email?: string; Email?: string;
  fullName?: string; FullName?: string;
}

export const authService = {
  login: async (data: LoginFormValues): Promise<BaseResponse<AuthResponse>> => {
    const response = await apiClient.post<BaseResponse<LoginBackendResponse>>(API_ENDPOINTS.AUTH.LOGIN, data);
    const axiosData = response.data;
    
    // Normalize backend IdentityResponse to frontend AuthResponse
    const backendData = axiosData.data;
    if (axiosData.success && backendData) {
      const roleStr = (backendData.role || backendData.Role || '').toUpperCase();
      const mappedRole = Object.values(Role).find(r => r === roleStr) || Role.CLIENT;

      const user: User = {
        id: backendData.userId || backendData.UserId || backendData.id || '',
        email: backendData.email || backendData.Email || '',
        fullName: backendData.fullName || backendData.FullName || (backendData.email || backendData.Email || '').split('@')[0] || 'User',
        role: mappedRole as Role,
      };

      return {
        ...axiosData,
        data: {
          ...user,
          accessToken: backendData.accessToken || backendData.AccessToken || '',
          refreshToken: backendData.refreshToken || backendData.RefreshToken || '',
        }
      };
    }

    return axiosData as unknown as BaseResponse<AuthResponse>;
  },
  
  register: async (data: RegisterFormValues): Promise<BaseResponse<void>> => {
    // Backend expects specific fields, confirmPassword is only for client-side validation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    const response = await apiClient.post<BaseResponse<void>>(API_ENDPOINTS.AUTH.REGISTER, registerData);
    return response.data;
  },

  getMe: async (): Promise<BaseResponse<User>> => {
    const response = await apiClient.get<BaseResponse<MeBackendResponse>>(API_ENDPOINTS.AUTH.ME);
    const axiosData = response.data;
    const backendData = axiosData.data;

    if (axiosData.success && backendData) {
      const roleStr = (backendData.role || backendData.Role || '').toUpperCase();
      const mappedRole = Object.values(Role).find(r => r === roleStr) || Role.CLIENT;

      const user: User = {
        id: backendData.id || backendData.Id || backendData.userId || backendData.UserId || '',
        email: backendData.email || backendData.Email || '',
        fullName: backendData.fullName || backendData.FullName || (backendData.email || backendData.Email || '').split('@')[0] || 'User',
        role: mappedRole as Role,
      };

      return {
        ...axiosData,
        data: user
      };
    }

    return axiosData as unknown as BaseResponse<User>;
  },

  logout: async (): Promise<void> => {
    // Optional: Call logout endpoint if exists
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
