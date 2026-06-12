import apiClient from '@/lib/axios';
import type { UserProfile, ClientProfile, ExpertProfile } from './types';
import type { UserUpdateFormValues, ClientProfileFormValues, ExpertProfileFormValues } from './schema';
import type { BaseResponse } from '@/shared/types/api';
import { normalizeBaseResponse } from '@/lib/api-utils';
import { API_ENDPOINTS } from '@/shared/constants';

export const profileService = {
  // Base User endpoints (using AUTH.ME as it corresponds to /api/v1/auth/me in backend)
  getUserProfile: async (): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return normalizeBaseResponse<UserProfile>(response);
  },

  updateUser: async (data: UserUpdateFormValues): Promise<BaseResponse<UserProfile>> => {
    // Note: Backend might use PUT /api/v1/auth/me or similar if update is allowed there
    // For now keeping it consistent with the GET endpoint but checking if a specific update endpoint exists
    const response = await apiClient.put(API_ENDPOINTS.AUTH.ME, data);
    return normalizeBaseResponse<UserProfile>(response);
  },

  // Client Profile endpoints
  getClientProfile: async (): Promise<BaseResponse<ClientProfile>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILES.CLIENT);
    return normalizeBaseResponse<ClientProfile>(response);
  },

  updateClientProfile: async (data: ClientProfileFormValues): Promise<BaseResponse<ClientProfile>> => {
    const response = await apiClient.put(API_ENDPOINTS.PROFILES.CLIENT, data);
    return normalizeBaseResponse<ClientProfile>(response);
  },

  // Expert Profile endpoints
  getExpertProfile: async (): Promise<BaseResponse<ExpertProfile>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILES.EXPERT);
    return normalizeBaseResponse<ExpertProfile>(response);
  },

  updateExpertProfile: async (data: ExpertProfileFormValues): Promise<BaseResponse<ExpertProfile>> => {
    const response = await apiClient.put(API_ENDPOINTS.PROFILES.EXPERT, data);
    return normalizeBaseResponse<ExpertProfile>(response);
  },

  getExpertProfileById: async (expertId: string): Promise<BaseResponse<ExpertProfile>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILES.EXPERT_BY_ID(expertId));
    return normalizeBaseResponse<ExpertProfile>(response);
  },
};
