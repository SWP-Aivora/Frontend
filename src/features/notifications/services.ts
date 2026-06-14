import type { AxiosResponse } from 'axios';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import type { Notification, NotificationsQuery } from './types';
import { NotificationStatus, NotificationPriority } from './types';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';

export const notificationService = {
  getNotifications: async (params?: NotificationsQuery): Promise<PaginatedResponse<Notification>> => {
    // Only pick params supported by backend
    const validParams: Record<string, string | number> = {};
    if (params?.PageSize) validParams.PageSize = params.PageSize;
    if (params?.PageIndex) validParams.PageIndex = params.PageIndex;
    if (params?.SearchTerm?.trim()) validParams.SearchTerm = params.SearchTerm.trim();

    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params: validParams });
    const paginated = normalizePaginatedResponse<Record<string, unknown>>(response as AxiosResponse);

    // Map Backend NotificationResponse to Frontend Notification
    const mappedItems = paginated.data.map((item: Record<string, unknown>) => ({
      id: item.id as string,
      type: (item.type as string) || 'GENERAL',
      title: item.title as string,
      message: item.message as string,
      projectName: undefined, // Backend doesn't provide this yet
      priority: NotificationPriority.NORMAL, // Default
      status: item.isRead ? NotificationStatus.READ : NotificationStatus.UNREAD,
      isRead: item.isRead as boolean,
      createdAt: item.createdAt as string,
      relatedEntityId: (item.linkUrl as string)?.split('/').pop(), // Heuristic extraction
    } as Notification));

    return {
      ...paginated,
      data: mappedItems
    };
  },

  getUnreadCount: async (): Promise<BaseResponse<number>> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    const normalized = normalizeBaseResponse<Record<string, unknown>>(response);
    
    // Backend might return raw number or wrapped object
    const countData = normalized.data;
    const count = typeof countData === 'number' 
      ? countData 
      : ((countData?.count as number) ?? (countData?.Count as number) ?? 0);

    return {
      ...normalized,
      data: count
    };
  },

  markAsRead: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    return normalizeBaseResponse<void>(response);
  },

  markAllAsRead: async (): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return normalizeBaseResponse<void>(response);
  }
};
