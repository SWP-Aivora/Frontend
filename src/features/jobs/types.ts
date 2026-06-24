import { Role, BudgetType, SkillLevel } from '@/shared/types/enums';

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
  categoryName?: string | null;
  budgetType: BudgetType;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string | null;
  timelineDays: number | null;
  deadline: string | null;
  experienceLevel: SkillLevel | null;
  visibility: number;
  status: number;
  clientId: string;
  client: UserBasicInfo;
  createdAt: string;
  updatedAt?: string;
  skills: Array<{ id: string; name: string }>;
  milestones?: AcceptedJobMilestone[];
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
  budgetType: BudgetType;
  suggestedBudgetMin: number | null;
  suggestedBudgetMax: number | null;
  currency: string;
  suggestedTimelineDays: number | null;
  experienceLevel: SkillLevel | null;
  suggestedSkills: string[];
  suggestedMilestones: SuggestedMilestone[];
  status: AiJobAssistantStatus;
  createdAt: string;
}

export interface RefineAiJobSuggestionResult {
  suggestion: AiJobSuggestion;
  aiResponse: string;
  changedFields: string[];
}

export interface AcceptAiJobSuggestionRequest {
  categoryId: string;
  selectedSkillIds?: string[];
}

export interface AcceptedJobMilestone {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  dueDays: number;
  acceptanceCriteria: string | null;
  orderIndex: number;
}

export interface AcceptedJobResponse {
  id: string;
  categoryId: string | null;
  status: number;
  milestones: AcceptedJobMilestone[];
}

export interface AcceptAiJobSuggestionResult {
  job: AcceptedJobResponse;
}

export type PatchAiJobSuggestionRequest = Partial<Pick<AiJobSuggestion, 
  | 'suggestedTitle' 
  | 'suggestedDescription' 
  | 'businessDomain' 
  | 'expectedOutcome' 
  | 'budgetType' 
  | 'suggestedBudgetMin' 
  | 'suggestedBudgetMax' 
  | 'currency' 
  | 'suggestedTimelineDays' 
  | 'experienceLevel' 
  | 'suggestedSkills' 
  | 'suggestedMilestones'
>>;

export interface ExpertMatch {
  id: string;
  name: string;
  title: string;
  rating: number;
  matchScore: number;
  skills: string[];
}
