import type { AxiosError, AxiosResponse } from 'axios';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import type { 
  Dispute, 
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
  id: string;
  submittedBy: string;
  submittedByName: string;
  content: string;
  fileUrl?: string | null;
  createdAt: string;
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
            const milestone = (projectData.milestones as Record<string, unknown>[])?.find((m) => m.id === beData.milestoneId);
            
            const mappedData: Dispute = {
              id: beData.id,
              projectId: beData.projectId,
              projectTitle: (beData.projectTitle || projectData.title || 'Unknown Project') as string,
              milestoneId: beData.milestoneId,
              milestoneTitle: (beData.milestoneTitle || milestone?.title || 'General Milestone') as string,
              milestoneAmount: (milestone?.amount as number) || beData.releaseAmount || beData.refundAmount || 0,
              clientId: (projectData.clientId || beData.openedBy || '') as string,
              clientName: (projectData.clientName || beData.openerName || 'Unknown Client') as string,
              expertId: (projectData.expertId || beData.againstUserId || '') as string,
              expertName: (projectData.expertName || beData.againstUserName || 'Unknown Expert') as string,
              openerName: beData.openerName,
              againstUserName: beData.againstUserName,
              reason: beData.reason,
              description: beData.description,
              status: normalizeDisputeStatus(beData.status),
              resolutionType: normalizeDisputeResolutionType(beData.resolutionType),
              resolutionNote: beData.resolutionNote,
              evidences: (beData.evidence || []).map((e) => ({
                id: e.id,
                disputeId: beData.id,
                submitterId: e.submittedBy,
                submitterName: e.submittedByName,
                content: e.content,
                fileUrl: e.fileUrl,
                createdAt: e.createdAt,
              })),
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
   * Resolve a dispute (Admin only)
   */
  async resolveDispute(disputeId: string, data: ResolveDisputeRequest): Promise<BaseResponse<void>> {
    const response = await apiClient.put(API_ENDPOINTS.DISPUTES.RESOLVE(disputeId), data);
    return normalizeBaseResponse<void>(response);
  },
};

