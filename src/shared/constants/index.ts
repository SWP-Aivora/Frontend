/**
 * API Endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    REFRESH_TOKEN: 'auth/refresh-token',
    LOGOUT: 'auth/logout',
    ME: 'auth/me',
  },
  JOBS: {
    BASE: 'jobs',
    ID: (id: string) => `jobs/${id}`,
    PROPOSALS: (id: string) => `jobs/${id}/proposals`,
  },
  SERVICES: {
    BASE: 'services',
    ID: (id: string) => `services/${id}`,
    MINE: 'services/mine',
    PUBLISH: (id: string) => `services/${id}/publish`,
    UNPUBLISH: (id: string) => `services/${id}/unpublish`,
    REQUESTS: (id: string) => `services/${id}/requests`,
    EXPERT_REQUESTS: 'experts/me/service-requests',
    ACCEPT_REQUEST: (id: string) => `service-requests/${id}/accept`,
    DECLINE_REQUEST: (id: string) => `service-requests/${id}/decline`,
    OFFERS: (requestId: string) => `service-requests/${requestId}/offers`,
    ACCEPT_OFFER: (offerId: string) => `service-offers/${offerId}/accept`,
  },
  AI: {
    SERVICE_GENERATOR: 'ai/service-generator',
  },
  PROJECTS: {
    BASE: 'projects',
    ID: (id: string) => `projects/${id}`,
    MILESTONES: (id: string) => `projects/${id}/milestones`,
    CANCEL: (id: string) => `projects/${id}/cancel`,
  },
  MILESTONES: {
    BASE: 'milestones',
    ID: (id: string) => `milestones/${id}`,
    FUND: (id: string) => `milestones/${id}/fund`,
    APPROVE: (id: string) => `milestones/${id}/approve`,
    REVISION: (id: string) => `milestones/${id}/request-revision`,
    DELIVERABLES: (id: string) => `milestones/${id}/deliverables`,
    STEPS: (id: string) => `milestones/${id}/steps`,
    STEPS_REORDER: (id: string) => `milestones/${id}/steps/reorder`,
    STEPS_SUGGEST: (id: string) => `milestones/${id}/steps/suggest`,
  },
  STEPS: {
    ID: (id: string) => `steps/${id}`,
    STATUS: (id: string) => `steps/${id}/status`,
  },
  WALLET: {
    ME: 'wallet/me',
    TRANSACTIONS: 'wallet/transactions',
    PAYMENT_HISTORY: 'payments/history',
    DEPOSIT: 'wallet/deposit',
    DEPOSIT_DEMO: 'wallet/deposit-demo',
    VNPAY_DEPOSIT: 'wallet/vnpay/deposit',
    WITHDRAW: 'wallet/withdraw',
    TRANSFER: (expertId: string) => `wallet/transfer/${expertId}`,
  },
  PROFILES: {
    CLIENT: 'profiles/client',
    EXPERT: 'profiles/expert',
    EXPERT_BY_ID: (id: string) => `profiles/expert/${id}`,
    EXPERT_COMPLETED_PROJECTS: (id: string) => `profiles/expert/${id}/completed-projects`,
    FEATURED_EXPERTS: 'profiles/experts/featured',
    SEARCH_EXPERTS: 'profiles/experts/search',
  },
  MEDIA: {
    BASE: 'media',
    UPLOAD_IMAGE: 'media/upload-image',
    UPLOAD_FILE: 'media/upload-file',
    DELETE: (publicId: string) => `media/${publicId}`,
  },
  USERS: {
    ME: 'users/me',
  },
  DISPUTES: {
    BASE: 'disputes',
    ID: (id: string | number) => `disputes/${id}`,
    CLOSE: (id: string | number) => `disputes/${id}/close`,
    RESOLVE: (id: string | number) => `disputes/${id}/resolve`,
  },
  MESSAGES: {
    CONVERSATIONS: 'conversations',
    MESSAGES: (id: string) => `conversations/${id}/messages`,
    READ: (id: string) => `conversations/${id}/read`,
    INIT: 'conversations/init',
    CHAT_HUB: 'chat',
  },
  PROPOSALS: {
    ID: (id: string) => `proposals/${id}`,
    ACCEPT: (id: string) => `proposals/${id}/accept`,
    REJECT: (id: string) => `proposals/${id}/reject`,
    SHORTLIST: (id: string) => `proposals/${id}/shortlist`,
    UNSHORTLIST: (id: string) => `proposals/${id}/unshortlist`,
    WITHDRAW: (id: string) => `proposals/${id}/withdraw`,
    RESUBMIT: (id: string) => `proposals/${id}/resubmit`,
    ME: 'proposals/me',
  },
  NOTIFICATIONS: {
    BASE: 'notifications',
    UNREAD_COUNT: 'notifications/unread-count',
    READ: (id: string) => `notifications/${id}/read`,
    READ_ALL: 'notifications/read-all',
  },
  CATEGORIES: {
    BASE: 'categories',
    ID: (id: string) => `categories/${id}`,
  },
  SKILLS: {
    BASE: 'skills',
    ID: (id: string) => `skills/${id}`,
  },
  ADMIN: {
    DASHBOARD_SUMMARY: 'admin/stats',
    USERS: 'admin/users',
    EXPERT_REVIEWS: 'admin/expert-profile-updates',
    EXPERT_REVIEW_DETAIL: (id: string) => `admin/expert-profile-updates/${id}`,
    PROCESS_EXPERT_REVIEW: (id: string) => `admin/expert-profile-updates/${id}/review`,
  },
} as const;

export const QUERY_KEYS = {
  JOBS: {
    DETAIL: (id: string) => ['job', id] as const,
    PROPOSALS: (id: string) => ['proposals', id] as const,
    PROPOSAL_COUNT: (id: string) => ['proposals', id, 'count'] as const,
  },
  SERVICES: {
    DETAIL: (id: string) => ['service', id] as const,
    NEW: ['service', 'new'] as const,
    MINE: ['services', 'mine'] as const,
    SERVICE_REQUESTS: (serviceId: string) => ['services', serviceId, 'requests'] as const,
    EXPERT_REQUESTS: (status?: string) => ['services', 'expert-requests', status ?? 'all'] as const,
  },
  MEDIA: {
    LIST: ['media', 'list'] as const,
  },
} as const;

export const REFETCH_INTERVALS = {
  REALTIME_FAST: 5000,
  REALTIME_SLOW: 10000,
  BACKGROUND_SUMMARY: 60000,
} as const;
