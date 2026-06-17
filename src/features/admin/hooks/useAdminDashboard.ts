import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services';
import { previewAdminService } from '../mocks/previewAdminService';
import type { AxiosError } from 'axios';

const isNetworkOrMissingError = (error: unknown) => {
  const axiosError = error as AxiosError;
  return axiosError.message === 'Network Error' ||
         axiosError.response?.status === 404 ||
         axiosError.response?.status === 405 ||
         axiosError.response?.status === 501;
};

interface UseAdminDashboardParams {
  projectPage?: number;
  projectLimit?: number;
}

export const useAdminDashboard = (params: UseAdminDashboardParams = {}) => {
  return useQuery({
    queryKey: ['admin', 'dashboard-summary', params],
    queryFn: async () => {
      try {
        return await adminService.getDashboardSummary(params);
      } catch (error) {
        if (isNetworkOrMissingError(error)) {
          return await previewAdminService.getDashboardSummaryPreview();
        }
        throw error;
      }
    },
    select: (response) => response.data,
  });
};

export const useAdminRecentActivity = () => {
  return useQuery({
    queryKey: ['admin', 'recent-activity'],
    queryFn: () => adminService.getRecentActivity(),
  });
};

