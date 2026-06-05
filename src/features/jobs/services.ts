import apiClient from '@/lib/axios';
import type { Job, Proposal } from './types';
import type { CreateProposalFormValues } from './schema';
import type { BaseResponse } from '@/shared/types/api';

export const jobService = {
  // Get all jobs (For Expert Job Board)
  getJobs: async (params?: Record<string, string | number | boolean>): Promise<BaseResponse<Job[]>> => {
    const response = await apiClient.get<BaseResponse<Job[]>>('/jobs', { params });
    return response.data;
  },

  // Get job details
  getJobById: async (id: string): Promise<BaseResponse<Job>> => {
    const response = await apiClient.get<BaseResponse<Job>>(`/jobs/${id}`);
    return response.data;
  },

  // Submit a proposal (Expert action)
  submitProposal: async (jobId: string, data: Omit<CreateProposalFormValues, 'jobId'>): Promise<BaseResponse<Proposal>> => {
    const response = await apiClient.post<BaseResponse<Proposal>>(`/jobs/${jobId}/proposals`, data);
    return response.data;
  },

  // Get My Jobs (Client action)
  getMyJobs: async (): Promise<BaseResponse<Job[]>> => {
    const response = await apiClient.get<BaseResponse<Job[]>>('/jobs');
    return response.data;
  },

  // Proposal Management (Client actions)
  getProposalsByJobId: async (jobId: string): Promise<BaseResponse<Proposal[]>> => {
    const response = await apiClient.get<BaseResponse<Proposal[]>>(`/jobs/${jobId}/proposals`);
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

  // AI Recommendations
  generateRecommendations: async (jobId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.post<BaseResponse<void>>(`/jobs/${jobId}/recommendations/generate`);
    return response.data;
  },

  getRecommendations: async (jobId: string): Promise<BaseResponse<unknown[]>> => {
    const response = await apiClient.get<BaseResponse<unknown[]>>(`/jobs/${jobId}/recommendations`);
    return response.data;
  },
};
