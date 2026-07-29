import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/features/chat';
import { useAuthStore } from '@/features/auth/store';

/**
 * Subscribes to real-time MilestoneUpdated events for a project (Kanban +
 * Timeline). Mirrors useRealTimeMessages in features/chat/hooks/useMessages.ts.
 */
export const useProjectRealtime = (projectId?: string) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!projectId || !isAuthenticated) return;

    let isSubscribed = true;

    chatService.connect()
      .then(() => chatService.joinProject(projectId))
      .catch((error) => {
        if (isSubscribed) {
          console.warn('[projects] Unable to connect to real-time milestone updates', error);
        }
      });

    const unsubscribeMilestone = chatService.onMilestoneUpdate((data) => {
      if (data.projectId !== projectId) return;

      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'milestones'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'active-disputes'] });
    });

    const unsubscribeDispute = chatService.onDisputeUpdate((data) => {
      if (data.projectId !== projectId) return;

      queryClient.invalidateQueries({ queryKey: ['project-disputes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dispute', data.disputeId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'project-disputes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'milestones'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'active-disputes'] });
    });

    return () => {
      isSubscribed = false;
      unsubscribeMilestone();
      unsubscribeDispute();
      chatService.leaveProject(projectId);
    };
  }, [projectId, queryClient, isAuthenticated]);
};
