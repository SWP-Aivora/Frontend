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
type ProposalApiRecord = Record<string, unknown>;

const getString = (value: unknown, fallback = ''): string => (
  typeof value === 'string' ? value : fallback
);

const getOptionalString = (value: unknown): string | undefined => (
  typeof value === 'string' ? value : undefined
);

const getNumber = (value: unknown, fallback = 0): number => (
  typeof value === 'number' ? value : fallback
);

const getNullableNumber = (value: unknown): number | null => (
  typeof value === 'number' ? value : null
);

const normalizeProposalMilestone = (item: ProposalApiRecord): Proposal['milestones'][number] => ({
  id: getString(item.id ?? item.Id),
  title: getString(item.title ?? item.Title),
  description: getString(item.description ?? item.Description, '') || null,
  amount: getNumber(item.amount ?? item.Amount),
  dueDays: getNumber(item.dueDays ?? item.DueDays),
  acceptanceCriteria: getString(item.acceptanceCriteria ?? item.AcceptanceCriteria, '') || null,
  orderIndex: getNumber(item.orderIndex ?? item.OrderIndex),
});

const normalizeProposal = (item: ProposalApiRecord): Proposal => {
  const rawMilestones = item.milestones ?? item.Milestones;

  return {
    id: getString(item.id ?? item.Id),
    jobId: getString(item.jobId ?? item.JobId),
    jobTitle: getOptionalString(item.jobTitle ?? item.JobTitle),
    expertId: getString(item.expertId ?? item.ExpertId),
    expertName: getOptionalString(item.expertName ?? item.ExpertName),
    coverLetter: getString(item.coverLetter ?? item.CoverLetter),
    proposedBudget: getNumber(item.proposedBudget ?? item.ProposedBudget),
    proposedTimelineDays: getNullableNumber(item.proposedTimelineDays ?? item.ProposedTimelineDays),
    currency: getOptionalString(item.currency ?? item.Currency),
    status: (item.status ?? item.Status ?? item.proposalStatus ?? item.ProposalStatus ?? 0) as Proposal['status'],
    createdAt: getOptionalString(item.createdAt ?? item.CreatedAt),
    submittedAt: getOptionalString(item.submittedAt ?? item.SubmittedAt),
    milestones: Array.isArray(rawMilestones)
      ? rawMilestones.map((milestone) => normalizeProposalMilestone(milestone as ProposalApiRecord))
      : [],
    expert: (item.expert ?? item.Expert) as Proposal['expert'],
  };
};

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
    const normalized = normalizeBaseResponse<ProposalApiRecord>(response);

    return {
      ...normalized,
      data: normalized.data ? normalizeProposal(normalized.data) : null,
    };
  },

  getProposalsByJobId: async (jobId: string): Promise<PaginatedResponse<Proposal>> => {
    const response = await apiClient.get(`/jobs/${jobId}/proposals`);
    const normalized = normalizePaginatedResponse<ProposalApiRecord>(response);

    return {
      ...normalized,
      data: (normalized.data ?? []).map(normalizeProposal),
    };
  },

  getProposalById: async (proposalId: string): Promise<BaseResponse<Proposal>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROPOSALS.ID(proposalId));
    const normalized = normalizeBaseResponse<ProposalApiRecord>(response);

    return {
      ...normalized,
      data: normalized.data ? normalizeProposal(normalized.data) : null,
    };
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
    const normalized = normalizePaginatedResponse<ProposalApiRecord>(response);

    return {
      ...normalized,
      data: (normalized.data ?? []).map(normalizeProposal),
    };
  },
};
