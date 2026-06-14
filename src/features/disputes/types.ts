/**
 * Dispute Status Enum (matching Backend string enum serialization)
 */
export const DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export type DisputeStatus = typeof DisputeStatus[keyof typeof DisputeStatus];

/**
 * Dispute Resolution Types
 */
export const DisputeResolutionType = {
  RELEASE_TO_EXPERT: 'RELEASE_TO_EXPERT',
  REFUND_TO_CLIENT: 'REFUND_TO_CLIENT',
  SPLIT_PAYMENT: 'SPLIT_PAYMENT',
  REQUEST_REVISION: 'REQUEST_REVISION',
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
  milestoneAmount?: number;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  expertId: string;
  expertName: string;
  openerName?: string; // Backend field
  againstUserName?: string; // Backend field
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
