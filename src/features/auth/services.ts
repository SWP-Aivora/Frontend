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
  login: async (data: LoginFormValues): Promise<BaseResponse<AuthResponse | null>> => {
    try {
      const response = await apiClient.post<BaseResponse<LoginBackendResponse>>(API_ENDPOINTS.AUTH.LOGIN, data);
      const axiosData = response.data;
      
      if (!axiosData.success) {
        return {
          success: false,
          message: axiosData.message || 'Login failed',
          statusCode: axiosData.statusCode || 400,
          data: null
        };
      }

      const backendData = axiosData.data;
      if (!backendData) {
        return { success: false, message: 'No data received from server', statusCode: 500, data: null };
      }

      // Handle both camelCase and PascalCase
      const id = backendData.userId || backendData.UserId || backendData.id;
      const email = backendData.email || backendData.Email;
      const accessToken = backendData.accessToken || backendData.AccessToken;
      const refreshToken = backendData.refreshToken || backendData.RefreshToken;
      const fullName = backendData.fullName || backendData.FullName || email?.split('@')[0] || 'User';
      const roleRaw = backendData.role || backendData.Role || '';

      // Strict Validation
      if (!id || !email || !accessToken || !refreshToken) {
        console.error('[authService] Invalid login response - missing required fields:', { id: !!id, email: !!email, accessToken: !!accessToken, refreshToken: !!refreshToken });
        return {
          success: false,
          message: 'Server returned an incomplete authentication response',
          statusCode: 500,
          data: null
        };
      }

      const roleStr = roleRaw.toUpperCase();
      const mappedRole = Object.values(Role).find(r => r === roleStr) || Role.CLIENT;

      const user: User = {
        id,
        email,
        fullName,
        role: mappedRole as Role,
      };

      return {
        ...axiosData,
        data: {
          ...user,
          accessToken,
          refreshToken,
        }
      };
    } catch (error) {
      console.error('[authService] Login exception:', error);
      return {
        success: false,
        message: 'A network error occurred during login',
        statusCode: 500,
        data: null
      };
    }
  },
  
  register: async (data: RegisterFormValues): Promise<BaseResponse<void>> => {
    // Backend expects specific fields, confirmPassword is only for client-side validation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    const response = await apiClient.post<BaseResponse<void>>(API_ENDPOINTS.AUTH.REGISTER, registerData);
    return response.data;
  },

  getMe: async (): Promise<BaseResponse<User | null>> => {
    const response = await apiClient.get<BaseResponse<MeBackendResponse>>(API_ENDPOINTS.AUTH.ME);
    const axiosData = response.data;

    if (!axiosData.success) {
       return {
        success: false,
        message: axiosData.message || 'Failed to fetch user data',
        statusCode: axiosData.statusCode || 400,
        data: null
      };
    }

    const backendData = axiosData.data;
    if (backendData) {
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

    return {
      success: false,
      message: 'Invalid response format from server',
      statusCode: 500,
      data: null
    };
  },

  logout: async (): Promise<void> => {
    /**
     * NOTE: Backend does not currently provide a logout endpoint in the API contract.
     * Tokens are stateless (JWT). Logout is handled by clearing the local auth store.
     */
  },
};

