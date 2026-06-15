import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { 
  DashboardSummary, 
  AdminUserManagementData, 
  AdminExpertReviewsData, 
  ExpertReviewDetail,
  ExpertReviewActionParams,
  HealthAlertItem,
  AdminProjectItem,
  RecentActivityItem,
  TransactionSummaryItem
} from './types';
import type { BaseResponse } from '@/shared/types/api';
import { 
  ADMIN_DASHBOARD_PREVIEW_DATA
} from './hooks/previewData';
import type { AxiosError } from 'axios';

interface BackendStats {
  totalUsers: number;
  totalClients: number;
  totalExperts: number;
  totalJobs: number;
  activeProjects: number;
  openDisputes: number;
  totalEscrowAmount: number;
}

const isNetworkOrMissingError = (error: unknown) => {
  const axiosError = error as AxiosError;
  return axiosError.message === 'Network Error' || 
         axiosError.response?.status === 404 || 
         axiosError.response?.status === 405 ||
         axiosError.response?.status === 501; // Not Implemented
};

/**
 * Robustly normalize various list shapes from backend
 */
const normalizeList = (data: unknown): Record<string, unknown>[] => {
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  
  const d = data as Record<string, unknown>;
  const list = d.items || d.Items || d.data || d.result || d.records || d.reviews || d.Reviews;
  if (list && Array.isArray(list)) return list as Record<string, unknown>[];
  
  if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) return normalizeList(d.data);
  
  return [];
};

/**
 * Safely check if a project status is "Ongoing"
 */
const isOngoingStatus = (status: unknown): boolean => {
  if (status === undefined || status === null) return true;
  if (typeof status === 'number') {
    return [0, 1, 2, 3, 6].includes(status);
  }
  const s = String(status).toUpperCase().replace(/\s+|_/g, '');
  const finishedStatuses = ['COMPLETED', 'COMPLETE', 'CANCELLED', 'CANCELED', 'CLOSED', 'REFUNDED', 'FAILED'];
  return !finishedStatuses.includes(s);
};

/**
 * Check if a dispute is "Open"
 */
const isOpenDisputeStatus = (status: unknown): boolean => {
  if (status === undefined || status === null) return true;
  const s = String(status).toUpperCase().replace(/\s+|_/g, '');
  const openStatuses = ['OPEN', 'UNDERREVIEW', 'INREVIEW', 'PENDING', 'PENDINGREVIEW'];
  return openStatuses.includes(s);
};

/**
 * Format status label for UI
 */
const getStatusLabel = (status: unknown): string => {
  if (typeof status === 'number') {
    switch (status) {
      case 0: return 'Pending Payment';
      case 1: return 'Active';
      case 2: return 'In Review';
      case 3: return 'Disputed';
      case 6: return 'On Hold';
      case 4: return 'Completed';
      case 5: return 'Cancelled';
      default: return 'Ongoing';
    }
  }
  
  const s = String(status).toUpperCase().replace(/\s+|_/g, '');
  if (s === 'PENDINGPAYMENT') return 'Pending Payment';
  if (s === 'INREVIEW') return 'In Review';
  if (s === 'INPROGRESS') return 'Active';
  if (s === 'DISPUTED') return 'Disputed';
  if (s === 'ONHOLD') return 'On Hold';
  
  return String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase();
};

/**
 * Helper to calculate items created in the last 7 days
 */
const countNewInLast7Days = (items: Record<string, unknown>[], dateField: string): number => {
  if (!items || !Array.isArray(items)) return 0;
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  return items.filter(item => {
    const dateValue = item[dateField] || item[dateField.charAt(0).toUpperCase() + dateField.slice(1)];
    if (!dateValue) return false;
    
    const date = new Date(dateValue as string);
    return !isNaN(date.getTime()) && date >= sevenDaysAgo;
  }).length;
};

/**
 * Helper to format date for activity timestamp
 */
const formatActivityDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Admin Services
 */
export const adminService = {
  getDashboardSummary: async (): Promise<BaseResponse<DashboardSummary & { _isStub?: boolean }>> => {
    try {
      const results = await Promise.allSettled([
        apiClient.get<BaseResponse<BackendStats>>(API_ENDPOINTS.ADMIN.DASHBOARD_SUMMARY),
        apiClient.get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.JOBS.BASE, { params: { PageSize: 100 } }),
        apiClient.get<BaseResponse<Record<string, unknown>[]>>('/api/v1/categories'),
        apiClient.get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.PROJECTS.BASE, { params: { PageSize: 100 } }), 
        apiClient.get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.DISPUTES.BASE, { params: { PageSize: 50 } }), 
        apiClient.get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.ADMIN.USERS, { params: { PageSize: 50 } }), 
        apiClient.get<BaseResponse<AdminExpertReviewsData>>(API_ENDPOINTS.ADMIN.EXPERT_REVIEWS, { params: { PageSize: 50 } }),
        apiClient.get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.WALLET.HISTORY, { params: { PageSize: 50 } })
      ]);

      const statsRes = results[0].status === 'fulfilled' ? results[0].value : null;
      const jobsRes = results[1].status === 'fulfilled' ? results[1].value : null;
      const categoriesRes = results[2].status === 'fulfilled' ? results[2].value : null;
      const projectsRes = results[3].status === 'fulfilled' ? results[3].value : null;
      const disputesRes = results[4].status === 'fulfilled' ? results[4].value : null;
      const usersRes = results[5].status === 'fulfilled' ? results[5].value : null;
      const expertReviewsRes = results[6].status === 'fulfilled' ? results[6].value : null;
      const paymentsRes = results[7].status === 'fulfilled' ? results[7].value : null;

      const backendStats = statsRes?.data?.data;
      const usersPayload = usersRes?.data?.data as Record<string, unknown>;
      const expertReviewsPayload = expertReviewsRes?.data?.data as unknown as Record<string, unknown>;
      const projectsPayload = projectsRes?.data?.data as Record<string, unknown>;
      
      const allJobs = normalizeList(jobsRes?.data?.data);
      const allCategories = normalizeList(categoriesRes?.data?.data);
      const allProjectsRaw = normalizeList(projectsRes?.data?.data);
      const allDisputes = normalizeList(disputesRes?.data?.data);
      const allUsers = normalizeList(usersRes?.data?.data);
      const allExpertReviews = normalizeList(expertReviewsRes?.data?.data);
      const recentPayments = normalizeList(paymentsRes?.data?.data);
      
      // 1. Process Job Market
      const activeJobs = allJobs.filter(job => {
        const s = String(job.status || job.Status || '').toUpperCase();
        return s === 'OPEN' || s === 'IN_PROGRESS' || s === 'PUBLISHED' || s === 'INPROGRESS';
      });

      const categoryMap = new Map<string, string>();
      allCategories.forEach((cat: Record<string, unknown>) => categoryMap.set(cat.id as string, cat.name as string));

      const domainCounts: Record<string, number> = {};
      activeJobs.forEach(job => {
        const domain = (job.businessDomain as string) || (job.categoryName as string) || (job.CategoryName as string) || categoryMap.get((job.categoryId || job.CategoryId) as string) || 'General';
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      });

      const topCategories = Object.entries(domainCounts)
        .map(([name, jobCount]) => ({ name, jobCount, totalValue: 0 }))
        .sort((a, b) => b.jobCount - a.jobCount)
        .slice(0, 5);

      // 2. Process Projects (Filter ongoing only)
      const ongoingProjects = allProjectsRaw.filter(p => isOngoingStatus(p.status ?? p.Status));

      const mappedProjects: AdminProjectItem[] = ongoingProjects.map((p: Record<string, unknown>) => {
        return {
          id: (p.id || p.Id) as string,
          title: (p.title || p.Title) as string,
          clientName: (p.clientName || p.ClientName || (p.client as Record<string, unknown>)?.fullName || (p.client as Record<string, unknown>)?.FullName || 'Unknown Client') as string,
          expertName: (p.expertName || p.ExpertName || (p.expert as Record<string, unknown>)?.fullName || (p.expert as Record<string, unknown>)?.FullName || 'Unknown Expert') as string,
          status: getStatusLabel(p.status ?? p.Status),
          amount: (p.totalBudget || p.TotalBudget || 0) as number,
          paymentStatus: (p.remainingBudget === 0 || p.RemainingBudget === 0) ? 'Paid' : 'Escrow'
        };
      });

      // 3. Process Counts with robust fallbacks
      const totalUsers = backendStats?.totalUsers ?? (usersPayload?.totalUsers || usersPayload?.TotalUsers) as number ?? allUsers.length;
      const totalClients = backendStats?.totalClients ?? (usersPayload?.totalClients || usersPayload?.TotalClients) as number ?? 0;
      const totalExperts = backendStats?.totalExperts ?? (usersPayload?.totalExperts || usersPayload?.TotalExperts) as number ?? 0;
      
      const realOpenDisputes = allDisputes.filter(d => isOpenDisputeStatus(d.status ?? d.Status));
      const openDisputesCount = backendStats?.openDisputes ?? realOpenDisputes.length;
      
      const pendingReviewsCount = (expertReviewsPayload?.totalPending || expertReviewsPayload?.TotalPending) as number ?? allExpertReviews.length;
      const openJobsCount = Math.max(activeJobs.length, backendStats?.totalJobs || 0);

      // 4. Calculate 7-day NEW counts
      const newUsers7d = countNewInLast7Days(allUsers, 'createdAt');
      const newJobs7d = countNewInLast7Days(allJobs, 'publishedAt');
      const newProjects7d = countNewInLast7Days(allProjectsRaw, 'createdAt');
      const newDisputes7d = countNewInLast7Days(allDisputes, 'createdAt');
      const newExpertReviews7d = countNewInLast7Days(allExpertReviews, 'submittedAt');
      const newTransactions7d = countNewInLast7Days(recentPayments, 'createdAt');

      // 5. Transaction Summary
      const transactionSummary: TransactionSummaryItem[] = [];
      if (recentPayments.length > 0) {
        const total = recentPayments.reduce((sum, p) => sum + (Number(p.amount || p.Amount || 0)), 0);
        transactionSummary.push({ type: 'Recent Volume', amount: total });
      }

      // 6. Health Alerts
      const healthAlerts: HealthAlertItem[] = [];
      if (openDisputesCount > 0) {
        healthAlerts.push({
          title: `${openDisputesCount} Unresolved Dispute${openDisputesCount > 1 ? 's' : ''}`,
          description: 'Resolution is required to maintain platform trust.',
          severity: 'critical'
        });
      }
      if (pendingReviewsCount > 10) {
        healthAlerts.push({
          title: 'High Volume of Expert Reviews',
          description: `${pendingReviewsCount} profiles are waiting for verification.`,
          severity: 'warning'
        });
      }

      const mappedData: DashboardSummary = {
        totalUsers,
        openJobs: openJobsCount,
        activeProjects: (projectsPayload?.totalItems || projectsPayload?.TotalItems) as number ?? mappedProjects.length,
        openDisputes: openDisputesCount,
        totalTransactionsValue: backendStats?.totalEscrowAmount ?? 0,
        pendingReviews: pendingReviewsCount, 
        
        newUsers7d,
        newJobs7d,
        newProjects7d,
        newDisputes7d,
        newExpertReviews7d,
        newTransactions7d,
        
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

        transactionSummary,
        activeProjectsList: mappedProjects,
        reviewQueue: allExpertReviews.slice(0, 5).map(r => ({
          label: (r.fullName || r.FullName) as string,
          count: 1 
        })),
        topCategories,
        recentActivity: [], 
        healthAlerts,
        _rawJobs: activeJobs.slice(0, 5).map(j => ({ title: (j.title || j.Title) as string, status: (j.status || j.Status) as string }))
      };

      return {
        success: true,
        data: { ...mappedData, _isStub: false },
        message: statsRes === null ? 'Partial data loaded' : 'Dashboard summary retrieved',
        statusCode: 200,
      };
    } catch (error) {
      if (isNetworkOrMissingError(error)) {
        return {
          success: false,
          data: { ...ADMIN_DASHBOARD_PREVIEW_DATA, _isStub: true } as DashboardSummary & { _isStub?: boolean },
          message: 'Backend service unavailable. Showing preview data.',
          statusCode: 503
        };
      }
      throw error;
    }
  },

  getRecentActivity: async (): Promise<BaseResponse<RecentActivityItem[]>> => {
    try {
      const results = await Promise.allSettled([
        apiClient.get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.DISPUTES.BASE, { params: { PageSize: 20 } }), 
        apiClient.get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.ADMIN.USERS, { params: { PageSize: 20 } }),
        apiClient.get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.PROJECTS.BASE, { params: { PageSize: 20 } })
      ]);

      const disputesRes = results[0].status === 'fulfilled' ? results[0].value : null;
      const usersRes = results[1].status === 'fulfilled' ? results[1].value : null;
      const projectsRes = results[2].status === 'fulfilled' ? results[2].value : null;

      const allDisputes = normalizeList(disputesRes?.data?.data);
      const allUsers = normalizeList(usersRes?.data?.data);
      const allProjectsRaw = normalizeList(projectsRes?.data?.data);

      const activityPool: RecentActivityItem[] = [];

      allDisputes.forEach(d => {
        const status = String(d.status || d.Status || '').toUpperCase();
        const date = (d.createdAt || d.CreatedAt) as string;
        if (status === 'RESOLVED') {
          activityPool.push({
            title: 'Dispute Resolved',
            description: `Dispute for project "${d.milestoneTitle || d.projectTitle || 'Project'}" resolved by Admin.`,
            type: 'info',
            date,
            timestamp: formatActivityDate(date)
          });
        } else if (status === 'OPEN') {
          activityPool.push({
            title: 'Dispute Opened',
            description: `New dispute opened by ${d.openerName || 'User'} for "${d.projectTitle || 'Project'}".`,
            type: 'alert',
            date,
            timestamp: formatActivityDate(date)
          });
        }
      });

      allUsers.forEach(u => {
        const status = String(u.status || u.Status || '').toUpperCase();
        const date = (u.createdAt || u.CreatedAt) as string;
        if (status === 'SUSPENDED') {
          activityPool.push({
            title: 'User Suspended',
            description: `Admin suspended account for ${u.fullName} (${u.role}).`,
            type: 'alert',
            date,
            timestamp: formatActivityDate(date)
          });
        } else if (String(u.role).toUpperCase() === 'EXPERT' && status === 'ACTIVE') {
          activityPool.push({
            title: 'New Expert Verified',
            description: `${u.fullName} profile was verified and activated.`,
            type: 'info',
            date,
            timestamp: formatActivityDate(date)
          });
        }
      });

      const ongoingProjects = allProjectsRaw.filter(p => isOngoingStatus(p.status ?? p.Status));
      ongoingProjects.forEach(p => {
        const date = (p.createdAt || p.CreatedAt) as string;
        activityPool.push({
          title: 'New Project Active',
          description: `"${p.title}" started between ${(p.clientName || p.ClientName || 'Client')} and ${(p.expertName || p.ExpertName || 'Expert')}.`,
          type: 'info',
          date,
          timestamp: formatActivityDate(date)
        });
      });

      const sortedActivity = activityPool
        .filter(a => a.date)
        .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
        .slice(0, 5);

      return {
        success: true,
        data: sortedActivity,
        message: 'Recent activity retrieved',
        statusCode: 200
      };
    } catch (error) {
      console.error('[AdminService] Failed to fetch recent activity:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load activity',
        statusCode: 500
      };
    }
  },
  
  getUsers: async (params?: Record<string, unknown>): Promise<BaseResponse<AdminUserManagementData & { _isStub?: boolean }>> => {
    try {
      const requestParams = {
        PageSize: 10,
        PageIndex: 1,
        ...params
      };

      const response = await apiClient.get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.ADMIN.USERS, { params: requestParams });
      const pageResult = response.data.data;
      const items = normalizeList(pageResult);
      
      // Map backend users to frontend AdminUserItem
      const mappedUsers = items.map((u: Record<string, unknown>) => {
        const lastLoginRaw = u.lastLoginAt || u.LastLoginAt;
        return {
          id: (u.id || u.Id) as string,
          fullName: (u.fullName || u.FullName) as string,
          email: (u.email || u.Email) as string,
          role: (u.role || u.Role) as 'Admin' | 'Expert' | 'Client',
          status: (u.status || u.Status) as 'Active' | 'Suspended' | 'Pending',
          verificationState: 'N/A' as const,
          createdAt: (u.createdAt || u.CreatedAt || 'N/A') as string,
          lastLoginAt: lastLoginRaw ? new Date(lastLoginRaw as string).toISOString() : null,
          avatarUrl: (u.avatarUrl || u.AvatarUrl) as string,
          initials: (u.fullName || u.FullName) 
            ? String(u.fullName || u.FullName).split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
            : 'U'
        };
      });

      return {
        ...response.data,
        data: { 
          users: mappedUsers,
          totalUsers: (pageResult?.totalItems || pageResult?.TotalItems || 0) as number,
          activeUsers: 0, 
          suspendedUsers: 0, 
          pendingVerify: 0,
          totalClients: 0,
          totalExperts: 0,
          reviewQueue: [],
          recentActions: [],
          
          pageIndex: (pageResult?.pageIndex || pageResult?.PageIndex || 1) as number,
          pageSize: (pageResult?.pageSize || pageResult?.PageSize || 10) as number,
          totalPages: (pageResult?.totalPages || pageResult?.TotalPages || 1) as number,
          
          _isStub: false 
        } as AdminUserManagementData & { _isStub?: boolean }
      };
    } catch (error) {
      console.error('[AdminService] Failed to fetch users:', error);
      if (isNetworkOrMissingError(error)) {
        return {
          success: false,
          data: {
            users: [],
            totalUsers: 0,
            activeUsers: 0,
            suspendedUsers: 0,
            pendingVerify: 0,
            totalClients: 0,
            totalExperts: 0,
            reviewQueue: [],
            recentActions: [],
            pageIndex: 1,
            pageSize: 10,
            totalPages: 1,
            _isStub: false
          } as AdminUserManagementData & { _isStub?: boolean },
          message: 'Users API is currently unavailable.',
          statusCode: 503
        };
      }
      throw error;
    }
  },

  suspendUser: async (id: string, reason?: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`${API_ENDPOINTS.ADMIN.USERS}/${id}/suspend`, { reason });
    return response.data;
  },

  unsuspendUser: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`${API_ENDPOINTS.ADMIN.USERS}/${id}/unsuspend`);
    return response.data;
  },

  getExpertReviews: async (params?: Record<string, unknown>): Promise<BaseResponse<AdminExpertReviewsData & { _isStub?: boolean }>> => {
    try {
      const response = await apiClient.get<BaseResponse<AdminExpertReviewsData>>(API_ENDPOINTS.ADMIN.EXPERT_REVIEWS, { params });
      return {
        ...response.data,
        data: { ...response.data.data, _isStub: false }
      };
    } catch (error) {
      if (isNetworkOrMissingError(error)) {
        return {
          success: false,
          data: {
            reviews: [],
            totalPending: 0,
            totalRevisions: 0,
            newToday: 0,
            totalRejected: 0,
            _isStub: false
          } as AdminExpertReviewsData & { _isStub?: boolean },
          message: 'Expert reviews API is currently unavailable.',
          statusCode: 501
        };
      }
      throw error;
    }
  },

  getExpertReviewDetail: async (id: string): Promise<BaseResponse<ExpertReviewDetail & { _isStub?: boolean }>> => {
    try {
      const response = await apiClient.get<BaseResponse<ExpertReviewDetail>>(API_ENDPOINTS.ADMIN.EXPERT_REVIEW_DETAIL(id));
      return {
        ...response.data,
        data: { ...response.data.data, _isStub: false }
      };
    } catch (error) {
      if (isNetworkOrMissingError(error)) {
        throw new Error('Expert review detail API is currently unavailable.');
      }
      throw error;
    }
  },

  processExpertReview: async (params: ExpertReviewActionParams): Promise<BaseResponse<void>> => {
    try {
      const response = await apiClient.post<BaseResponse<void>>(API_ENDPOINTS.ADMIN.PROCESS_EXPERT_REVIEW(params.id), params);
      return response.data;
    } catch (error) {
      if (isNetworkOrMissingError(error)) {
        return {
          success: false,
          message: 'This feature is currently unavailable. Please try again later.',
          statusCode: 503,
          data: undefined as unknown as void
        };
      }
      throw error;
    }
  }
};

