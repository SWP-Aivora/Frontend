import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { 
  DashboardSummary, 
  AdminUserManagementData, 
  AdminExpertReviewsData, 
  ExpertReviewItem,
  ExpertReviewDetail,
  ExpertReviewActionParams,
  HealthAlertItem,
  AdminProject,
  AdminProjectMilestone,
  AdminProjectsQuery,
  AdminProjectItem,
  RecentActivityItem,
  TransactionSummaryItem
} from './types';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { normalizeBaseResponse, normalizePaginatedResponse } from '@/lib/api-utils';
import type { AxiosResponse } from 'axios';
import { isProjectDisputed } from '@/features/projects/utils';

interface DashboardSummaryParams {
  projectPage?: number;
  projectLimit?: number;
}

interface BackendStats {
  totalUsers: number;
  totalClients: number;
  totalExperts: number;
  totalJobs: number;
  activeProjects: number;
  openDisputes: number;
  totalEscrowAmount: number;
}

type AdminRecord = Readonly<Record<string, unknown>>;
type MutableAdminRecord = Record<string, unknown>;
type TypeGuard<T> = (value: unknown) => value is T;

interface AdminPagePayload {
  readonly items?: unknown;
  readonly Items?: unknown;
  readonly data?: unknown;
  readonly result?: unknown;
  readonly records?: unknown;
  readonly reviews?: unknown;
  readonly Reviews?: unknown;
  readonly pageIndex?: unknown;
  readonly PageIndex?: unknown;
  readonly pageSize?: unknown;
  readonly PageSize?: unknown;
  readonly totalItems?: unknown;
  readonly TotalItems?: unknown;
  readonly totalPages?: unknown;
  readonly TotalPages?: unknown;
}

const NORMALIZE_LIST_MAX_DEPTH = 5;
const NORMALIZE_LIST_KEYS = ['items', 'Items', 'data', 'result', 'records', 'reviews', 'Reviews'] as const;

const isRecord = (value: unknown): value is AdminRecord => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const isMutableRecord = (value: unknown): value is MutableAdminRecord => isRecord(value);

const isArrayOfRecords = (value: unknown): value is AdminRecord[] => (
  Array.isArray(value) && value.every(isRecord)
);

const isAdminPagePayload = (value: unknown): value is AdminPagePayload => isRecord(value);

const isValidBasePayload = (value: unknown): value is AdminRecord | AdminRecord[] => (
  isRecord(value) || isArrayOfRecords(value)
);

const isVoidPayload = (value: unknown): value is void => value === undefined;

const isExpertReviewDetailPayload = (value: unknown): value is ExpertReviewDetail => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string'
    && typeof value.expertId === 'string'
    && typeof value.fullName === 'string'
    && typeof value.email === 'string'
    && typeof value.initials === 'string'
    && typeof value.status === 'string'
    && typeof value.submittedAt === 'string'
    && typeof value.title === 'string'
    && Array.isArray(value.skills)
    && value.skills.every((skill) => typeof skill === 'string')
    && typeof value.experienceYears === 'number'
    && typeof value.proofCount === 'number'
  );
};

const warnMalformedList = (reason: string, data: unknown, depth: number): void => {
  if (!import.meta.env.DEV) {
    return;
  }

  console.warn('[adminService.normalizeList] Unexpected list payload', {
    reason,
    depth,
    type: Array.isArray(data) ? 'array' : typeof data,
    keys: isRecord(data) ? Object.keys(data).slice(0, 8) : [],
  });
};

const createNormalizeListError = (reason: string): Error => (
  new Error(`Admin list response is malformed: ${reason}`)
);

const createAdminFailureResponse = <T>(message: string): BaseResponse<T> => ({
  success: false,
  data: null,
  message,
  statusCode: 500,
});

const getValue = (source: AdminRecord, ...keys: string[]): unknown => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

const getRecord = (value: unknown): AdminRecord => (
  isRecord(value) ? value : {}
);

const getStringValue = (value: unknown, fallback = ''): string => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const getOptionalString = (source: AdminRecord, ...keys: string[]): string | undefined => {
  const value = getValue(source, ...keys);
  return typeof value === 'string' ? value : undefined;
};

const getNullableString = (source: AdminRecord, ...keys: string[]): string | null => (
  getOptionalString(source, ...keys) ?? null
);

const getNumericValue = (value: unknown): number | undefined => {
  const numeric = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : Number.NaN;

  return Number.isFinite(numeric) ? numeric : undefined;
};

const getNumberValue = (source: AdminRecord, ...keys: string[]): number | undefined => (
  getNumericValue(getValue(source, ...keys))
);

const getNumberOr = (source: AdminRecord, fallback: number, ...keys: string[]): number => (
  getNumberValue(source, ...keys) ?? fallback
);

const getObjectValue = (source: AdminRecord, ...keys: string[]): AdminRecord => (
  getRecord(getValue(source, ...keys))
);

const getArrayValue = (source: AdminRecord, ...keys: string[]): unknown[] => {
  const value = getValue(source, ...keys);
  return Array.isArray(value) ? value : [];
};

const getStatusText = (source: AdminRecord, ...keys: string[]): string => (
  getStringValue(getValue(source, ...keys)).toUpperCase()
);

const getSettledBaseData = <T>(
  result: PromiseSettledResult<AxiosResponse<unknown>>,
  dataGuard: TypeGuard<T>
): T | null => {
  if (result.status !== 'fulfilled') {
    return null;
  }

  return normalizeBaseResponse<T>(result.value, dataGuard).data;
};

const getDateInput = (source: AdminRecord, ...keys: string[]): string | number | Date | undefined => {
  const value = getValue(source, ...keys);
  return typeof value === 'string' || typeof value === 'number' || value instanceof Date ? value : undefined;
};

const getStringOrNumberValue = (value: unknown, fallback: string | number): string | number => (
  typeof value === 'string' || typeof value === 'number' ? value : fallback
);

const hasZeroNumericValue = (value: unknown): boolean => getNumericValue(value) === 0;

const getBooleanValue = (source: AdminRecord, ...keys: string[]): boolean | undefined => {
  const value = getValue(source, ...keys);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return undefined;
};

const BACKEND_STATS_KEYS = [
  'totalUsers',
  'totalClients',
  'totalExperts',
  'totalJobs',
  'activeProjects',
  'openDisputes',
  'totalEscrowAmount',
] as const satisfies readonly (keyof BackendStats)[];

const getBackendStatsRecord = (value: unknown): AdminRecord => {
  const record = getRecord(value);
  const hasStatsShape = BACKEND_STATS_KEYS.some((key) => getNumericValue(record[key]) !== undefined);

  return hasStatsShape ? record : {};
};

const normalizeAdminUserRole = (value: unknown): AdminUserManagementData['users'][number]['role'] => {
  const normalized = String(value ?? '').toUpperCase();
  if (normalized === 'ADMIN') return 'Admin';
  if (normalized === 'EXPERT') return 'Expert';
  return 'Client';
};

const normalizeAdminUserStatus = (value: unknown): AdminUserManagementData['users'][number]['status'] => {
  const normalized = String(value ?? '').toUpperCase();
  if (normalized === 'SUSPENDED') return 'Suspended';
  if (normalized === 'PENDING') return 'Pending';
  return 'Active';
};

/**
 * Robustly normalize various list shapes from backend
 */
export const normalizeList = (data: unknown, depth = 0): AdminRecord[] => {
  if (data === null || data === undefined) {
    return [];
  }

  if (depth > NORMALIZE_LIST_MAX_DEPTH) {
    warnMalformedList(`max depth ${NORMALIZE_LIST_MAX_DEPTH} exceeded`, data, depth);
    throw createNormalizeListError(`max depth ${NORMALIZE_LIST_MAX_DEPTH} exceeded`);
  }

  if (Array.isArray(data)) {
    if (!isArrayOfRecords(data)) {
      warnMalformedList('array contains non-object items', data, depth);
      throw createNormalizeListError('array contains non-object items');
    }

    return data;
  }

  if (!isAdminPagePayload(data)) {
    warnMalformedList('expected an object, array, null, or undefined', data, depth);
    throw createNormalizeListError('expected an object, array, null, or undefined');
  }

  for (const key of NORMALIZE_LIST_KEYS) {
    if (!(key in data)) {
      continue;
    }

    const listCandidate = data[key];

    if (listCandidate === null || listCandidate === undefined) {
      return [];
    }

    if (Array.isArray(listCandidate)) {
      if (!isArrayOfRecords(listCandidate)) {
        warnMalformedList(`wrapper key "${key}" contains non-object items`, data, depth);
        throw createNormalizeListError(`wrapper key "${key}" contains non-object items`);
      }

      return listCandidate;
    }

    if (isRecord(listCandidate)) {
      return normalizeList(listCandidate, depth + 1);
    }

    warnMalformedList(`wrapper key "${key}" is not an array or object`, data, depth);
    throw createNormalizeListError(`wrapper key "${key}" is not an array or object`);
  }

  if (Object.keys(data).length === 0) {
    return [];
  }

  warnMalformedList('no supported list keys found', data, depth);
  throw createNormalizeListError('no supported list keys found');
};

/**
 * Safely check if a project status is "Ongoing"
 */
export const isOngoingStatus = (status: unknown): boolean => {
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
export const isOpenDisputeStatus = (status: unknown): boolean => {
  if (status === undefined || status === null) return true;
  const s = String(status).toUpperCase().replace(/\s+|_/g, '');
  const openStatuses = ['OPEN', 'UNDERREVIEW', 'INREVIEW', 'PENDING', 'PENDINGREVIEW'];
  return openStatuses.includes(s);
};

/**
 * Format status label for UI
 */
export const getStatusLabel = (status: unknown): string => {
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
export const countNewInLast7Days = (items: AdminRecord[], dateField: string): number => {
  if (!items || !Array.isArray(items)) return 0;
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  return items.filter(item => {
    const dateValue = getDateInput(item, dateField, dateField.charAt(0).toUpperCase() + dateField.slice(1));
    if (!dateValue) return false;
    
    const date = new Date(dateValue);
    return !isNaN(date.getTime()) && date >= sevenDaysAgo;
  }).length;
};

const normalizeAdminProjectMilestone = (raw: unknown): AdminProjectMilestone => {
  const milestone = getRecord(raw);

  return {
    id: getStringValue(getValue(milestone, 'id', 'Id')),
    title: getStringValue(getValue(milestone, 'title', 'Title'), 'Untitled milestone'),
    description: getNullableString(milestone, 'description', 'Description'),
    amount: getNumberOr(milestone, 0, 'amount', 'Amount'),
    currency: getStringValue(getValue(milestone, 'currency', 'Currency'), 'VND'),
    status: getStringOrNumberValue(getValue(milestone, 'status', 'Status'), 'Unknown'),
    orderIndex: getNumberOr(milestone, 0, 'orderIndex', 'OrderIndex'),
    dueDate: getNullableString(milestone, 'dueDate', 'DueDate'),
  };
};

const normalizeAdminProject = (raw: unknown): AdminProject => {
  const project = getRecord(raw);
  const milestones = getArrayValue(project, 'milestones', 'Milestones');
  const status = getStringOrNumberValue(getValue(project, 'status', 'Status'), 'Unknown');
  const explicitHasDispute = getBooleanValue(project, 'hasDispute', 'HasDispute', 'isDisputed', 'IsDisputed');

  return {
    id: getStringValue(getValue(project, 'id', 'Id')),
    jobId: getOptionalString(project, 'jobId', 'JobId'),
    acceptedProposalId: getOptionalString(project, 'acceptedProposalId', 'AcceptedProposalId'),
    clientId: getStringValue(getValue(project, 'clientId', 'ClientId')),
    clientName: getStringValue(getValue(project, 'clientName', 'ClientName'), 'N/A'),
    expertId: getStringValue(getValue(project, 'expertId', 'ExpertId')),
    expertName: getStringValue(getValue(project, 'expertName', 'ExpertName'), 'N/A'),
    title: getStringValue(getValue(project, 'title', 'Title'), 'Untitled project'),
    description: getNullableString(project, 'description', 'Description'),
    totalBudget: getNumberOr(project, 0, 'totalBudget', 'TotalBudget'),
    currency: getStringValue(getValue(project, 'currency', 'Currency'), 'VND'),
    status,
    hasDispute: explicitHasDispute ?? isProjectDisputed(status),
    startDate: getNullableString(project, 'startDate', 'StartDate'),
    endDate: getNullableString(project, 'endDate', 'EndDate'),
    completedAt: getNullableString(project, 'completedAt', 'CompletedAt'),
    createdAt: getStringValue(getValue(project, 'createdAt', 'CreatedAt')),
    updatedAt: getNullableString(project, 'updatedAt', 'UpdatedAt'),
    milestones: Array.isArray(milestones) ? milestones.map(normalizeAdminProjectMilestone) : [],
  };
};

const formatExpertReviewStatus = (status: unknown): ExpertReviewItem['status'] => {
  const normalized = String(status ?? 'Pending').replace(/_/g, '').toUpperCase();
  if (normalized === 'APPROVED') return 'Approved';
  if (normalized === 'REJECTED') return 'Rejected';
  if (normalized === 'REVISION') return 'Revision';
  return 'Pending';
};

const normalizeExpertReviewItem = (raw: unknown): ExpertReviewItem => {
  const item = getRecord(raw);
  const fullName = getStringValue(getValue(item, 'fullName', 'FullName', 'name', 'Name'), 'Unknown Expert');
  const skills = getArrayValue(item, 'skills', 'Skills');

  return {
    id: getStringValue(getValue(item, 'id', 'Id', 'reviewId', 'ReviewId')),
    expertId: getStringValue(getValue(item, 'expertId', 'ExpertId', 'userId', 'UserId')),
    fullName,
    email: getStringValue(getValue(item, 'email', 'Email')),
    avatarUrl: getNullableString(item, 'avatarUrl', 'AvatarUrl'),
    initials: getStringValue(getValue(item, 'initials', 'Initials'), fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'EX'),
    status: formatExpertReviewStatus(getValue(item, 'status', 'Status')),
    submittedAt: getStringValue(getValue(item, 'submittedAt', 'SubmittedAt', 'createdAt', 'CreatedAt'), 'N/A'),
    title: getStringValue(getValue(item, 'title', 'Title', 'professionalTitle', 'ProfessionalTitle'), 'Expert profile update'),
    skills: skills.map(String),
    experienceYears: getNumberOr(item, 0, 'experienceYears', 'ExperienceYears'),
    proofCount: getNumberOr(item, 0, 'proofCount', 'ProofCount', 'portfolioCount', 'PortfolioCount'),
  };
};

const normalizeExpertReviewsData = (raw: unknown): AdminExpertReviewsData => {
  const data = getRecord(raw);
  const reviews = normalizeList(data).map(normalizeExpertReviewItem);
  const today = new Date().toDateString();

  return {
    reviews,
    totalPending: getNumberOr(data, reviews.filter((review) => review.status === 'Pending').length, 'totalPending', 'TotalPending'),
    totalRevisions: getNumberOr(data, reviews.filter((review) => review.status === 'Revision').length, 'totalRevisions', 'TotalRevisions'),
    totalRejected: getNumberOr(data, reviews.filter((review) => review.status === 'Rejected').length, 'totalRejected', 'TotalRejected'),
    newToday: getNumberOr(
      data,
      reviews.filter((review) => {
        const date = new Date(review.submittedAt);
        return !Number.isNaN(date.getTime()) && date.toDateString() === today;
      }).length,
      'newToday',
      'NewToday'
    ),
  };
};

/**
 * Helper to format date for activity timestamp
 */
export const formatActivityDate = (dateString: string): string => {
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
  getProjects: async (params?: AdminProjectsQuery): Promise<PaginatedResponse<AdminProject>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.BASE, { params });
    const normalized = normalizePaginatedResponse<AdminRecord>(response, isMutableRecord);

    return {
      ...normalized,
      data: (normalized.data ?? []).map(normalizeAdminProject),
    };
  },

  getProjectDetail: async (id: string): Promise<BaseResponse<AdminProject>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.ID(id));
    const normalized = normalizeBaseResponse<AdminRecord>(response, isMutableRecord);

    return {
      ...normalized,
      data: normalized.data ? normalizeAdminProject(normalized.data) : null,
    };
  },

  getDashboardSummary: async (params: DashboardSummaryParams = {}): Promise<BaseResponse<DashboardSummary & { _isStub?: boolean }>> => {
    const projectPage = params.projectPage ?? 1;
    const projectLimit = params.projectLimit ?? 10;
    const ongoingProjectStatuses = [0, 1, 2, 3, 6].join(',');

    const results = await Promise.allSettled([
      apiClient.get<unknown>(API_ENDPOINTS.ADMIN.DASHBOARD_SUMMARY),
      apiClient.get<unknown>(API_ENDPOINTS.JOBS.BASE, { params: { PageSize: 100 } }),
      apiClient.get<unknown>(API_ENDPOINTS.CATEGORIES.BASE),
      apiClient.get<unknown>(API_ENDPOINTS.PROJECTS.BASE, {
        params: {
          PageIndex: projectPage,
          PageSize: projectLimit,
          page: projectPage,
          limit: projectLimit,
          statuses: ongoingProjectStatuses,
        },
      }),
      apiClient.get<unknown>(API_ENDPOINTS.DISPUTES.BASE, { params: { PageSize: 50 } }),
      apiClient.get<unknown>(API_ENDPOINTS.ADMIN.USERS, { params: { PageSize: 50 } }),
      apiClient.get<unknown>(API_ENDPOINTS.ADMIN.EXPERT_REVIEWS, { params: { PageSize: 50 } }),
      apiClient.get<unknown>(API_ENDPOINTS.WALLET.PAYMENT_HISTORY, { params: { PageSize: 50 } })
    ]);

    const statsData = getSettledBaseData(results[0], isMutableRecord);
    const jobsData = getSettledBaseData(results[1], isValidBasePayload);
    const categoriesData = getSettledBaseData(results[2], isValidBasePayload);
    const projectsData = getSettledBaseData(results[3], isValidBasePayload);
    const disputesData = getSettledBaseData(results[4], isValidBasePayload);
    const usersData = getSettledBaseData(results[5], isValidBasePayload);
    const expertReviewsData = getSettledBaseData(results[6], isValidBasePayload);
    const paymentsData = getSettledBaseData(results[7], isValidBasePayload);

    const backendStats = getBackendStatsRecord(statsData);
    const usersPayload = getRecord(usersData);
    const expertReviewsPayload = getRecord(expertReviewsData);
    const projectsPayload = getRecord(projectsData);

    const allJobs = normalizeList(jobsData);
    const allCategories = normalizeList(categoriesData);
    const allProjectsRaw = normalizeList(projectsData);
    const allDisputes = normalizeList(disputesData);
    const allUsers = normalizeList(usersData);
    const allExpertReviews = normalizeList(expertReviewsData);
    const recentPayments = normalizeList(paymentsData);

    // 1. Process Job Market
    const activeJobs = allJobs.filter(job => {
      const s = getStatusText(job, 'status', 'Status');
      return s === 'OPEN' || s === 'IN_PROGRESS' || s === 'PUBLISHED' || s === 'INPROGRESS';
    });

    const categoryMap = new Map<string, string>();
    allCategories.forEach((category) => {
      const categoryId = getOptionalString(category, 'id', 'Id');
      const categoryName = getOptionalString(category, 'name', 'Name');
      if (categoryId && categoryName) {
        categoryMap.set(categoryId, categoryName);
      }
    });

    const domainCounts: Record<string, number> = {};
    activeJobs.forEach(job => {
      const domain = getOptionalString(job, 'businessDomain', 'categoryName', 'CategoryName')
        ?? categoryMap.get(getStringValue(getValue(job, 'categoryId', 'CategoryId')))
        ?? 'General';
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });

    const topCategories = Object.entries(domainCounts)
      .map(([name, jobCount]) => ({ name, jobCount, totalValue: 0 }))
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, 5);

    // 2. Process Projects (Filter ongoing only)
    const ongoingProjects = allProjectsRaw.filter(p => isOngoingStatus(p.status ?? p.Status));

    const mappedProjects: AdminProjectItem[] = ongoingProjects.map((project) => {
      const client = getObjectValue(project, 'client', 'Client');
      const expert = getObjectValue(project, 'expert', 'Expert');
      return {
        id: getStringValue(getValue(project, 'id', 'Id')),
        title: getStringValue(getValue(project, 'title', 'Title')),
        clientName: getStringValue(
          getValue(project, 'clientName', 'ClientName')
            ?? getValue(client, 'fullName', 'FullName'),
          'Unknown Client'
        ),
        expertName: getStringValue(
          getValue(project, 'expertName', 'ExpertName')
            ?? getValue(expert, 'fullName', 'FullName'),
          'Unknown Expert'
        ),
        status: getStatusLabel(getValue(project, 'status', 'Status')),
        amount: getNumberOr(project, 0, 'totalBudget', 'TotalBudget'),
        paymentStatus: hasZeroNumericValue(getValue(project, 'remainingBudget', 'RemainingBudget')) ? 'Paid' : 'Escrow'
      };
    });

    // 3. Process Counts with robust fallbacks
    const totalUsers = getNumberValue(backendStats, 'totalUsers') ?? getNumberValue(usersPayload, 'totalUsers', 'TotalUsers') ?? allUsers.length;
    const totalClients = getNumberValue(backendStats, 'totalClients') ?? getNumberValue(usersPayload, 'totalClients', 'TotalClients') ?? 0;
    const totalExperts = getNumberValue(backendStats, 'totalExperts') ?? getNumberValue(usersPayload, 'totalExperts', 'TotalExperts') ?? 0;

    const realOpenDisputes = allDisputes.filter(d => isOpenDisputeStatus(d.status ?? d.Status));
    const openDisputesCount = getNumberValue(backendStats, 'openDisputes') ?? realOpenDisputes.length;

    const pendingReviewsCount = getNumberValue(expertReviewsPayload, 'totalPending', 'TotalPending') ?? allExpertReviews.length;
    const openJobsCount = Math.max(activeJobs.length, getNumberValue(backendStats, 'totalJobs') ?? 0);

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
      const total = recentPayments.reduce((sum, payment) => sum + getNumberOr(payment, 0, 'amount', 'Amount'), 0);
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
      activeProjects: getNumberValue(projectsPayload, 'totalItems', 'TotalItems') ?? mappedProjects.length,
      openDisputes: openDisputesCount,
      totalTransactionsValue: getNumberValue(backendStats, 'totalEscrowAmount') ?? 0,
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
      activeProjectsPagination: {
        pageIndex: getNumberValue(projectsPayload, 'pageIndex', 'PageIndex') ?? projectPage,
        pageSize: getNumberValue(projectsPayload, 'pageSize', 'PageSize') ?? projectLimit,
        totalItems: getNumberValue(projectsPayload, 'totalItems', 'TotalItems') ?? mappedProjects.length,
        totalPages: getNumberValue(projectsPayload, 'totalPages', 'TotalPages') ?? (Math.ceil(mappedProjects.length / projectLimit) || 1),
      },
      reviewQueue: allExpertReviews.slice(0, 5).map(r => ({
        label: getStringValue(getValue(r, 'fullName', 'FullName')),
        count: 1
      })),
      topCategories,
      recentActivity: [],
      healthAlerts,
      _rawJobs: activeJobs.slice(0, 5).map(job => ({
        title: getStringValue(getValue(job, 'title', 'Title')),
        status: getStringValue(getValue(job, 'status', 'Status'))
      }))
    };

    return {
      success: true,
      data: { ...mappedData, _isStub: false },
      message: statsData === null ? 'Partial data loaded' : 'Dashboard summary retrieved',
      statusCode: 200,
    };
  },

  getRecentActivity: async (): Promise<BaseResponse<RecentActivityItem[]>> => {
    try {
      const results = await Promise.allSettled([
        apiClient.get<unknown>(API_ENDPOINTS.DISPUTES.BASE, { params: { PageSize: 20 } }), 
        apiClient.get<unknown>(API_ENDPOINTS.ADMIN.USERS, { params: { PageSize: 20 } }),
        apiClient.get<unknown>(API_ENDPOINTS.PROJECTS.BASE, { params: { PageSize: 20 } })
      ]);

      const disputesData = getSettledBaseData(results[0], isValidBasePayload);
      const usersData = getSettledBaseData(results[1], isValidBasePayload);
      const projectsData = getSettledBaseData(results[2], isValidBasePayload);

      const allDisputes = normalizeList(disputesData);
      const allUsers = normalizeList(usersData);
      const allProjectsRaw = normalizeList(projectsData);

      const activityPool: RecentActivityItem[] = [];

      allDisputes.forEach(d => {
        const status = getStatusText(d, 'status', 'Status');
        const date = getStringValue(getValue(d, 'createdAt', 'CreatedAt'));
        if (status === 'RESOLVED') {
          activityPool.push({
            title: 'Dispute Resolved',
            description: `Dispute for project "${getStringValue(getValue(d, 'milestoneTitle', 'projectTitle'), 'Project')}" resolved by Admin.`,
            type: 'info',
            date,
            timestamp: formatActivityDate(date)
          });
        } else if (status === 'OPEN') {
          activityPool.push({
            title: 'Dispute Opened',
            description: `New dispute opened by ${getStringValue(getValue(d, 'openerName'), 'User')} for "${getStringValue(getValue(d, 'projectTitle'), 'Project')}".`,
            type: 'alert',
            date,
            timestamp: formatActivityDate(date)
          });
        }
      });

      allUsers.forEach(u => {
        const status = getStatusText(u, 'status', 'Status');
        const date = getStringValue(getValue(u, 'createdAt', 'CreatedAt'));
        if (status === 'SUSPENDED') {
          activityPool.push({
            title: 'User Suspended',
            description: `Admin suspended account for ${getStringValue(getValue(u, 'fullName', 'FullName'))} (${getStringValue(getValue(u, 'role', 'Role'))}).`,
            type: 'alert',
            date,
            timestamp: formatActivityDate(date)
          });
        } else if (String(u.role).toUpperCase() === 'EXPERT' && status === 'ACTIVE') {
          activityPool.push({
            title: 'New Expert Verified',
            description: `${getStringValue(getValue(u, 'fullName', 'FullName'))} profile was verified and activated.`,
            type: 'info',
            date,
            timestamp: formatActivityDate(date)
          });
        }
      });

      const ongoingProjects = allProjectsRaw.filter(p => isOngoingStatus(p.status ?? p.Status));
      ongoingProjects.forEach(p => {
        const date = getStringValue(getValue(p, 'createdAt', 'CreatedAt'));
        activityPool.push({
          title: 'New Project Active',
          description: `"${getStringValue(getValue(p, 'title', 'Title'))}" started between ${getStringValue(getValue(p, 'clientName', 'ClientName'), 'Client')} and ${getStringValue(getValue(p, 'expertName', 'ExpertName'), 'Expert')}.`,
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
        ...createAdminFailureResponse<RecentActivityItem[]>('Failed to load activity'),
        data: [],
      };
    }
  },
  
  getUsers: async (params?: Record<string, unknown>): Promise<BaseResponse<AdminUserManagementData & { _isStub?: boolean }>> => {
    const requestParams = {
      PageSize: 10,
      PageIndex: 1,
      ...params
    };

    const response = await apiClient.get<unknown>(API_ENDPOINTS.ADMIN.USERS, { params: requestParams });
    const normalized = normalizeBaseResponse<AdminRecord>(response, isMutableRecord);
    const pageResult = getRecord(normalized.data);
    const items = normalizeList(pageResult);
    
    // Map backend users to frontend AdminUserItem
    const mappedUsers = items.map((user) => {
      const lastLoginRaw = getValue(user, 'lastLoginAt', 'LastLoginAt');
      const fullName = getStringValue(getValue(user, 'fullName', 'FullName'));
      return {
        id: getStringValue(getValue(user, 'id', 'Id')),
        fullName,
        email: getStringValue(getValue(user, 'email', 'Email')),
        role: normalizeAdminUserRole(getValue(user, 'role', 'Role')),
        status: normalizeAdminUserStatus(getValue(user, 'status', 'Status')),
        verificationState: 'N/A' as const,
        createdAt: getStringValue(getValue(user, 'createdAt', 'CreatedAt'), 'N/A'),
        lastLoginAt: (() => {
          const normalized = getNumericValue(lastLoginRaw) ?? (typeof lastLoginRaw === 'string' ? lastLoginRaw : undefined);
          if (normalized === undefined) return null;
          const date = new Date(normalized);
          return Number.isNaN(date.getTime()) ? null : date.toISOString();
        })(),
        avatarUrl: getOptionalString(user, 'avatarUrl', 'AvatarUrl'),
        initials: fullName
          ? fullName.split(' ').map((namePart: string) => namePart[0]).join('').substring(0, 2).toUpperCase()
          : 'U'
      };
    });

    return {
      ...normalized,
      data: { 
        users: mappedUsers,
        totalUsers: getNumberValue(pageResult, 'totalItems', 'TotalItems') ?? 0,
        activeUsers: 0, 
        suspendedUsers: 0, 
        pendingVerify: 0,
        totalClients: 0,
        totalExperts: 0,
        reviewQueue: [],
        recentActions: [],
        
        pageIndex: getNumberValue(pageResult, 'pageIndex', 'PageIndex') ?? 1,
        pageSize: getNumberValue(pageResult, 'pageSize', 'PageSize') ?? 10,
        totalPages: getNumberValue(pageResult, 'totalPages', 'TotalPages') ?? 1,
        
        _isStub: false 
      }
    };
  },

  suspendUser: async (id: string, reason?: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<unknown>(`${API_ENDPOINTS.ADMIN.USERS}/${id}/suspend`, { reason });
    return normalizeBaseResponse<void>(response, isVoidPayload);
  },

  unsuspendUser: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<unknown>(`${API_ENDPOINTS.ADMIN.USERS}/${id}/unsuspend`);
    return normalizeBaseResponse<void>(response, isVoidPayload);
  },

  getExpertReviews: async (params?: Record<string, unknown>): Promise<BaseResponse<AdminExpertReviewsData & { _isStub?: boolean }>> => {
    const response = await apiClient.get<unknown>(API_ENDPOINTS.ADMIN.EXPERT_REVIEWS, { params });
    const normalized = normalizeBaseResponse<AdminRecord>(response, isMutableRecord);
    return {
      ...normalized,
      data: normalized.data ? { ...normalizeExpertReviewsData(normalized.data), _isStub: false } : null
    };
  },

  getExpertReviewDetail: async (id: string): Promise<BaseResponse<ExpertReviewDetail & { _isStub?: boolean }>> => {
    const response = await apiClient.get<unknown>(API_ENDPOINTS.ADMIN.EXPERT_REVIEW_DETAIL(id));
    const normalized = normalizeBaseResponse<ExpertReviewDetail>(response, isExpertReviewDetailPayload);
    return {
      ...normalized,
      data: normalized.data ? { ...normalized.data, _isStub: false } : null
    };
  },

  processExpertReview: async (params: ExpertReviewActionParams): Promise<BaseResponse<void>> => {
    const response = await apiClient.post<unknown>(API_ENDPOINTS.ADMIN.PROCESS_EXPERT_REVIEW(params.id), params);
    return normalizeBaseResponse<void>(response, isVoidPayload);
  }
};
