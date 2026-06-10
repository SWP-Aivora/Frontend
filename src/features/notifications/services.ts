import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import type { Notification, NotificationsQuery, UnreadCountResponse } from './types';

export const notificationService = {
  getNotifications: async (params?: NotificationsQuery): Promise<PaginatedResponse<Notification>> => {
    // Only pick params supported by backend, others might need UI-side filtering if backend drops them
    const validParams: Record<string, string | number> = {};
    if (params?.PageSize) validParams.PageSize = params.PageSize;
    if (params?.PageIndex) validParams.PageIndex = params.PageIndex;
    if (params?.SearchTerm) validParams.SearchTerm = params.SearchTerm;

    const response = await apiClient.get<PaginatedResponse<Notification>>(API_ENDPOINTS.NOTIFICATIONS.BASE, { params: validParams });
    return response.data;
  },

  getUnreadCount: async (): Promise<BaseResponse<number | UnreadCountResponse>> => {
    const response = await apiClient.get<BaseResponse<number | UnreadCountResponse>>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return response.data;
  },

  markAsRead: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    return response.data;
  },

  markAllAsRead: async (): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return response.data;
  }
};
