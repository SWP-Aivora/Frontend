import apiClient from '@/lib/axios';
import type { Proposal } from './types';
import type { CreateProposalFormValues } from './schema';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';

export const proposalService = {
  /**
   * Submit a proposal for a job
   * @param jobId - The ID of the job to submit proposal for
   * @param data - Proposal data (cover letter, budget, milestones)
   * @returns Promise<BaseResponse<Proposal>> - The created proposal
   * @throws API error if submission fails
   */
  submitProposal: async (jobId: string, data: Omit<CreateProposalFormValues, 'jobId'>): Promise<BaseResponse<Proposal>> => {
    const response = await apiClient.post(`/jobs/${jobId}/proposals`, data);
    return normalizeBaseResponse<Proposal>(response);
  },

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

  getMyProposals: async (): Promise<PaginatedResponse<Proposal>> => {
    const response = await apiClient.get('/proposals/me');
    return normalizePaginatedResponse<Proposal>(response);
  },
};
