import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import { getMutationErrorMessage } from '../utils';
import { toast } from 'sonner';

export const useDeleteMilestoneStep = (milestoneId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stepId: string) => projectService.deleteMilestoneStep(stepId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['milestone', milestoneId, 'steps'] });
      toast.success('Step deleted successfully.');
    },
    onError: (error: unknown) => {
      toast.error(getMutationErrorMessage(error, 'Failed to delete step.'));
    },
  });
};
