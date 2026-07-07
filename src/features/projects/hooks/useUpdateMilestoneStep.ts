import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import { getMutationErrorMessage } from '../utils';
import { toast } from 'sonner';

export const useUpdateMilestoneStep = (milestoneId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId, data }: {
      stepId: string;
      data: { title?: string; description?: string | null; dueDate?: string | null; orderIndex?: number };
    }) => projectService.updateMilestoneStep(stepId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['milestone', milestoneId, 'steps'] });
      toast.success('Step updated successfully.');
    },
    onError: (error: unknown) => {
      toast.error(getMutationErrorMessage(error, 'Failed to update step.'));
    },
  });
};
