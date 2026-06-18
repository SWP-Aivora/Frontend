import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services';

export const useAdminProjectDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['admin', 'projects', id],
    queryFn: () => adminService.getProjectDetail(id!),
    enabled: Boolean(id),
    select: (response) => response.data,
    retry: false,
  });
};
