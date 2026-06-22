import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services';
import type { AdminProjectsQuery } from '../types';

export const useAdminProjects = (params: AdminProjectsQuery) => {
  return useQuery({
    queryKey: ['admin', 'projects', params],
    queryFn: () => adminService.getProjects(params),
  });
};
