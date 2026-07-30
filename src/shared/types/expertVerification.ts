import type { PaginatedResponse } from '@/shared/types/api';

export const VerificationStatus = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  ESCALATED: 'ESCALATED'
} as const;

export type VerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];

export interface ExpertVerification {
  id: string;
  expertSkillId: string;
  expertId: string;
  evidenceFileUrl: string;
  status: VerificationStatus;
  aiConfidenceScore: number | null;
  aiReasoning: string | null;
  adminDecisionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  canEscalate: boolean;

  // Optional expanded fields for UI
  skillName?: string;
  expertName?: string | null;
}

export interface GetVerificationsRequest {
  expertSkillId?: string;
  status?: VerificationStatus;
  pageIndex?: number;
  pageSize?: number;
}

export interface GetAdminVerificationsRequest {
  status?: VerificationStatus | 'All';
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}

export type PaginatedVerificationsResponse = PaginatedResponse<ExpertVerification>;

export interface AdminReviewVerificationRequest {
  isApproved: boolean;
  rejectionReason?: string;
}
