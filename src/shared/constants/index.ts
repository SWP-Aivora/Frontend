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
  DISPUTES: {
    BASE: '/api/v1/disputes',
    ID: (id: string | number) => `/api/v1/disputes/${id}`,
    EVIDENCE: (id: string | number) => `/api/v1/disputes/${id}/evidence`,
    RESOLVE: (id: string | number) => `/api/v1/disputes/${id}/resolve`,
  },
} as const;
