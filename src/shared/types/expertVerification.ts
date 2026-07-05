export const VerificationStatus = {
  PENDING: 'PENDING',
  AI_APPROVED: 'AI_APPROVED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ESCALATED: 'ESCALATED'
} as const;

export type VerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];

export interface ExpertVerification {
  id: string;
  expertSkillId: string;
  expertId: string;
  certificateUrl: string;
  status: VerificationStatus;
  aiScore: number | null;
  aiNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Optional expanded fields for UI
  skillName?: string;
  expertName?: string;
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

export interface PaginatedVerificationsResponse {
  items: ExpertVerification[];
  totalItems: number;
  totalPages: number;
  pageIndex: number;
  pageSize: number;
}

export interface AdminReviewVerificationRequest {
  status: typeof VerificationStatus.APPROVED | typeof VerificationStatus.REJECTED;
  notes?: string;
}
