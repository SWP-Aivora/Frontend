import type { BaseResponse } from '@/shared/types/api';
import type {
  DashboardSummary,
  AdminUserManagementData,
  AdminExpertReviewsData,
  ExpertReviewDetail
} from '../types';
import {
  ADMIN_DASHBOARD_PREVIEW_DATA,
  ADMIN_USER_MANAGEMENT_PREVIEW_DATA,
  ADMIN_EXPERT_REVIEWS_PREVIEW_DATA,
  ADMIN_EXPERT_REVIEW_DETAIL_PREVIEW_DATA
} from '../hooks/previewData';

/**
 * Preview/Mock Admin Services
 * These services return static preview data when the real API is unavailable.
 * Used exclusively by the UI layer as an explicit fallback.
 */
export const previewAdminService = {
  getDashboardSummaryPreview: async (): Promise<BaseResponse<DashboardSummary & { _isStub: boolean }>> => {
    return {
      success: true,
      data: { ...ADMIN_DASHBOARD_PREVIEW_DATA, _isStub: true },
      message: 'Backend service unavailable. Showing preview data.',
      statusCode: 200,
    };
  },

  getUsersPreview: async (): Promise<BaseResponse<AdminUserManagementData & { _isStub: boolean }>> => {
    return {
      success: true,
      data: { ...ADMIN_USER_MANAGEMENT_PREVIEW_DATA, _isStub: true },
      message: 'Users API is currently unavailable. Showing preview data.',
      statusCode: 200,
    };
  },

  getExpertReviewsPreview: async (): Promise<BaseResponse<AdminExpertReviewsData & { _isStub: boolean }>> => {
    return {
      success: true,
      data: { ...ADMIN_EXPERT_REVIEWS_PREVIEW_DATA, _isStub: true },
      message: 'Expert reviews API is currently unavailable. Showing preview data.',
      statusCode: 200,
    };
  },

  getExpertReviewDetailPreview: async (id: string): Promise<BaseResponse<ExpertReviewDetail & { _isStub: boolean }>> => {
    const detail = ADMIN_EXPERT_REVIEW_DETAIL_PREVIEW_DATA[id] || ADMIN_EXPERT_REVIEW_DETAIL_PREVIEW_DATA['rev1'];
    return {
      success: true,
      data: { ...detail, _isStub: true },
      message: 'Expert review detail API is currently unavailable. Showing preview data.',
      statusCode: 200,
    };
  }
};
