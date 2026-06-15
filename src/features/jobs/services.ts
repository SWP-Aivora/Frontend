import apiClient from '@/lib/axios';
import type { Job, Proposal, AiJobSuggestion, ExpertMatch, PatchAiJobSuggestionRequest } from './types';
import type { CreateProposalFormValues } from './schema';
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

  // Submit a proposal (Expert action)
  submitProposal: async (jobId: string, data: Omit<CreateProposalFormValues, 'jobId'>): Promise<BaseResponse<Proposal>> => {
    const response = await apiClient.post(`/jobs/${jobId}/proposals`, data);
    return normalizeBaseResponse<Proposal>(response);
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

  // Proposal Management (Client actions)
  getProposalsByJobId: async (jobId: string): Promise<PaginatedResponse<Proposal>> => {
    const response = await apiClient.get(`/jobs/${jobId}/proposals`);
    return normalizePaginatedResponse<Proposal>(response);
  },

  acceptProposal: async (proposalId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(`/proposals/${proposalId}/accept`);
    return normalizeBaseResponse<void>(response);
  },

  rejectProposal: async (proposalId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(`/proposals/${proposalId}/reject`);
    return normalizeBaseResponse<void>(response);
  },

  shortlistProposal: async (proposalId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(`/proposals/${proposalId}/shortlist`);
    return normalizeBaseResponse<void>(response);
  },

  // AI Job Assistant
  initAiJobAssistant: async (prompt: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.post<BaseResponse<AiJobSuggestion>>('/ai/job-assistant', { rawInput: prompt });
    return response.data;
  },

  getAiJobSuggestion: async (id: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.get<BaseResponse<AiJobSuggestion>>(`/ai/job-assistant/${id}`);
    return response.data;
  },

  refineAiJobSuggestion: async (id: string, prompt: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.post<BaseResponse<AiJobSuggestion>>(`/ai/job-assistant/${id}/refine`, { message: prompt });
    return response.data;
  },

  patchAiJobSuggestion: async (id: string, data: PatchAiJobSuggestionRequest): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.patch<BaseResponse<AiJobSuggestion>>(`/ai/job-assistant/${id}`, data);
    return response.data;
  },

  acceptAiJobSuggestion: async (id: string): Promise<BaseResponse<{ jobId: string }>> => {
    const response = await apiClient.post<BaseResponse<{ jobId: string }>>(`/ai/job-assistant/${id}/accept`);
    return response.data;
  },

  // AI Recommendations
  generateRecommendations: async (jobId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.post(`/jobs/${jobId}/recommendations/generate`);
    return normalizeBaseResponse<void>(response);
  },

  getRecommendations: async (jobId: string): Promise<BaseResponse<ExpertMatch[]>> => {
    const response = await apiClient.get<BaseResponse<ExpertMatch[]>>(`/jobs/${jobId}/recommendations`);
    return response.data;
  },

  // Expert specific
  getMyProposals: async (): Promise<PaginatedResponse<Proposal>> => {
    const response = await apiClient.get('/proposals/me');
    return normalizePaginatedResponse<Proposal>(response);
  },
};

