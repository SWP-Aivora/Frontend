import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatService, configureChatAccessTokenProvider } from '@/features/chat/services';
import { useAuthStore } from '@/features/auth/store';

const getRecord = (value: unknown): Record<string, unknown> | null => (
  value && typeof value === 'object' ? value as Record<string, unknown> : null
);

const getProjectData = (value: unknown): Record<string, unknown> | null => {
  const record = getRecord(value);
  if (!record) return null;

  return getRecord(record.data) ?? record;
};

/**
 * Global real-time synchronization hook.
 * Maintains SignalR connection and listens for backend events
 * to invalidate relevant query caches for both Client and Expert roles.
 *
 * Should be called once in DashboardLayout to cover all authenticated pages.
 */
export const useGlobalRealtimeSync = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, accessToken } = useAuthStore();
  const hasAccessToken = typeof accessToken === 'string' && accessToken.trim().length > 0;

  configureChatAccessTokenProvider(() => useAuthStore.getState().accessToken);

  // Maintain SignalR connection when authenticated
  useEffect(() => {
    if (!isAuthenticated || !hasAccessToken) {
      void chatService.resetChatConnection();
      return;
    }

    let isSubscribed = true;

    chatService.connect().catch((error: unknown) => {
      if (isSubscribed) {
        console.warn('[RealtimeSync] Failed to connect to SignalR hub:', error);
      }
    });

    return () => {
      isSubscribed = false;
      void chatService.resetChatConnection();
    };
  }, [isAuthenticated, hasAccessToken]);

  // Listen for job/project status updates and invalidate all related caches
  useEffect(() => {
    const unsubscribeJobStatus = chatService.onJobStatusUpdate((data) => {
      console.log('[RealtimeSync] Job status updated:', data);

      const matchingProjectIds = queryClient
        .getQueryCache()
        .findAll({ queryKey: ['project'] })
        .flatMap((query) => {
          const queryKey = query.queryKey;
          if (!Array.isArray(queryKey) || queryKey.length !== 2 || typeof queryKey[1] !== 'string') {
            return [];
          }

          const projectData = getProjectData(query.state.data);
          return projectData?.jobId === data.jobId ? [queryKey[1]] : [];
        });

      // Invalidate role-relevant lists plus exact active workspace caches when
      // the realtime payload can be matched to cached project detail data.
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['clientJobs'] });
      void queryClient.invalidateQueries({ queryKey: ['myProposals'] });
      void queryClient.invalidateQueries({ queryKey: ['expertProjects'] });
      void queryClient.invalidateQueries({ queryKey: ['clientProjects'] });
      matchingProjectIds.forEach((projectId) => {
        void queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        void queryClient.invalidateQueries({ queryKey: ['project', projectId, 'milestones'] });
        void queryClient.invalidateQueries({ queryKey: ['project', projectId, 'active-disputes'] });
      });
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

    const unsubscribeNewJob = chatService.onNewJobPublished((data) => {
      console.log('[RealtimeSync] New job published:', data);
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.info(`New job published: ${data.title ?? data.jobId}`);
    });

    return () => {
      unsubscribeJobStatus();
      unsubscribeNewJob();
    };
  }, [queryClient]);
};
