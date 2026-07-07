import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import { getMutationErrorMessage } from '../utils';
import { toast } from 'sonner';

export const useCreateMilestoneStep = (milestoneId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; description?: string; dueDate?: string; orderIndex: number }) =>
      projectService.createMilestoneStep(milestoneId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['milestone', milestoneId, 'steps'] });
      toast.success('Step created successfully.');
    },
    onError: (error: unknown) => {
      toast.error(getMutationErrorMessage(error, 'Failed to create step.'));
    },
  });
};
