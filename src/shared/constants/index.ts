/**
 * API Endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH_TOKEN: '/api/v1/auth/refresh-token',
    ME: '/api/v1/auth/me',
  },
  JOBS: {
    BASE: '/api/v1/jobs',
    ID: (id: string) => `/api/v1/jobs/${id}`,
    PROPOSALS: (id: string) => `/api/v1/jobs/${id}/proposals`,
  },
  PROJECTS: {
    BASE: '/api/v1/projects',
    ID: (id: string) => `/api/v1/projects/${id}`,
    MILESTONES: (id: string) => `/api/v1/projects/${id}/milestones`,
    CANCEL: (id: string) => `/api/v1/projects/${id}/cancel`,
  },
  MILESTONES: {
    BASE: '/api/v1/milestones',
    ID: (id: string) => `/api/v1/milestones/${id}`,
    FUND: (id: string) => `/api/v1/milestones/${id}/fund`,
    APPROVE: (id: string) => `/api/v1/milestones/${id}/approve`,
    REVISION: (id: string) => `/api/v1/milestones/${id}/request-revision`,
    DELIVERABLES: (id: string) => `/api/v1/milestones/${id}/deliverables`,
  },
  WALLET: {
    ME: '/api/v1/wallet/me',
    HISTORY: '/api/v1/payments/history',
    DEPOSIT_DEMO: '/api/v1/wallet/deposit-demo',
  },
  PROFILES: {
    CLIENT: '/api/v1/profiles/client',
    EXPERT: '/api/v1/profiles/expert',
    EXPERT_BY_ID: (id: string) => `/api/v1/profiles/expert/${id}`,
  },
  MEDIA: {
    UPLOAD_IMAGE: '/api/v1/media/upload-image',
    UPLOAD_FILE: '/api/v1/media/upload-file',
  },
  USERS: {
    ME: '/api/v1/users/me',
  },
  DISPUTES: {
    BASE: '/api/v1/disputes',
    ID: (id: string | number) => `/api/v1/disputes/${id}`,
    EVIDENCE: (id: string | number) => `/api/v1/disputes/${id}/evidence`,
    RESOLVE: (id: string | number) => `/api/v1/disputes/${id}/resolve`,
  },
  MESSAGES: {
    CONVERSATIONS: '/api/v1/conversations',
    MESSAGES: (id: string) => `/api/v1/conversations/${id}/messages`,
    READ: (id: string) => `/api/v1/conversations/${id}/read`,
    INIT: '/api/v1/conversations/init',
  },
  NOTIFICATIONS: {
    BASE: '/api/v1/notifications',
    UNREAD_COUNT: '/api/v1/notifications/unread-count',
    READ: (id: string) => `/api/v1/notifications/${id}/read`,
    READ_ALL: '/api/v1/notifications/read-all',
  },
  ADMIN: {
    DASHBOARD_SUMMARY: '/api/v1/admin/stats',
    USERS: '/api/v1/admin/users',
    EXPERT_REVIEWS: '/api/v1/admin/expert-reviews',
    EXPERT_REVIEW_DETAIL: (id: string) => `/api/v1/admin/expert-reviews/${id}`,
    PROCESS_EXPERT_REVIEW: (id: string) => `/api/v1/admin/expert-reviews/${id}/process`,
  },
} as const;
