import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services';

export const useAdminJobPostDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['admin', 'job-posts', id],
    queryFn: () => adminService.getJobPostDetail(id!),
    enabled: Boolean(id),
    select: (response) => response.data,
  });
};

