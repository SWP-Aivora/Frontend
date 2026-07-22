// Hook mutation để tạo milestone mới trong project đã hired.
// Sử dụng useMutation của TanStack Query, invalidate cache khi thành công.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import { toast } from 'sonner';
import type { CreateMilestoneFormValues } from '../schema';
import { getDisputeGuardErrorMessage } from '../utils';

interface UseCreateMilestoneOptions {
  projectId: string;
  onSuccess?: () => void;
}

export const useCreateMilestone = ({ projectId, onSuccess }: UseCreateMilestoneOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMilestoneFormValues) =>
      projectService.createMilestone(projectId, {
        title: data.title,
        description: data.description || undefined,
        amount: data.amount,
        dueDate: data.dueDate || undefined,
        acceptanceCriteria: data.acceptanceCriteria || undefined,
      }),
    onSuccess: () => {
      // Refresh cả project (để cập nhật totalBudget, remainingBudget)
      // và milestone list trên Kanban board
      void queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['project', projectId, 'milestones'] });
      toast.success('Milestone created successfully!');
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = (() => {
        const disputeGuardMessage = getDisputeGuardErrorMessage(error);
        if (disputeGuardMessage) return disputeGuardMessage;

        if (typeof error !== 'object' || error === null) return 'Failed to create milestone.';
        const err = error as { response?: { data?: unknown; status?: number } };
        const data = err.response?.data;
        if (typeof data === 'string' && data.trim()) return data;
        if (data && typeof data === 'object') {
          const record = data as Record<string, unknown>;
          const msg = [record.message, record.detail, record.title]
            .find((v): v is string => typeof v === 'string' && v.trim() !== '');
          if (msg) return msg;
        }
        return error instanceof Error ? error.message : 'Failed to create milestone.';
      })();
      toast.error(message);
    },
  });
};
