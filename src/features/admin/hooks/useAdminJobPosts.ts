import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services';
import type { AdminJobPostsQuery } from '../types';

export const useAdminJobPosts = (params: AdminJobPostsQuery) => {
  return useQuery({
    queryKey: ['admin', 'job-posts', params],
    queryFn: () => adminService.getJobPosts(params),
  });
};

