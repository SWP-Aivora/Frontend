import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { 
  DashboardSummary, 
  AdminUserManagementData, 
  AdminExpertReviewsData, 
  ExpertReviewDetail,
  ExpertReviewActionParams
} from './types';
import type { BaseResponse } from '@/shared/types/api';

export const adminService = {
  getDashboardSummary: async (): Promise<BaseResponse<DashboardSummary>> => {
    const response = await apiClient.get<BaseResponse<DashboardSummary>>(API_ENDPOINTS.ADMIN.DASHBOARD_SUMMARY);
    return response.data;
  },
  
  getUsers: async (params?: Record<string, unknown>): Promise<BaseResponse<AdminUserManagementData>> => {
    const response = await apiClient.get<BaseResponse<AdminUserManagementData>>(API_ENDPOINTS.ADMIN.USERS, { params });
    return response.data;
  },

  suspendUser: async (id: string, reason?: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`${API_ENDPOINTS.ADMIN.USERS}/${id}/suspend`, { reason });
    return response.data;
  },

  unsuspendUser: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`${API_ENDPOINTS.ADMIN.USERS}/${id}/unsuspend`);
    return response.data;
  },

  getExpertReviews: async (params?: Record<string, unknown>): Promise<BaseResponse<AdminExpertReviewsData>> => {
    const response = await apiClient.get<BaseResponse<AdminExpertReviewsData>>('/api/v1/admin/expert-reviews', { params });
    return response.data;
  },

  getExpertReviewDetail: async (id: string): Promise<BaseResponse<ExpertReviewDetail>> => {
    const response = await apiClient.get<BaseResponse<ExpertReviewDetail>>(`/api/v1/admin/expert-reviews/${id}`);
    return response.data;
  },

  processExpertReview: async (params: ExpertReviewActionParams): Promise<BaseResponse<void>> => {
    const { id, ...data } = params;
    const response = await apiClient.post<BaseResponse<void>>(`/api/v1/admin/expert-reviews/${id}/process`, data);
    return response.data;
  }
};
