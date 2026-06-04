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
  // Assuming the backend filters by the logged-in user when hitting /jobs, or we pass clientId
  getMyJobs: async (): Promise<BaseResponse<Job[]>> => {
    const response = await apiClient.get<BaseResponse<Job[]>>('/jobs');
    return response.data;
  },
};
