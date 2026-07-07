import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import { getMutationErrorMessage } from '../utils';
import type { MilestoneStepStatus } from '@/shared/types/enums';
import { toast } from 'sonner';

export const useUpdateStepStatus = (milestoneId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId, status }: { stepId: string; status: MilestoneStepStatus }) =>
      projectService.updateStepStatus(stepId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['milestone', milestoneId, 'steps'] });
    },
    onError: (error: unknown) => {
      toast.error(getMutationErrorMessage(error, 'Failed to update step status.'));
    },
  });
};
