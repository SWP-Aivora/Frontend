import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services';
import type { NotificationsQuery } from '../types';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (params?: NotificationsQuery) => ['notifications', 'list', params] as const,
  unreadCount: ['notifications', 'unreadCount'] as const,
};

export const useNotifications = (params?: NotificationsQuery) => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => notificationService.getNotifications(params),
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000, // Refresh every minute
  });
};
