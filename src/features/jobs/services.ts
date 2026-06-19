import apiClient from '@/lib/axios';
import type { Job, AiJobSuggestion, ExpertMatch, PatchAiJobSuggestionRequest } from './types';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';

export const jobService = {
  // Get all jobs (For Expert Job Board)
  getJobs: async (params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Job>> => {
    const response = await apiClient.get('/jobs', { params });
    return normalizePaginatedResponse<Job>(response);
  },

  // Get job details
  getJobById: async (id: string): Promise<BaseResponse<Job>> => {
    const response = await apiClient.get(`/jobs/${id}`);
    return normalizeBaseResponse<Job>(response);
  },

  // Get My Jobs (Client action)
  getMyJobs: async (): Promise<PaginatedResponse<Job>> => {
    /**
     * NOTE: Backend does not currently provide a dedicated /jobs/my or /users/me/jobs endpoint.
     * We fallback to the general /jobs endpoint. Backend logic may need to be updated to support
     * filtering by current user's identity if not already handled via token/interceptor.
     */
    const response = await apiClient.get('/jobs');
    return normalizePaginatedResponse<Job>(response);
  },

  // AI Job Assistant
  initAiJobAssistant: async (prompt: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.post<BaseResponse<AiJobSuggestion>>('/ai/job-assistant', { rawInput: prompt });
    return normalizeBaseResponse<AiJobSuggestion>(response);
  },

  getAiJobSuggestion: async (id: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.get<BaseResponse<AiJobSuggestion>>(`/ai/job-assistant/${id}`);
    return normalizeBaseResponse<AiJobSuggestion>(response);
  },

  refineAiJobSuggestion: async (id: string, prompt: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.post<BaseResponse<AiJobSuggestion>>(`/ai/job-assistant/${id}/refine`, { message: prompt });
    return normalizeBaseResponse<AiJobSuggestion>(response);
  },

  patchAiJobSuggestion: async (id: string, data: PatchAiJobSuggestionRequest): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.patch<BaseResponse<AiJobSuggestion>>(`/ai/job-assistant/${id}`, data);
    return normalizeBaseResponse<AiJobSuggestion>(response);
  },

  acceptAiJobSuggestion: async (id: string): Promise<BaseResponse<{ jobId: string }>> => {
    const response = await apiClient.post<BaseResponse<{ jobId: string }>>(`/ai/job-assistant/${id}/accept`);
    return normalizeBaseResponse<{ jobId: string }>(response);
  },

  // AI Recommendations
  generateRecommendations: async (jobId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.post(`/jobs/${jobId}/recommendations/generate`);
    return normalizeBaseResponse<void>(response);
  },

  getRecommendations: async (jobId: string): Promise<BaseResponse<ExpertMatch[]>> => {
    const response = await apiClient.get<BaseResponse<ExpertMatch[]>>(`/jobs/${jobId}/recommendations`);
    return normalizeBaseResponse<ExpertMatch[]>(response);
  },

};

