import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services';

export const useProjects = (params?: Record<string, string | number | boolean>) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectService.getProjects(params),
  });
};
