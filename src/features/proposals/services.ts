// Cấu hình các hàm gọi API (axios) liên quan đến việc nộp đơn (Proposal) và xét duyệt
import apiClient from '@/lib/axios';
import type { Proposal } from './types';
import type { CreateProposalFormValues } from './schema';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';
import { API_ENDPOINTS } from '@/shared/constants';

export interface AcceptProposalResult {
  projectId: string;
  jobId: string;
  acceptedProposalId: string;
  status: string;
}

type AcceptProposalResultRecord = Record<string, unknown>;

const getString = (value: unknown, fallback = ''): string => (
  typeof value === 'string' ? value : fallback
);

const normalizeAcceptProposalResult = (data: AcceptProposalResultRecord): AcceptProposalResult => ({
  projectId: getString(data.projectId ?? data.ProjectId),
  jobId: getString(data.jobId ?? data.JobId),
  acceptedProposalId: getString(data.acceptedProposalId ?? data.AcceptedProposalId),
  status: getString(data.status ?? data.Status),
});

export const proposalService = {
  /**
   * Submit a proposal for a job
   * @param jobId - The ID of the job to submit proposal for
   * @param data - Proposal data (cover letter, budget, milestones)
   * @returns Promise<BaseResponse<Proposal>> - The created proposal
   * @throws API error if submission fails
   */
  submitProposal: async (jobId: string, data: CreateProposalFormValues): Promise<BaseResponse<Proposal>> => {
    const response = await apiClient.post(`/jobs/${jobId}/proposals`, data);
    return normalizeBaseResponse<Proposal>(response);
  },

  getProposalsByJobId: async (jobId: string): Promise<PaginatedResponse<Proposal>> => {
    const response = await apiClient.get(`/jobs/${jobId}/proposals`);
    return normalizePaginatedResponse<Proposal>(response);
  },

  getProposalById: async (proposalId: string): Promise<BaseResponse<Proposal>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROPOSALS.ID(proposalId));
    return normalizeBaseResponse<Proposal>(response);
  },

  acceptProposal: async (proposalId: string): Promise<BaseResponse<AcceptProposalResult>> => {
    const response = await apiClient.put(API_ENDPOINTS.PROPOSALS.ACCEPT(proposalId));
    const normalized = normalizeBaseResponse<AcceptProposalResultRecord>(response);

    return {
      ...normalized,
      data: normalized.data ? normalizeAcceptProposalResult(normalized.data) : null,
    };
  },

  rejectProposal: async (proposalId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(API_ENDPOINTS.PROPOSALS.REJECT(proposalId));
    return normalizeBaseResponse<void>(response);
  },

  shortlistProposal: async (proposalId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(API_ENDPOINTS.PROPOSALS.SHORTLIST(proposalId));
    return normalizeBaseResponse<void>(response);
  },

  getMyProposals: async (): Promise<PaginatedResponse<Proposal>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROPOSALS.ME);
    return normalizePaginatedResponse<Proposal>(response);
  },
};
