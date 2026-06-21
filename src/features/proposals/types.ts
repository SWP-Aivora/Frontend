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
  expertId: string;
  coverLetter: string;
  proposedBudget: number;
  proposedTimelineDays: number | null;
  status: number;
  createdAt: string;
  milestones: ProposalMilestone[];
  expert: UserBasicInfo;
}
