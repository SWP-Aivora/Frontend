/**
 * API Endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
  },
  USERS: {
    ME: '/users/me',
  },
  REVIEWS: {
    BASE: '/reviews',
    USER: (userId: string) => `/users/${userId}/reviews`,
  },
  JOBS: {
    BASE: '/jobs',
    ID: (id: string) => `/jobs/${id}`,
    PROPOSALS: (id: string) => `/jobs/${id}/proposals`,
  },
  AI: {
    JOB_ASSISTANT: '/ai/job-assistant',
    JOB_ASSISTANT_ID: (id: string) => `/ai/job-assistant/${id}`,
    JOB_ASSISTANT_REFINE: (id: string) => `/ai/job-assistant/${id}/refine`,
    JOB_ASSISTANT_ACCEPT: (id: string) => `/ai/job-assistant/${id}/accept`,
    SERVICE_GENERATOR: '/ai/service-generator',
  },
  PROJECTS: {
    BASE: '/projects',
    ID: (id: string) => `/projects/${id}`,
    MILESTONES: (id: string) => `/projects/${id}/milestones`,
    CANCEL: (id: string) => `/projects/${id}/cancel`,
  },
  MILESTONES: {
    BASE: '/milestones',
    ID: (id: string) => `/milestones/${id}`,
    FUND: (id: string) => `/milestones/${id}/fund`,
    APPROVE: (id: string) => `/milestones/${id}/approve`,
    REVISION: (id: string) => `/milestones/${id}/request-revision`,
    DELIVERABLES: (id: string) => `/milestones/${id}/deliverables`,
  },
  WALLET: {
    ME: '/wallet/me',
    HISTORY: '/payments/history',
    DEPOSIT_DEMO: '/wallet/deposit-demo',
  },
  PROFILES: {
    CLIENT: '/profiles/client',
    EXPERT: '/profiles/expert',
    EXPERT_BY_ID: (id: string) => `/profiles/expert/${id}`,
  },
  MEDIA: {
    UPLOAD_IMAGE: '/media/upload-image',
    UPLOAD_FILE: '/media/upload-file',
  },
  DISPUTES: {
    BASE: '/disputes',
    ID: (id: string | number) => `/disputes/${id}`,
    EVIDENCE: (id: string | number) => `/disputes/${id}/evidence`,
    RESOLVE: (id: string | number) => `/disputes/${id}/resolve`,
  },
  MESSAGES: {
    CONVERSATIONS: '/conversations',
    MESSAGES: (id: string) => `/conversations/${id}/messages`,
    READ: (id: string) => `/conversations/${id}/read`,
    INIT: '/conversations/init',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
  },
  ADMIN: {
    DASHBOARD_SUMMARY: '/admin/dashboard/summary',
    USERS: '/admin/users',
    EXPERT_REVIEWS: '/admin/expert-reviews',
    EXPERT_REVIEW_DETAIL: (id: string) => `/admin/expert-reviews/${id}`,
    PROCESS_EXPERT_REVIEW: (id: string) => `/admin/expert-reviews/${id}/process`,
  },
} as const;
