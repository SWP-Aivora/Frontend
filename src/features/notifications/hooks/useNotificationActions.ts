import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationService } from '../services';
import { NOTIFICATION_KEYS } from './useNotifications';
import { NotificationStatus, type Notification } from '../types';
import type { PaginatedResponse, BaseResponse } from '@/shared/types/api';

export const useNotificationActions = () => {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_KEYS.all });

      // Snapshot every notification query because list keys include their params.
      const previousNotifications = queryClient.getQueriesData<PaginatedResponse<Notification>>({ queryKey: NOTIFICATION_KEYS.lists });
      const previousUnreadCount = queryClient.getQueryData<BaseResponse<number>>(NOTIFICATION_KEYS.unreadCount);

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: NOTIFICATION_KEYS.lists }, (old: PaginatedResponse<Notification> | undefined) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((n) => n.id === id ? { ...n, isRead: true, status: NotificationStatus.READ } : n)
        };
      });

      // Also update unread count optimistically if possible
      queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount, (old: BaseResponse<number> | undefined) => {
        if (!old || typeof old.data !== 'number') return old;
        return { ...old, data: Math.max(0, old.data - 1) };
      });

      return { previousNotifications, previousUnreadCount };
    },
    onError: (_err, _id, context) => {
      context?.previousNotifications.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount, context.previousUnreadCount);
      }
      toast.error('Failed to mark notification as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_KEYS.all });
      const previousNotifications = queryClient.getQueriesData<PaginatedResponse<Notification>>({ queryKey: NOTIFICATION_KEYS.lists });
      const previousUnreadCount = queryClient.getQueryData<BaseResponse<number>>(NOTIFICATION_KEYS.unreadCount);

      queryClient.setQueriesData({ queryKey: NOTIFICATION_KEYS.lists }, (old: PaginatedResponse<Notification> | undefined) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((n) => ({ ...n, isRead: true, status: NotificationStatus.READ }))
        };
      });

      queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount, (old: BaseResponse<number> | undefined) => {
        if (!old) return old;
        return { ...old, data: 0 };
      });

      return { previousNotifications, previousUnreadCount };
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
    },
    onError: (_err, _variables, context) => {
      context?.previousNotifications.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount, context.previousUnreadCount);
      }
      toast.error('Failed to mark all notifications as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
