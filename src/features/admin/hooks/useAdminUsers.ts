import { skipToken, useQuery } from '@tanstack/react-query';
import { adminService } from '../services';

export const adminUsersQueryKeys = {
  all: ['admin', 'users'] as const,
  list: (params?: Record<string, unknown>) => ['admin', 'users', params] as const,
  detail: (id: string | undefined) => ['admin', 'users', 'detail', id] as const,
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
    queryKey: adminUsersQueryKeys.detail(id),
    queryFn: id && enabled ? () => adminService.getUserById(id) : skipToken,
    select: (response) => response.data,
    retry: false,
  });
};
