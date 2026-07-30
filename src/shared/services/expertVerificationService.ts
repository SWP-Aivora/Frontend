import api from '@/lib/axios';
import { normalizeBaseResponse, normalizePaginatedResponse } from '@/lib/api-utils';
import type {
  ExpertVerification,
  GetVerificationsRequest,
  GetAdminVerificationsRequest,
  PaginatedVerificationsResponse,
  AdminReviewVerificationRequest
} from '../types/expertVerification';
import type { BaseResponse } from '@/shared/types/api';


class ExpertVerificationService {
  /**
   * Uploads document (certificate/portfolio) for an expert's skill verification
   * @param expertSkillId The ID of the expert skill being verified
   * @param file The document file
   */
  async uploadVerification(expertSkillId: string, file: File): Promise<BaseResponse<ExpertVerification>> {
    const formData = new FormData();
    formData.append('expertSkillId', expertSkillId);
    formData.append('file', file);

    const response = await api.post('/expert/verifications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return normalizeBaseResponse<ExpertVerification>(response);
  }

  /**
   * Gets the expert's verification history
   */
  async getVerifications(params?: GetVerificationsRequest): Promise<PaginatedVerificationsResponse> {
    const response = await api.get('/expert/verifications', { params });
    return normalizePaginatedResponse<ExpertVerification>(response);
  }

  /**
   * Escalates a verification to human review if the expert disagrees with AI score
   */
  async escalateVerification(id: string): Promise<BaseResponse<ExpertVerification>> {
    const response = await api.post(`/expert/verifications/${id}/escalate`);
    return normalizeBaseResponse<ExpertVerification>(response);
  }

  /**
   * (Admin) Gets all expert verifications with optional filtering
   */
  async getAdminVerifications(params?: GetAdminVerificationsRequest): Promise<PaginatedVerificationsResponse> {
    const response = await api.get('/admin/expert-verifications', { params });
    return normalizePaginatedResponse<ExpertVerification>(response);
  }

  /**
   * (Admin) Reviews and sets the final status of a verification
   */
  async reviewVerification(id: string, request: AdminReviewVerificationRequest): Promise<BaseResponse<ExpertVerification>> {
    const response = await api.put(`/admin/expert-verifications/${id}/review`, request);
    return normalizeBaseResponse<ExpertVerification>(response);
  }
}

export const expertVerificationService = new ExpertVerificationService();
