import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationService } from '../services';
import { NOTIFICATION_KEYS } from './useNotifications';

export const useNotificationActions = () => {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_KEYS.all });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData(NOTIFICATION_KEYS.all);

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: NOTIFICATION_KEYS.all }, (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((n: any) => n.id === id ? { ...n, isRead: true, status: 'READ' } : n)
        };
      });

      // Also update unread count optimistically if possible
      queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount, (old: any) => {
        if (!old || typeof old.data !== 'number') return old;
        return { ...old, data: Math.max(0, old.data - 1) };
      });

      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(NOTIFICATION_KEYS.all, context.previousNotifications);
      }
      toast.error('Failed to mark notification as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_KEYS.all });
      const previousNotifications = queryClient.getQueryData(NOTIFICATION_KEYS.all);

      queryClient.setQueriesData({ queryKey: NOTIFICATION_KEYS.all }, (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((n: any) => ({ ...n, isRead: true, status: 'READ' }))
        };
      });

      queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount, (old: any) => {
        if (!old) return old;
        return { ...old, data: 0 };
      });

      return { previousNotifications };
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(NOTIFICATION_KEYS.all, context.previousNotifications);
      }
      toast.error('Failed to mark all notifications as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};

