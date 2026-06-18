import apiClient from '@/lib/axios';
import axios from 'axios';
import type { UserProfile, ClientProfile, ExpertProfile, ExpertProfileResponse } from './types';
import type { UserUpdateFormValues, ClientProfileFormValues, ExpertProfileFormValues } from './schema';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { normalizeBaseResponse, normalizePaginatedResponse } from '@/lib/api-utils';
import { API_ENDPOINTS } from '@/shared/constants';

export const profileService = {
  // Base User endpoints (using AUTH.ME as it corresponds to /api/v1/auth/me in backend)
  getUserProfile: async (): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return normalizeBaseResponse<UserProfile>(response);
  },

  updateUser: async (data: UserUpdateFormValues): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.put(API_ENDPOINTS.USERS.ME, data);
    return normalizeBaseResponse<UserProfile>(response);
  },

  // Client Profile endpoints
  getClientProfile: async (): Promise<BaseResponse<ClientProfile>> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILES.CLIENT);
      return normalizeBaseResponse<ClientProfile>(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: true,
          message: 'Client profile has not been created yet.',
          data: null,
          statusCode: 404,
        };
      }

      throw error;
    }
  },

  updateClientProfile: async (data: ClientProfileFormValues): Promise<BaseResponse<ClientProfile>> => {
    const response = await apiClient.put(API_ENDPOINTS.PROFILES.CLIENT, data);
    return normalizeBaseResponse<ClientProfile>(response);
  },

  // Expert Profile endpoints
  getExpertProfile: async (): Promise<BaseResponse<ExpertProfile>> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILES.EXPERT);
      return normalizeBaseResponse<ExpertProfile>(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: true,
          message: 'Expert profile has not been created yet.',
          data: null,
          statusCode: 404,
        };
      }

      throw error;
    }
  },

  updateExpertProfile: async (data: ExpertProfileFormValues): Promise<BaseResponse<ExpertProfile>> => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILES.EXPERT, data);
      return normalizeBaseResponse<ExpertProfile>(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: false,
          message: 'Expert profile update is not available yet.',
          data: null,
          statusCode: 404,
        };
      }

      throw error;
    }
  },

  getExpertProfileById: async (expertId: string): Promise<BaseResponse<ExpertProfile>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILES.EXPERT_BY_ID(expertId));
    return normalizeBaseResponse<ExpertProfile>(response);
  },

  /**
   * Fetch featured experts for the landing page.
   * Uses robust pagination normalization to handle various response shapes.
   */
  getFeaturedExperts: async (count: number = 4): Promise<PaginatedResponse<ExpertProfileResponse>> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILES.FEATURED_EXPERTS, { params: { count } });
      return normalizePaginatedResponse<ExpertProfileResponse>(response);
    } catch (error) {
      console.error('[profileService] getFeaturedExperts failed:', error);
      // Fallback for list endpoints
      return {
        success: false,
        message: 'Failed to fetch featured experts',
        data: [],
        statusCode: 500,
        metadata: { pageIndex: 1, pageSize: count, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false }
      };
    }
  },
};
