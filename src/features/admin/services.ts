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
import { 
  ADMIN_DASHBOARD_PREVIEW_DATA, 
  ADMIN_EXPERT_REVIEWS_PREVIEW_DATA, 
  ADMIN_EXPERT_REVIEW_DETAIL_PREVIEW_DATA 
} from './hooks/previewData';

/**
 * Admin Services
 * 
 * NOTE ON PREVIEW MODE:
 * Several admin endpoints called here (Dashboard Summary, Expert Reviews) are NOT yet 
 * available in the backend API contract (API Note/v1.json).
 * 
 * To prevent failing network requests and allow UI development, these methods 
 * immediately return resolved Promises with temporary preview data.
 * 
 * Real API integration should replace these stubs once the backend endpoints are implemented.
 */
export const adminService = {
  getDashboardSummary: async (): Promise<BaseResponse<DashboardSummary>> => {
    // NOTE: Not in v1.json. Returning local preview data.
    return {
      success: true,
      data: ADMIN_DASHBOARD_PREVIEW_DATA,
      message: 'UI Preview Mode: Data loaded from local stub',
      statusCode: 200
    };
  },
  
  getUsers: async (params?: Record<string, unknown>): Promise<BaseResponse<AdminUserManagementData>> => {
    // Valid endpoint in v1.json: GET /api/v1/admin/users
    const response = await apiClient.get<BaseResponse<AdminUserManagementData>>(API_ENDPOINTS.ADMIN.USERS, { params });
    return response.data;
  },

  suspendUser: async (id: string, reason?: string): Promise<BaseResponse<void>> => {
    // Valid endpoint in v1.json: PUT /api/v1/admin/users/{id}/suspend
    const response = await apiClient.put<BaseResponse<void>>(`${API_ENDPOINTS.ADMIN.USERS}/${id}/suspend`, { reason });
    return response.data;
  },

  unsuspendUser: async (id: string): Promise<BaseResponse<void>> => {
    // Valid endpoint in v1.json: PUT /api/v1/admin/users/{id}/unsuspend
    const response = await apiClient.put<BaseResponse<void>>(`${API_ENDPOINTS.ADMIN.USERS}/${id}/unsuspend`);
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getExpertReviews: async (_params?: Record<string, unknown>): Promise<BaseResponse<AdminExpertReviewsData>> => {
    // NOTE: Not in v1.json. Returning local preview data.
    return {
      success: true,
      data: ADMIN_EXPERT_REVIEWS_PREVIEW_DATA,
      message: 'UI Preview Mode: Data loaded from local stub',
      statusCode: 200
    };
  },

  getExpertReviewDetail: async (id: string): Promise<BaseResponse<ExpertReviewDetail>> => {
    // NOTE: Not in v1.json. Returning local preview data.
    const mockDetail = ADMIN_EXPERT_REVIEW_DETAIL_PREVIEW_DATA[id] || ADMIN_EXPERT_REVIEW_DETAIL_PREVIEW_DATA['rev1'];
    return {
      success: true,
      data: mockDetail,
      message: 'UI Preview Mode: Data loaded from local stub',
      statusCode: 200
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  processExpertReview: async (_params: ExpertReviewActionParams): Promise<BaseResponse<void>> => {
    // NOTE: Not in v1.json. Action is preview-only.
    console.warn('Expert review processing is preview-only. No real API call made.');
    return {
      success: true,
      data: undefined as unknown as void,
      message: 'UI Preview Mode: This action is not available in the current API contract yet.',
      statusCode: 200
    };
  }
};
