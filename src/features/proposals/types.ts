import type { UserBasicInfo } from '../jobs/types';

export interface ProposalMilestone {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  dueDays: number;
  acceptanceCriteria: string | null;
  orderIndex: number;
}

export interface Proposal {
  id: string;
  jobId: string;
  jobTitle?: string;
  expertId: string;
  expertName?: string;
  coverLetter: string;
  proposedBudget: number;
  proposedTimelineDays: number | null;
  currency?: string;
  status: number | string;
  createdAt?: string;
  submittedAt?: string;
  milestones: ProposalMilestone[];
  expert?: UserBasicInfo;
}
