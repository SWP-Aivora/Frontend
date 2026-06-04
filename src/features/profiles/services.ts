import apiClient from '@/lib/axios';
import type { UserProfile, ClientProfile, ExpertProfile } from './types';
import type { UserUpdateFormValues, ClientProfileFormValues, ExpertProfileFormValues } from './schema';
import type { BaseResponse } from '@/shared/types/api';

export const profileService = {
  // Base User endpoints
  getUserProfile: async (): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.get<BaseResponse<UserProfile>>('/users/me');
    return response.data;
  },

  updateUser: async (data: UserUpdateFormValues): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.put<BaseResponse<UserProfile>>('/users/me', data);
    return response.data;
  },

  // Client Profile endpoints
  getClientProfile: async (): Promise<BaseResponse<ClientProfile>> => {
    const response = await apiClient.get<BaseResponse<ClientProfile>>('/profiles/client');
    return response.data;
  },

  updateClientProfile: async (data: ClientProfileFormValues): Promise<BaseResponse<ClientProfile>> => {
    const response = await apiClient.put<BaseResponse<ClientProfile>>('/profiles/client', data);
    return response.data;
  },

  // Expert Profile endpoints
  getExpertProfile: async (): Promise<BaseResponse<ExpertProfile>> => {
    const response = await apiClient.get<BaseResponse<ExpertProfile>>('/profiles/expert');
    return response.data;
  },

  updateExpertProfile: async (data: ExpertProfileFormValues): Promise<BaseResponse<ExpertProfile>> => {
    const response = await apiClient.put<BaseResponse<ExpertProfile>>('/profiles/expert', data);
    return response.data;
  },
};
