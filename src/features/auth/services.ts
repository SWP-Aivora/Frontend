import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { LoginFormValues, AuthResponse, RegisterFormValues, User } from './types';
import type { BaseResponse } from '@/shared/types/api';
import { Role } from '@/shared/types/enums';
import { normalizeBaseResponse } from '@/lib/api-utils';

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

interface AxiosErrorShape {
  response?: {
    data?: { message?: string };
    status?: number;
  };
}

function isAxiosError(error: unknown): error is AxiosErrorShape {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export const authService = {
  login: async (data: LoginFormValues): Promise<BaseResponse<AuthResponse | null>> => {
    try {
      const response = await apiClient.post<BaseResponse<LoginBackendResponse | null>>(API_ENDPOINTS.AUTH.LOGIN, data);
      const normalized = normalizeBaseResponse<LoginBackendResponse | null>(response);
      
      if (!normalized.success) {
        return {
          success: false,
          message: normalized.message || 'Login failed',
          statusCode: normalized.statusCode || 400,
          data: null
        };
      }

      const backendData = normalized.data;
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
      const mappedRole = Object.values(Role).find(r => r === roleStr);

      if (!mappedRole) {
        console.error('[authService] Unknown or missing role from backend:', roleStr);
        return {
          success: false,
          message: 'Invalid user role returned from server',
          statusCode: 403,
          data: null
        };
      }

      const user: User = {
        id,
        email,
        fullName,
        role: mappedRole as Role,
      };

      return {
        ...normalized,
        data: {
          ...user,
          accessToken,
          refreshToken,
        }
      };
    } catch (error) {
      console.error('[authService] Login exception:', error);
      
      let message = 'A network error occurred during login';
      let statusCode = 500;
      
      if (isAxiosError(error)) {
        if (error.response?.data?.message) {
          message = error.response.data.message;
        }
        if (error.response?.status) {
          statusCode = error.response.status;
        }
      }
      
      return {
        success: false,
        message,
        statusCode,
        data: null
      };
    }
  },
  
  register: async (data: RegisterFormValues): Promise<BaseResponse<void>> => {
    // Backend expects specific fields, confirmPassword and termsAccepted are only for client-side validation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, termsAccepted, ...registerData } = data;
    const response = await apiClient.post<BaseResponse<void>>(API_ENDPOINTS.AUTH.REGISTER, registerData);
    return normalizeBaseResponse<void>(response);
  },

  getMe: async (): Promise<BaseResponse<User | null>> => {
    const response = await apiClient.get<BaseResponse<MeBackendResponse>>(API_ENDPOINTS.AUTH.ME);
    const normalized = normalizeBaseResponse<MeBackendResponse>(response);

    if (!normalized.success) {
       return {
        success: false,
        message: normalized.message || 'Failed to fetch user data',
        statusCode: normalized.statusCode || 400,
        data: null
      };
    }

    const backendData = normalized.data;
    if (backendData) {
      const roleStr = (backendData.role || backendData.Role || '').toUpperCase();
      const mappedRole = Object.values(Role).find(r => r === roleStr);

      if (!mappedRole) {
        console.error('[authService] Unknown or missing role from backend during getMe:', roleStr);
        return {
          success: false,
          message: 'Invalid user role returned from server',
          statusCode: 403,
          data: null
        };
      }

      const user: User = {
        id: backendData.id || backendData.Id || backendData.userId || backendData.UserId || '',
        email: backendData.email || backendData.Email || '',
        fullName: backendData.fullName || backendData.FullName || (backendData.email || backendData.Email || '').split('@')[0] || 'User',
        role: mappedRole as Role,
      };

      return {
        ...normalized,
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
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT || '/api/v1/auth/logout');
    } catch (error) {
      console.error('[authService] Error calling backend logout endpoint:', error);
    }
  },
};
