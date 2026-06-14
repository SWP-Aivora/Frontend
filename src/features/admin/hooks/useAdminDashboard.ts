import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services';

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-summary'],
    queryFn: () => adminService.getDashboardSummary(),
    select: (response) => response.data,
  });
};

export const useAdminRecentActivity = () => {
  return useQuery({
    queryKey: ['admin', 'recent-activity'],
    queryFn: () => adminService.getRecentActivity(),
    select: (response) => response.data,
  });
};
