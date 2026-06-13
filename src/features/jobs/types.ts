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

// AI Job Assistant Types
export const AiJobAssistantStatus = {
  GENERATED: 'GENERATED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
} as const;
export type AiJobAssistantStatus = (typeof AiJobAssistantStatus)[keyof typeof AiJobAssistantStatus];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed';
}

export interface SuggestedMilestone {
  id?: string;
  title: string;
  description?: string | null;
  amount?: number | null;
  dueDays?: number | null;
  acceptanceCriteria?: string | null;
  orderIndex: number;
}

export interface AiJobSuggestion {
  id: string;
  jobId: string | null;
  clientId: string;
  rawInput: string;
  suggestedTitle: string;
  suggestedDescription: string;
  businessDomain: string | null;
  expectedOutcome: string | null;
  categoryId: string | null;
  categoryName: string | null;
  budgetType: 'FIXED' | 'HOURLY';
  suggestedBudgetMin: number | null;
  suggestedBudgetMax: number | null;
  currency: string;
  suggestedTimelineDays: number | null;
  experienceLevel: string | null;
  suggestedSkills: string[];
  suggestedMilestones: SuggestedMilestone[];
  status: AiJobAssistantStatus;
  createdAt: string;
}

