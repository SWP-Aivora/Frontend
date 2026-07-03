import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatService } from '@/features/chat/services';
import { useAuthStore } from '@/features/auth/store';

/**
 * Global real-time synchronization hook.
 * Maintains SignalR connection and listens for backend events
 * to invalidate relevant query caches for both Client and Expert roles.
 *
 * Should be called once in DashboardLayout to cover all authenticated pages.
 */
export const useGlobalRealtimeSync = () => {
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated } = useAuthStore();

  // Maintain SignalR connection when authenticated
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    chatService.connect(accessToken).catch((error: unknown) => {
      console.warn('[RealtimeSync] Failed to connect to SignalR hub:', error);
    });
  }, [isAuthenticated, accessToken]);

  // Listen for job/project status updates and invalidate all related caches
  useEffect(() => {
    const unsubscribeJobStatus = chatService.onJobStatusUpdate((data) => {
      console.log('[RealtimeSync] Job status updated:', data);

      // Invalidate all role-relevant query caches
      void queryClient.invalidateQueries({ queryKey: ['clientJobs'] });
      void queryClient.invalidateQueries({ queryKey: ['myProposals'] });
      void queryClient.invalidateQueries({ queryKey: ['expertProjects'] });
      void queryClient.invalidateQueries({ queryKey: ['clientProjects'] });
      void queryClient.invalidateQueries({ queryKey: ['wallet'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });

      const statusMap: Record<string, string> = {
        'draft': 'Draft',
        'open': 'Open',
        'in-progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
      };
      const statusText = statusMap[data.status] || data.status;
      toast.info(`Job "${data.title ?? data.jobId}" status updated to: ${statusText}`);
    });

    return () => {
      unsubscribeJobStatus();
    };
  }, [queryClient]);
};
