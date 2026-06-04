import { Role } from '@/shared/types/enums';

export interface UserBasicInfo {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: Role;
}

export interface Job {
  id: string;
  title: string;
  originalDescription: string;
  finalDescription: string | null;
  businessDomain: string | null;
  expectedOutcome: string | null;
  categoryId: string;
  budgetType: number; // 0: Fixed, 1: Hourly
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string | null;
  timelineDays: number | null;
  deadline: string | null;
  experienceLevel: number | null;
  visibility: number;
  status: number;
  clientId: string;
  client: UserBasicInfo;
  createdAt: string;
  updatedAt: string;
  skills: Array<{ id: string; name: string }>;
}

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
