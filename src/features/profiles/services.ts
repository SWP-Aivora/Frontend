import apiClient from '@/lib/axios';
import type { UserProfile, NotificationSettings } from './types';
import type { ProfileFormValues, SecurityFormValues } from './schema';
import type { BaseResponse } from '@/shared/types/api';

export const profileService = {
  getProfile: async (): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.get<BaseResponse<UserProfile>>('/settings/me');
    return response.data;
  },

  updateProfile: async (data: ProfileFormValues): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.put<BaseResponse<UserProfile>>('/settings/me', data);
    return response.data;
  },

  updatePassword: async (data: SecurityFormValues): Promise<BaseResponse<void>> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmNewPassword, ...passwordData } = data;
    const response = await apiClient.post<BaseResponse<void>>('/settings/me/change-password', passwordData);
    return response.data;
  },

  getNotificationSettings: async (): Promise<BaseResponse<NotificationSettings>> => {
    const response = await apiClient.get<BaseResponse<NotificationSettings>>('/notifications/settings');
    return response.data;
  },

  updateNotificationSettings: async (data: Partial<NotificationSettings>): Promise<BaseResponse<NotificationSettings>> => {
    const response = await apiClient.put<BaseResponse<NotificationSettings>>('/notifications/settings', data);
    return response.data;
  },

  deleteAccount: async (): Promise<BaseResponse<void>> => {
    const response = await apiClient.delete<BaseResponse<void>>('/settings/me');
    return response.data;
  },
};
