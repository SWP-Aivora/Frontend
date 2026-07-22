import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services';

export const adminUsersQueryKeys = {
  all: ['admin', 'users'] as const,
  list: (params?: Record<string, unknown>) => ['admin', 'users', params] as const,
  detail: (id: string) => ['admin', 'users', 'detail', id] as const,
};

export const useAdminUsers = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: adminUsersQueryKeys.list(params),
    queryFn: () => adminService.getUsers(params),
    select: (response) => response.data,
  });
};

export const useAdminUser = (id: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: id ? adminUsersQueryKeys.detail(id) : [...adminUsersQueryKeys.all, 'detail', 'missing'],
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error('Missing user ID'));
      }
      return adminService.getUserById(id);
    },
    enabled: Boolean(id) && enabled,
    select: (response) => response.data,
    retry: false,
  });
};
