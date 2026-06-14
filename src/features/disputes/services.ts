import type { AxiosError, AxiosResponse } from 'axios';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import type { 
  Dispute, 
  OpenDisputeRequest, 
  AddEvidenceRequest, 
  ResolveDisputeRequest,
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
      // Use any cast to allow normalizePaginatedResponse to handle the AxiosResponse correctly
      return normalizePaginatedResponse<Dispute>(response as AxiosResponse);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('[DisputeService] API Error:', {
        url: API_ENDPOINTS.DISPUTES.BASE,
        params,
        status: axiosError.response?.status,
        data: axiosError.response?.data
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
          const projectData = projectResponse.data?.data;
          
          if (projectData) {
            const milestone = projectData.milestones?.find((m: { id: string }) => m.id === beData.milestoneId);
            
            const mappedData: Dispute = {
              id: beData.id,
              projectId: beData.projectId,
              projectTitle: beData.projectTitle || projectData.title,
              milestoneId: beData.milestoneId,
              milestoneTitle: beData.milestoneTitle || milestone?.title || '',
              milestoneAmount: milestone?.amount,
              clientId: projectData.clientId,
              clientName: projectData.clientName,
              expertId: projectData.expertId,
              expertName: projectData.expertName,
              reason: beData.reason,
              description: beData.description,
              status: beData.status as DisputeStatus,
              resolutionType: beData.resolutionType as DisputeResolutionType,
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
              releaseAmount: beData.releaseAmount,
              refundAmount: beData.refundAmount,
            };
            
            return {
              ...baseResponse,
              data: mappedData
            };
          }
        } catch (projectErr) {
          console.warn('[DisputeService] Could not fetch project details for dispute enrichment:', projectErr);
        }

        // Fallback mapping if project fetch fails or is incomplete
        const fallbackData: Dispute = {
          id: beData.id,
          projectId: beData.projectId,
          projectTitle: beData.projectTitle || 'N/A',
          milestoneId: beData.milestoneId,
          milestoneTitle: beData.milestoneTitle || 'N/A',
          clientId: beData.openedBy,
          clientName: beData.openerName,
          expertId: beData.againstUserId,
          expertName: beData.againstUserName,
          reason: beData.reason,
          description: beData.description,
          status: beData.status as DisputeStatus,
          resolutionType: beData.resolutionType as DisputeResolutionType,
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
        };
        
        return {
          ...baseResponse,
          data: fallbackData
        };
      }
      
      return baseResponse as unknown as BaseResponse<Dispute>;
    } catch (error) {
      console.error('[DisputeService] Error in getDisputeById:', error);
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
