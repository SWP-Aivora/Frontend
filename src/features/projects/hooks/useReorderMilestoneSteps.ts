import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import { getMutationErrorMessage } from '../utils';
import { toast } from 'sonner';

export const useReorderMilestoneSteps = (milestoneId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stepIds: string[]) => projectService.reorderMilestoneSteps(milestoneId, stepIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['milestone', milestoneId, 'steps'] });
    },
    onError: (error: unknown) => {
      toast.error(getMutationErrorMessage(error, 'Failed to reorder steps.'));
    },
  });
};
