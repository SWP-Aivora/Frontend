/**
 * String values used by the backend to describe a dispute case lifecycle.
 *
 * `OPEN` cases have just been raised, `UNDER_REVIEW` cases are being assessed
 * by platform staff, `RESOLVED` cases have a final outcome, and `CLOSED` cases
 * are no longer active in the dispute workflow.
 */
export const DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

/**
 * Union of valid dispute status values accepted by the frontend domain model.
 */
export type DisputeStatus = typeof DisputeStatus[keyof typeof DisputeStatus];

/**
 * Final action options an admin can choose when resolving a dispute.
 *
 * These values control whether escrowed milestone funds are released, refunded,
 * split between parties, or held while the expert is asked to revise the work.
 */
export const DisputeResolutionType = {
  RELEASE_TO_EXPERT: 'RELEASE_TO_EXPERT',
  REFUND_TO_CLIENT: 'REFUND_TO_CLIENT',
  SPLIT_PAYMENT: 'SPLIT_PAYMENT',
  REQUEST_REVISION: 'REQUEST_REVISION',
} as const;

/**
 * Union of valid resolution action values sent to the dispute resolution API.
 */
export type DisputeResolutionType = typeof DisputeResolutionType[keyof typeof DisputeResolutionType];

/**
 * Evidence submitted by a dispute participant.
 *
 * Evidence is attached to one dispute, records which user submitted it, stores
 * the written explanation, and may include a supporting file URL.
 */
export interface Evidence {
  /** Unique evidence entry identifier. */
  id: string;
  /** Dispute case this evidence belongs to. */
  disputeId: string;
  /** User identifier for the participant who submitted the evidence. */
  submitterId: string;
  /** Display name of the submitting participant. */
  submitterName: string;
  /** Written evidence or rebuttal content. */
  content: string;
  /** Optional uploaded attachment URL associated with the evidence. */
  fileUrl?: string | null;
  /** Timestamp when the evidence was submitted. */
  createdAt: string;
}

/**
 * Frontend dispute domain model used by list, detail, evidence, and resolution views.
 *
 * A dispute connects a project milestone to the client and expert involved in
 * the conflict, includes the opener's reason and description, tracks lifecycle
 * status, and stores resolution amounts once an admin reaches a decision.
 */
export interface Dispute {
  /** Unique dispute case identifier. */
  id: string;
  /** Milestone under dispute. */
  milestoneId: string;
  /** Human-readable title of the disputed milestone. */
  milestoneTitle: string;
  /** Escrow amount associated with the milestone, when available. */
  milestoneAmount?: number;
  /** Project that owns the disputed milestone. */
  projectId: string;
  /** Human-readable project title. */
  projectTitle: string;
  /** Client party identifier. */
  clientId: string;
  /** Client party display name. */
  clientName: string;
  /** Expert party identifier. */
  expertId: string;
  /** Expert party display name. */
  expertName: string;
  /** Backend-provided display name for the user who opened the dispute. */
  openerName?: string;
  /** Backend-provided display name for the party the dispute was opened against. */
  againstUserName?: string;
  /** Short reason selected or entered by the opener. */
  reason: string;
  /** Optional detailed explanation from the opener. */
  description?: string | null;
  /** Current dispute lifecycle state. */
  status: DisputeStatus;
  /** Admin-selected final resolution action, once available. */
  resolutionType?: DisputeResolutionType | null;
  /** Admin explanation for the resolution decision. */
  resolutionNote?: string | null;
  /** Amount released to the expert when the resolution allocates funds. */
  releaseAmount?: number | null;
  /** Amount refunded to the client when the resolution allocates funds. */
  refundAmount?: number | null;
  /** Evidence and rebuttals submitted by dispute participants. */
  evidences: Evidence[];
  /** Timestamp when the dispute was opened. */
  createdAt: string;
  /** Timestamp when the dispute record was last updated. */
  updatedAt: string;
  /** Timestamp when the dispute was resolved, if it has a final decision. */
  resolvedAt?: string | null;
}

/**
 * API payload used by a client or expert to open a dispute for a milestone.
 */
export interface OpenDisputeRequest {
  /** Milestone being disputed. */
  milestoneId: string;
  /** Short reason for opening the case. */
  reason: string;
  /** Optional detailed description of the conflict. */
  description?: string | null;
}

/**
 * API payload used by a participant to add evidence or a rebuttal to a dispute.
 */
export interface AddEvidenceRequest {
  /** Written evidence or rebuttal content. */
  content: string;
  /** Optional uploaded file URL supporting the evidence. */
  fileUrl?: string | null;
}

/**
 * API payload used by an admin to resolve a dispute.
 *
 * Split-payment resolutions may include both release and refund amounts; full
 * release or refund resolutions typically provide only the relevant amount.
 */
export interface ResolveDisputeRequest {
  /** Final resolution action selected by the admin. */
  resolutionType: DisputeResolutionType;
  /** Admin-facing explanation of the decision. */
  resolutionNote: string;
  /** Amount to release to the expert, when applicable. */
  releaseAmount?: number | null;
  /** Amount to refund to the client, when applicable. */
  refundAmount?: number | null;
}
