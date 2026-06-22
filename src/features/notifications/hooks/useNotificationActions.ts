import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationService } from '../services';
import { NOTIFICATION_KEYS } from './useNotifications';
import { NotificationStatus, type Notification } from '../types';
import type { PaginatedResponse, BaseResponse } from '@/shared/types/api';

const getValidNotificationId = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
};

export const useNotificationActions = () => {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => {
      const notificationId = getValidNotificationId(id);

      if (!notificationId) {
        throw new Error('Notification is missing a valid id');
      }

      return notificationService.markAsRead(notificationId);
    },
    onMutate: async (id) => {
      const notificationId = getValidNotificationId(id);

      if (!notificationId) {
        toast.error('Notification is missing a valid id');
        return undefined;
      }

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
          data: old.data.map((notification) => (
            notification.id === notificationId
              ? { ...notification, isRead: true, status: NotificationStatus.READ }
              : notification
          ))
        };
      });

      // Also update unread count optimistically if possible
      queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount, (old: BaseResponse<number> | undefined) => {
        if (!old || typeof old.data !== 'number') return old;
        return { ...old, data: Math.max(0, old.data - 1) };
      });

      return { previousNotifications, previousUnreadCount };
    },
    onError: (error, _id, context) => {
      context?.previousNotifications.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount, context.previousUnreadCount);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to mark notification as read');
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

  const markAsRead = (id: unknown): void => {
    const notificationId = getValidNotificationId(id);

    if (!notificationId) {
      toast.error('Notification is missing a valid id');
      return;
    }

    markAsReadMutation.mutate(notificationId);
  };

  return {
    markAsRead,
    isMarkingAsRead: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
