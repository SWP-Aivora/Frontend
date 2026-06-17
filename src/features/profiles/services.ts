import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { UserProfile, ClientProfile, ExpertProfile } from './types';
import type { UserUpdateFormValues, ClientProfileFormValues, ExpertProfileFormValues } from './schema';
import type { BaseResponse } from '@/shared/types/api';

export const profileService = {
  // Base User endpoints
  getUserProfile: async (): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.get<BaseResponse<UserProfile>>(API_ENDPOINTS.USERS.ME);
    return response.data;
  },

  updateUser: async (data: UserUpdateFormValues): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.put<BaseResponse<UserProfile>>(API_ENDPOINTS.USERS.ME, data);
    return response.data;
  },

  // Client Profile endpoints
  getClientProfile: async (): Promise<BaseResponse<ClientProfile>> => {
    const response = await apiClient.get<BaseResponse<ClientProfile>>(API_ENDPOINTS.PROFILES.CLIENT);
    return response.data;
  },

  updateClientProfile: async (data: ClientProfileFormValues): Promise<BaseResponse<ClientProfile>> => {
    const response = await apiClient.put<BaseResponse<ClientProfile>>(API_ENDPOINTS.PROFILES.CLIENT, data);
    return response.data;
  },

  // Expert Profile endpoints
  getExpertProfile: async (): Promise<BaseResponse<ExpertProfile>> => {
    const response = await apiClient.get<BaseResponse<ExpertProfile>>(API_ENDPOINTS.PROFILES.EXPERT);
    return response.data;
  },

  updateExpertProfile: async (data: ExpertProfileFormValues): Promise<BaseResponse<ExpertProfile>> => {
    const response = await apiClient.put<BaseResponse<ExpertProfile>>(API_ENDPOINTS.PROFILES.EXPERT, data);
    return response.data;
  },

  getExpertProfileById: async (expertId: string): Promise<BaseResponse<ExpertProfile>> => {
    const response = await apiClient.get<BaseResponse<ExpertProfile>>(API_ENDPOINTS.PROFILES.EXPERT_BY_ID(expertId));
    return response.data;
  },
};
