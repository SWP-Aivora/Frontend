import type { Role, MilestoneStatus } from '@/shared/types/enums';
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
  title: string;
  description: string;
  status: ProjectStatus;
  clientId: string;
  expertId: string;
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

export interface Deliverable {
  id: string;
  milestoneId: string;
  description: string;
  fileUrl: string | null;
  demoUrl: string | null;
  sourceCodeUrl: string | null;
  note: string | null;
  createdAt: string;
}
