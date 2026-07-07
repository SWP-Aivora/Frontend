import { useMutation } from '@tanstack/react-query';
import { projectService } from '../services';
import { getMutationErrorMessage } from '../utils';
import { toast } from 'sonner';

export const useSuggestMilestoneSteps = (milestoneId: string) => {
  return useMutation({
    mutationFn: () => projectService.suggestMilestoneSteps(milestoneId),
    onError: (error: unknown) => {
      toast.error(getMutationErrorMessage(error, 'Failed to generate step suggestions.'));
    },
  });
};
