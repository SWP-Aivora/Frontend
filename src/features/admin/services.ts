import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { 
  DashboardSummary, 
  AdminUserManagementData, 
  AdminExpertReviewsData, 
  ExpertReviewDetail,
  ExpertReviewActionParams,
  HealthAlertItem
} from './types';
import type { BaseResponse } from '@/shared/types/api';
import { 
  ADMIN_DASHBOARD_PREVIEW_DATA, 
  ADMIN_EXPERT_REVIEWS_PREVIEW_DATA, 
  ADMIN_EXPERT_REVIEW_DETAIL_PREVIEW_DATA 
} from './hooks/previewData';

interface BackendStats {
  totalUsers: number;
  totalClients: number;
  totalExperts: number;
  totalJobs: number;
  activeProjects: number;
  openDisputes: number;
  totalEscrowAmount: number;
}

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
  getDashboardSummary: async (): Promise<BaseResponse<DashboardSummary & { _isStub?: boolean }>> => {
    try {
      const response = await apiClient.get<BaseResponse<BackendStats>>(API_ENDPOINTS.ADMIN.DASHBOARD_SUMMARY);
      const backendData = response.data.data;
      
      // Map backend fields to frontend structure
      const totalUsers = backendData?.totalUsers ?? 0;
      const totalClients = backendData?.totalClients ?? 0;
      const totalExperts = backendData?.totalExperts ?? 0;
      const openDisputes = backendData?.openDisputes ?? 0;

      // Generate dynamic health alerts based on real metrics
      const healthAlerts: HealthAlertItem[] = [];
      if (openDisputes > 0) {
        healthAlerts.push({
          title: `${openDisputes} Active Dispute${openDisputes > 1 ? 's' : ''} Found`,
          description: 'Resolution is required to maintain platform trust and release held funds.',
          severity: 'critical'
        });
      }

      const mappedData: DashboardSummary = {
        totalUsers,
        openJobs: backendData?.totalJobs ?? 0,
        activeProjects: backendData?.activeProjects ?? 0,
        openDisputes,
        totalTransactionsValue: backendData?.totalEscrowAmount ?? 0,
        pendingReviews: 0, 
        newUsersThisMonth: 0,
        
        // Calculate user overview from real counts
        userOverview: [
          { 
            role: 'Clients', 
            count: totalClients,
            fillPercentage: totalUsers > 0 ? (totalClients / totalUsers) * 100 : 0
          },
          { 
            role: 'Experts', 
            count: totalExperts,
            fillPercentage: totalUsers > 0 ? (totalExperts / totalUsers) * 100 : 0
          },
          { 
            role: 'Admins', 
            count: Math.max(0, totalUsers - totalClients - totalExperts),
            fillPercentage: totalUsers > 0 ? (Math.max(0, totalUsers - totalClients - totalExperts) / totalUsers) * 100 : 0
          },
        ],

        // Clean empty states for data not yet provided by API
        transactionSummary: [],
        activeProjectsList: [],
        reviewQueue: [],
        topCategories: [],
        recentActivity: [],
        healthAlerts
      };

      return {
        ...response.data,
        data: { ...mappedData, _isStub: false }
      };
    } catch (error) {
      console.error('Admin Dashboard API failed, falling back to preview data:', error);
      
      // Update preview data to match "Expert Profile Review" context
      const dashboardPreview = { ...ADMIN_DASHBOARD_PREVIEW_DATA };
      dashboardPreview.pendingReviews = ADMIN_EXPERT_REVIEWS_PREVIEW_DATA.totalPending;
      dashboardPreview.reviewQueue = [
        { label: 'Pending Review', count: ADMIN_EXPERT_REVIEWS_PREVIEW_DATA.totalPending },
        { label: 'Requires Revision', count: ADMIN_EXPERT_REVIEWS_PREVIEW_DATA.totalRevisions },
        { label: 'New Submissions Today', count: ADMIN_EXPERT_REVIEWS_PREVIEW_DATA.newToday },
      ];

      return {
        success: true,
        data: { ...dashboardPreview, _isStub: true },
        message: 'UI Preview Mode: API request failed. Showing stub data.',
        statusCode: 200
      };
    }
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
