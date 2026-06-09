import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import type { 
  Dispute, 
  OpenDisputeRequest, 
  AddEvidenceRequest, 
  ResolveDisputeRequest 
} from './types';

/**
 * Dispute Services
 */
export const disputeService = {
  /**
   * Get paginated disputes (Admin only)
   */
  async getDisputes(params: { PageIndex?: number; PageSize?: number; SearchTerm?: string }): Promise<PaginatedResponse<Dispute>> {
    const response = await apiClient.get(API_ENDPOINTS.DISPUTES.BASE, { params });
    return response.data;
  },

  /**
   * Get dispute details by ID
   */
  async getDisputeById(id: string): Promise<BaseResponse<Dispute>> {
    const response = await apiClient.get(API_ENDPOINTS.DISPUTES.ID(id));
    return response.data;
  },

  /**
   * Open a new dispute for a milestone
   */
  async openDispute(data: OpenDisputeRequest): Promise<BaseResponse<Dispute>> {
    const response = await apiClient.post(API_ENDPOINTS.DISPUTES.BASE, data);
    return response.data;
  },

  /**
   * Add evidence to an existing dispute
   */
  async addEvidence(disputeId: string, data: AddEvidenceRequest): Promise<BaseResponse<void>> {
    const response = await apiClient.post(API_ENDPOINTS.DISPUTES.EVIDENCE(disputeId), data);
    return response.data;
  },

  /**
   * Resolve a dispute (Admin only)
   */
  async resolveDispute(disputeId: string, data: ResolveDisputeRequest): Promise<BaseResponse<void>> {
    const response = await apiClient.put(API_ENDPOINTS.DISPUTES.RESOLVE(disputeId), data);
    return response.data;
  },
};
