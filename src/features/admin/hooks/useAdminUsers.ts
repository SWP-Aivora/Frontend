import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services';

export const useAdminUsers = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.getUsers(params),
    select: (response) => response.data,
  });
};
