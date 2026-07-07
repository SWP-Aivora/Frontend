import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services';

export const useMilestoneSteps = (milestoneId: string) => {
  return useQuery({
    queryKey: ['milestone', milestoneId, 'steps'],
    queryFn: () => projectService.getMilestoneSteps(milestoneId),
    enabled: !!milestoneId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
};
