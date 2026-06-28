/**
 * API Endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    REFRESH_TOKEN: 'auth/refresh-token',
    ME: 'auth/me',
  },
  JOBS: {
    BASE: 'jobs',
    ID: (id: string) => `jobs/${id}`,
    PROPOSALS: (id: string) => `jobs/${id}/proposals`,
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
  },
  WALLET: {
    ME: 'wallet/me',
    TRANSACTIONS: 'wallet/transactions',
    PAYMENT_HISTORY: 'payments/history',
    DEPOSIT: 'wallet/deposit',
    VNPAY_DEPOSIT: 'wallet/vnpay/deposit',
    WITHDRAW: 'wallet/withdraw',
  },
  PROFILES: {
    CLIENT: 'profiles/client',
    EXPERT: 'profiles/expert',
    EXPERT_BY_ID: (id: string) => `profiles/expert/${id}`,
    FEATURED_EXPERTS: 'profiles/experts/featured',
    SEARCH_EXPERTS: 'profiles/experts/search',
  },
  MEDIA: {
    UPLOAD_IMAGE: 'media/upload-image',
    UPLOAD_FILE: 'media/upload-file',
  },
  USERS: {
    ME: 'users/me',
  },
  DISPUTES: {
    BASE: 'disputes',
    ID: (id: string | number) => `disputes/${id}`,
    EVIDENCE: (id: string | number) => `disputes/${id}/evidence`,
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
  ADMIN: {
    DASHBOARD_SUMMARY: 'admin/stats',
    USERS: 'admin/users',
    EXPERT_REVIEWS: 'admin/expert-reviews',
    EXPERT_REVIEW_DETAIL: (id: string) => `admin/expert-reviews/${id}`,
    PROCESS_EXPERT_REVIEW: (id: string) => `admin/expert-reviews/${id}/process`,
  },
} as const;
