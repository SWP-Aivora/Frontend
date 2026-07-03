import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services';

export const useProjectMilestones = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId, 'milestones'],
    queryFn: () => projectService.getMilestonesByProject(projectId),
    enabled: !!projectId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
};
