import type { AxiosError, AxiosResponse } from 'axios';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import type { 
  Dispute, 
  Evidence,
  OpenDisputeRequest, 
  AddEvidenceRequest, 
  ResolveDisputeRequest,
} from './types';
import {
  DisputeStatus,
  DisputeResolutionType
} from './types';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';

interface BEDisputeEvidenceResponse {
  id?: string;
  Id?: string;
  disputeId?: string;
  DisputeId?: string;
  submittedBy?: string;
  SubmittedBy?: string;
  submitterId?: string;
  SubmitterId?: string;
  submittedByName?: string;
  SubmittedByName?: string;
  submitterName?: string;
  SubmitterName?: string;
  content?: string;
  Content?: string;
  fileUrl?: string | null;
  FileUrl?: string | null;
  createdAt?: string;
  CreatedAt?: string;
}

interface BEDisputeResponse {
  id: string;
  projectId: string;
  projectTitle?: string;
  milestoneId: string;
  milestoneTitle?: string;
  openedBy: string;
  openerName: string;
  againstUserId: string;
  againstUserName: string;
  reason: string;
  description?: string | null;
  status: string;
  resolutionType?: string | null;
  resolutionNote?: string | null;
  resolvedAt?: string | null;
  evidence: BEDisputeEvidenceResponse[];
  createdAt: string;
  releaseAmount?: number | null;
  refundAmount?: number | null;
}

/**
 * Status Normalizers for Backend Compatibility (Enums can be numeric or string)
 */
export const normalizeDisputeStatus = (status: unknown): DisputeStatus => {
  if (typeof status === 'string') {
    const s = status.toUpperCase();
    if (Object.values(DisputeStatus).includes(s as DisputeStatus)) return s as DisputeStatus;
  }
  
  if (typeof status === 'number') {
    const map: Record<number, DisputeStatus> = {
      0: DisputeStatus.OPEN,
      1: DisputeStatus.UNDER_REVIEW,
      2: DisputeStatus.RESOLVED,
      3: DisputeStatus.CLOSED
    };
    return map[status] || DisputeStatus.OPEN;
  }
  
  return DisputeStatus.OPEN;
};

export const normalizeDisputeResolutionType = (type: unknown): DisputeResolutionType | null => {
  if (type === null || type === undefined) return null;
  
  if (typeof type === 'string') {
    const t = type.toUpperCase();
    if (Object.values(DisputeResolutionType).includes(t as DisputeResolutionType)) return t as DisputeResolutionType;
  }
  
  if (typeof type === 'number') {
    const map: Record<number, DisputeResolutionType> = {
      0: DisputeResolutionType.RELEASE_TO_EXPERT,
      1: DisputeResolutionType.REFUND_TO_CLIENT,
      2: DisputeResolutionType.SPLIT_PAYMENT,
      3: DisputeResolutionType.REQUEST_REVISION
    };
    return map[type] || null;
  }
  
  return null;
};

const getNumberValue = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return undefined;
};

const getStringValue = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
  }

  return '';
};

const getNullableStringValue = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === 'string') return value;
  }

  return null;
};

const mapEvidence = (evidence: BEDisputeEvidenceResponse, disputeId: string): Evidence => ({
  id: getStringValue(evidence.id, evidence.Id),
  disputeId: getStringValue(evidence.disputeId, evidence.DisputeId, disputeId),
  submitterId: getStringValue(evidence.submittedBy, evidence.SubmittedBy, evidence.submitterId, evidence.SubmitterId),
  submitterName: getStringValue(
    evidence.submittedByName,
    evidence.SubmittedByName,
    evidence.submitterName,
    evidence.SubmitterName,
    'Unknown'
  ),
  content: getStringValue(evidence.content, evidence.Content),
  fileUrl: getNullableStringValue(evidence.fileUrl, evidence.FileUrl),
  createdAt: getStringValue(evidence.createdAt, evidence.CreatedAt),
});

/**
 * Dispute Services
 */
export const disputeService = {
  /**
   * Get paginated disputes (Admin only)
   */
  async getDisputes(params: { PageIndex?: number; PageSize?: number; SearchTerm?: string }): Promise<PaginatedResponse<Dispute>> {
    try {
      // Clean up empty params
      const cleanParams: Record<string, string | number> = {};
      if (params.PageIndex) cleanParams.PageIndex = params.PageIndex;
      if (params.PageSize) cleanParams.PageSize = params.PageSize;
      if (params.SearchTerm?.trim()) cleanParams.SearchTerm = params.SearchTerm.trim();

      const response = await apiClient.get(API_ENDPOINTS.DISPUTES.BASE, { params: cleanParams });
      const paginated = normalizePaginatedResponse<BEDisputeResponse>(response as AxiosResponse);

      // Map backend response to frontend Dispute interface
      const items = paginated.data || [];
      const mappedItems = items.map(beData => ({
        id: beData.id,
        projectId: beData.projectId,
        projectTitle: beData.projectTitle || 'Unknown Project',
        milestoneId: beData.milestoneId,
        milestoneTitle: beData.milestoneTitle || 'General Milestone',
        reason: beData.reason,
        status: normalizeDisputeStatus(beData.status),
        createdAt: beData.createdAt,
        updatedAt: beData.createdAt,
        clientId: beData.openedBy || '',
        clientName: beData.openerName || 'Unknown',
        expertId: beData.againstUserId || '',
        expertName: beData.againstUserName || 'Unknown',
        openerId: beData.openedBy || '',
        openerName: beData.openerName,
        againstUserName: beData.againstUserName,
        evidences: [], // List view doesn't need evidence
      } as Dispute));

      return {
        ...paginated,
        data: mappedItems
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('[DisputeService] getDisputes failed', {
        status: axiosError.response?.status,
        message: 'Failed to fetch disputes.'
      });
      
      throw error;
    }
  },

  /**
   * Get dispute details by ID
   */
  async getDisputeById(id: string): Promise<BaseResponse<Dispute>> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DISPUTES.ID(id));
      const baseResponse = normalizeBaseResponse<BEDisputeResponse>(response);
      
      if (baseResponse.success && baseResponse.data) {
        const beData = baseResponse.data;
        
        // Try to fetch project to get enriched details (client/expert names, milestone amount)
        try {
          const projectResponse = await apiClient.get(API_ENDPOINTS.PROJECTS.ID(beData.projectId));
          const projectBaseResponse = normalizeBaseResponse<Record<string, unknown>>(projectResponse);
          const projectData = projectBaseResponse.data;

          if (!projectBaseResponse.success || !projectData) {
            throw new Error('Could not fetch project details for enrichment.');
          }

          if (projectData) {
            const rawMilestones = projectData.milestones ?? projectData.Milestones;
            const milestone = Array.isArray(rawMilestones)
              ? (rawMilestones as Record<string, unknown>[]).find((m) => (m.id ?? m.Id) === beData.milestoneId)
              : undefined;
            const milestoneAmount = getNumberValue(
              milestone?.amount,
              milestone?.Amount,
              milestone?.totalAmount,
              milestone?.TotalAmount
            );
            
            const mappedData: Dispute = {
              id: beData.id,
              projectId: beData.projectId,
              projectTitle: (beData.projectTitle || projectData.title || 'Unknown Project') as string,
              milestoneId: beData.milestoneId,
              milestoneTitle: (beData.milestoneTitle || milestone?.title || milestone?.Title || 'General Milestone') as string,
              milestoneAmount: milestoneAmount ?? 0,
              clientId: (projectData.clientId || beData.openedBy || '') as string,
              clientName: (projectData.clientName || beData.openerName || 'Unknown Client') as string,
              expertId: (projectData.expertId || beData.againstUserId || '') as string,
              expertName: (projectData.expertName || beData.againstUserName || 'Unknown Expert') as string,
              openerId: beData.openedBy,
              openerName: beData.openerName,
              againstUserName: beData.againstUserName,
              reason: beData.reason,
              description: beData.description,
              status: normalizeDisputeStatus(beData.status),
              resolutionType: normalizeDisputeResolutionType(beData.resolutionType),
              resolutionNote: beData.resolutionNote,
              evidences: (beData.evidence || []).map((e) => mapEvidence(e, beData.id)),
              createdAt: beData.createdAt,
              updatedAt: beData.createdAt,
              resolvedAt: beData.resolvedAt,
              releaseAmount: Number(beData.releaseAmount || 0),
              refundAmount: Number(beData.refundAmount || 0),
            };
            
            return {
              ...baseResponse,
              data: mappedData
            };
          }
        } catch (projectErr) {
          const axiosError = projectErr as AxiosError;
          console.error('[DisputeService] Enrichment failed: fetchProjectDetailsForDisputeEnrichment', {
            disputeId: id,
            projectId: beData.projectId,
            status: axiosError.response?.status,
            message: 'Could not fetch project details for enrichment.'
          });
          throw projectErr; // Rethrow to surface enrichment failure instead of silently faking data
        }
      }
      
      return baseResponse as unknown as BaseResponse<Dispute>;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('[DisputeService] getDisputeById failed', {
        disputeId: id,
        status: axiosError.response?.status,
        message: 'Failed to retrieve dispute details.'
      });
      throw error;
    }
  },

  /**
   * Open a new dispute for a milestone
   */
  async openDispute(data: OpenDisputeRequest): Promise<BaseResponse<Dispute>> {
    const response = await apiClient.post(API_ENDPOINTS.DISPUTES.BASE, data);
    return normalizeBaseResponse<Dispute>(response);
  },

  /**
   * Add evidence to an existing dispute
   */
  async addEvidence(disputeId: string, data: AddEvidenceRequest): Promise<BaseResponse<void>> {
    const response = await apiClient.post(API_ENDPOINTS.DISPUTES.EVIDENCE(disputeId), data);
    return normalizeBaseResponse<void>(response);
  },

  /**
   * Get evidence for an existing dispute.
   */
  async getEvidence(disputeId: string): Promise<BaseResponse<Evidence[]>> {
    const response = await apiClient.get(API_ENDPOINTS.DISPUTES.EVIDENCE(disputeId));
    const normalized = normalizePaginatedResponse<BEDisputeEvidenceResponse>(response);

    return {
      success: normalized.success,
      message: normalized.message,
      statusCode: normalized.statusCode,
      data: (normalized.data ?? []).map((evidence) => mapEvidence(evidence, disputeId)),
    };
  },

  /**
   * Resolve a dispute (Admin only)
   */
  async resolveDispute(disputeId: string, data: ResolveDisputeRequest): Promise<BaseResponse<void>> {
    const response = await apiClient.put(API_ENDPOINTS.DISPUTES.RESOLVE(disputeId), data);
    return normalizeBaseResponse<void>(response);
  },
};
