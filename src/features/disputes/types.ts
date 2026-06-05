/**
 * Dispute Status Enum (as const object forerasableSyntaxOnly compliance)
 */
export const DisputeStatus = {
  PENDING: 0,
  RESOLVING: 1,
  RESOLVED: 2,
  CANCELLED: 3,
} as const;

export type DisputeStatus = typeof DisputeStatus[keyof typeof DisputeStatus];

/**
 * Dispute Resolution Types
 */
export const DisputeResolutionType = {
  RELEASE_TO_EXPERT: 0,
  REFUND_TO_CLIENT: 1,
  SPLIT_PAYMENT: 2,
  EXPERT_WORK_REDO: 3,
} as const;

export type DisputeResolutionType = typeof DisputeResolutionType[keyof typeof DisputeResolutionType];

/**
 * Evidence structure
 */
export interface Evidence {
  id: string;
  disputeId: string;
  submitterId: string;
  submitterName: string;
  content: string;
  fileUrl?: string | null;
  createdAt: string;
}

/**
 * Dispute Interface
 */
export interface Dispute {
  id: string;
  milestoneId: string;
  milestoneTitle: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  expertId: string;
  expertName: string;
  reason: string;
  description?: string | null;
  status: DisputeStatus;
  resolutionType?: DisputeResolutionType | null;
  resolutionNote?: string | null;
  releaseAmount?: number | null;
  refundAmount?: number | null;
  evidences: Evidence[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

/**
 * Request payload for opening a dispute
 */
export interface OpenDisputeRequest {
  milestoneId: string;
  reason: string;
  description?: string | null;
}

/**
 * Request payload for adding evidence
 */
export interface AddEvidenceRequest {
  content: string;
  fileUrl?: string | null;
}

/**
 * Request payload for resolving a dispute (Admin)
 */
export interface ResolveDisputeRequest {
  resolutionType: DisputeResolutionType;
  resolutionNote: string;
  releaseAmount?: number | null;
  refundAmount?: number | null;
}
