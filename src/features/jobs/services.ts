import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { Job, Proposal, AiJobSuggestion, ExpertMatch, PatchAiJobSuggestionRequest } from './types';
import type { CreateProposalFormValues } from './schema';
import type { BaseResponse } from '@/shared/types/api';

export const jobService = {
  // Get all jobs (For Expert Job Board)
  getJobs: async (params?: Record<string, string | number | boolean>): Promise<BaseResponse<Job[]>> => {
    const response = await apiClient.get<BaseResponse<Job[]>>(API_ENDPOINTS.JOBS.BASE, { params });
    return response.data;
  },

  // Get job details
  getJobById: async (id: string): Promise<BaseResponse<Job>> => {
    const response = await apiClient.get<BaseResponse<Job>>(API_ENDPOINTS.JOBS.ID(id));
    return response.data;
  },

  // Submit a proposal (Expert action)
  submitProposal: async (jobId: string, data: Omit<CreateProposalFormValues, 'jobId'>): Promise<BaseResponse<Proposal>> => {
    const response = await apiClient.post<BaseResponse<Proposal>>(API_ENDPOINTS.JOBS.PROPOSALS(jobId), data);
    return response.data;
  },

  // Get My Jobs (Client action)
  getMyJobs: async (): Promise<BaseResponse<Job[]>> => {
    const response = await apiClient.get<BaseResponse<Job[]>>(API_ENDPOINTS.JOBS.BASE);
    return response.data;
  },

  // Proposal Management (Client actions)
  getProposalsByJobId: async (jobId: string): Promise<BaseResponse<Proposal[]>> => {
    const response = await apiClient.get<BaseResponse<Proposal[]>>(API_ENDPOINTS.JOBS.PROPOSALS(jobId));
    return response.data;
  },

  acceptProposal: async (proposalId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`/proposals/${proposalId}/accept`);
    return response.data;
  },

  rejectProposal: async (proposalId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`/proposals/${proposalId}/reject`);
    return response.data;
  },

  shortlistProposal: async (proposalId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`/proposals/${proposalId}/shortlist`);
    return response.data;
  },

  // AI Job Assistant
  initAiJobAssistant: async (prompt: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.post<BaseResponse<AiJobSuggestion>>(API_ENDPOINTS.AI.JOB_ASSISTANT, { rawInput: prompt });
    return response.data;
  },

  getAiJobSuggestion: async (id: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.get<BaseResponse<AiJobSuggestion>>(API_ENDPOINTS.AI.JOB_ASSISTANT_ID(id));
    return response.data;
  },

  refineAiJobSuggestion: async (id: string, prompt: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.post<BaseResponse<AiJobSuggestion>>(API_ENDPOINTS.AI.JOB_ASSISTANT_REFINE(id), { message: prompt });
    return response.data;
  },

  patchAiJobSuggestion: async (id: string, data: PatchAiJobSuggestionRequest): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.patch<BaseResponse<AiJobSuggestion>>(API_ENDPOINTS.AI.JOB_ASSISTANT_ID(id), data);
    return response.data;
  },

  acceptAiJobSuggestion: async (id: string): Promise<BaseResponse<{ jobId: string }>> => {
    const response = await apiClient.post<BaseResponse<{ jobId: string }>>(API_ENDPOINTS.AI.JOB_ASSISTANT_ACCEPT(id));
    return response.data;
  },

  // AI Recommendations
  generateRecommendations: async (jobId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.post<BaseResponse<void>>(`${API_ENDPOINTS.JOBS.ID(jobId)}/recommendations/generate`);
    return response.data;
  },

  getRecommendations: async (jobId: string): Promise<BaseResponse<ExpertMatch[]>> => {
    const response = await apiClient.get<BaseResponse<ExpertMatch[]>>(`${API_ENDPOINTS.JOBS.ID(jobId)}/recommendations`);
    return response.data;
  },

  // Expert specific
  getMyProposals: async (): Promise<BaseResponse<Proposal[]>> => {
    const response = await apiClient.get<BaseResponse<Proposal[]>>('/proposals/me');
    return response.data;
  },
};
