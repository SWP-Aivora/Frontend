import type { Role, MilestoneStatus, MilestoneStepStatus } from '@/shared/types/enums';
import type { ProjectStatus } from '@/shared/types/enums';

export interface UserSummary {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: Role;
}

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  dueDate: string | null;
  dueDays: number | null;
  acceptanceCriteria: string | null;
  orderIndex: number;
  status: MilestoneStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  jobId?: string;
  acceptedProposalId?: string;
  title: string;
  description: string;
  status: ProjectStatus;
  hasDispute?: boolean;
  clientId: string;
  expertId: string;
  clientName?: string;
  expertName?: string;
  currency?: string;
  client: UserSummary;
  expert: UserSummary;
  totalBudget: number;
  remainingBudget: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
}

export interface MilestoneStep {
  id: string;
  milestoneId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  status: MilestoneStepStatus;
  dueDate: string | null;
  completedAt: string | null;
  completedByUserId: string | null;
}

export interface Deliverable {
  id: string;
  milestoneId: string;
  expertId?: string;
  description: string;
  fileUrl: string | null;
  demoUrl: string | null;
  sourceCodeUrl: string | null;
  note: string | null;
  revisionNumber?: number;
  status?: number | string;
  submittedAt?: string;
  reviewedAt?: string | null;
  createdAt?: string;
}
