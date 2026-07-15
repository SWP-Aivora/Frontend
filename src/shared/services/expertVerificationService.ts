import api from '@/lib/axios';
import type { 
  ExpertVerification,
  GetVerificationsRequest,
  GetAdminVerificationsRequest,
  PaginatedVerificationsResponse,
  AdminReviewVerificationRequest 
} from '../types/expertVerification';


class ExpertVerificationService {
  /**
   * Uploads document (certificate/portfolio) for an expert's skill verification
   * @param expertSkillId The ID of the expert skill being verified
   * @param file The document file
   */
  async uploadVerification(expertSkillId: string, file: File): Promise<ExpertVerification> {
    const formData = new FormData();
    formData.append('expertSkillId', expertSkillId);
    formData.append('file', file);

    const { data } = await api.post<ExpertVerification>('/expert/verifications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  /**
   * Gets the expert's verification history
   */
  async getVerifications(params?: GetVerificationsRequest): Promise<PaginatedVerificationsResponse> {
    const { data } = await api.get<PaginatedVerificationsResponse>('/expert/verifications', { params });
    return data;
  }

  /**
   * Escalates a verification to human review if the expert disagrees with AI score
   */
  async escalateVerification(id: string): Promise<ExpertVerification> {
    const { data } = await api.post<ExpertVerification>(`/expert/verifications/${id}/escalate`);
    return data;
  }

  /**
   * (Admin) Gets all expert verifications with optional filtering
   */
  async getAdminVerifications(params?: GetAdminVerificationsRequest): Promise<PaginatedVerificationsResponse> {
    const { data } = await api.get<PaginatedVerificationsResponse>('/admin/expert-verifications', { params });
    return data;
  }

  /**
   * (Admin) Reviews and sets the final status of a verification
   */
  async reviewVerification(id: string, request: AdminReviewVerificationRequest): Promise<ExpertVerification> {
    const { data } = await api.put<ExpertVerification>(`/admin/expert-verifications/${id}/review`, request);
    return data;
  }
}

export const expertVerificationService = new ExpertVerificationService();
