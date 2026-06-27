// Cấu hình các hàm gọi API (axios) liên quan đến Job (Công việc) và AI Assistant
import apiClient from '@/lib/axios';
import type {
  Job,
  CreateJobRequest,
  AiJobSuggestion,
  ExpertMatch,
  PatchAiJobSuggestionRequest,
  RefineAiJobSuggestionResult,
  AcceptAiJobSuggestionRequest,
  AcceptAiJobSuggestionResult,
} from './types';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';
import { BudgetType, SkillLevel } from '@/shared/types/enums';

const normalizeBudgetType = (value: unknown): BudgetType => {
  if (value === BudgetType.HOURLY || String(value ?? '').toUpperCase() === 'HOURLY') {
    return BudgetType.HOURLY;
  }

  return BudgetType.FIXED;
};

const normalizeSkillLevel = (value: unknown): SkillLevel | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const normalized = String(value).toUpperCase();

  if (value === SkillLevel.BEGINNER || normalized === 'BEGINNER') {
    return SkillLevel.BEGINNER;
  }

  if (value === SkillLevel.INTERMEDIATE || normalized === 'INTERMEDIATE') {
    return SkillLevel.INTERMEDIATE;
  }

  if (
    value === SkillLevel.EXPERIENCED ||
    normalized === 'EXPERIENCED' ||
    normalized === 'ADVANCED'
  ) {
    return SkillLevel.EXPERIENCED;
  }

  if (value === SkillLevel.EXPERT || normalized === 'EXPERT') {
    return SkillLevel.EXPERT;
  }

  return null;
};

const normalizeJob = (job: Job): Job => ({
  ...job,
  budgetType: normalizeBudgetType(job.budgetType),
  experienceLevel: normalizeSkillLevel(job.experienceLevel),
});

const normalizeAiJobSuggestion = (suggestion: AiJobSuggestion): AiJobSuggestion => ({
  ...suggestion,
  budgetType: normalizeBudgetType(suggestion.budgetType),
  experienceLevel: normalizeSkillLevel(suggestion.experienceLevel),
});

const normalizeRefineResult = (result: RefineAiJobSuggestionResult): RefineAiJobSuggestionResult => ({
  ...result,
  suggestion: normalizeAiJobSuggestion(result.suggestion),
});

const normalizeAcceptedJobResult = (result: AcceptAiJobSuggestionResult): AcceptAiJobSuggestionResult => ({
  ...result,
  job: {
    ...result.job,
  },
});

export const jobService = {
  // Get all jobs (For Expert Job Board)
  getJobs: async (params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Job>> => {
    const response = await apiClient.get('/jobs', { params });
    const normalized = normalizePaginatedResponse<Job>(response);
    return {
      ...normalized,
      data: (normalized.data ?? []).map(normalizeJob),
    };
  },

  // Get job details
  getJobById: async (id: string): Promise<BaseResponse<Job>> => {
    const response = await apiClient.get(`/jobs/${id}`);
    const normalized = normalizeBaseResponse<Job>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeJob(normalized.data) : null,
    };
  },

  // Create job
  createJob: async (data: CreateJobRequest): Promise<BaseResponse<Job>> => {
    const response = await apiClient.post('/jobs', data);
    const normalized = normalizeBaseResponse<Job>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeJob(normalized.data) : null,
    };
  },

  // Update job
  updateJob: async (id: string, data: Record<string, unknown>): Promise<BaseResponse<Job>> => {
    const response = await apiClient.put(`/jobs/${id}`, data);
    const normalized = normalizeBaseResponse<Job>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeJob(normalized.data) : null,
    };
  },

  // Publish job
  publishJob: async (id: string): Promise<BaseResponse<Job>> => {
    const response = await apiClient.post(`/jobs/${id}/publish`);
    const normalized = normalizeBaseResponse<Job>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeJob(normalized.data) : null,
    };
  },

  // Get My Jobs (Client action)
  getMyJobs: async (params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Job>> => {
    const response = await apiClient.get('/jobs/my', { params });
    const normalized = normalizePaginatedResponse<Job>(response);
    return {
      ...normalized,
      data: (normalized.data ?? []).map(normalizeJob),
    };
  },

  // AI Job Assistant
  initAiJobAssistant: async (prompt: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.post<BaseResponse<AiJobSuggestion>>('/ai/job-assistant', { rawInput: prompt });
    const normalized = normalizeBaseResponse<AiJobSuggestion>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeAiJobSuggestion(normalized.data) : null,
    };
  },

  getAiJobSuggestion: async (id: string): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.get<BaseResponse<AiJobSuggestion>>(`/ai/job-assistant/${id}`);
    const normalized = normalizeBaseResponse<AiJobSuggestion>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeAiJobSuggestion(normalized.data) : null,
    };
  },

  refineAiJobSuggestion: async (id: string, prompt: string): Promise<BaseResponse<RefineAiJobSuggestionResult>> => {
    const response = await apiClient.post<BaseResponse<RefineAiJobSuggestionResult>>(`/ai/job-assistant/${id}/refine`, { message: prompt });
    const normalized = normalizeBaseResponse<RefineAiJobSuggestionResult>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeRefineResult(normalized.data) : null,
    };
  },

  patchAiJobSuggestion: async (id: string, data: PatchAiJobSuggestionRequest): Promise<BaseResponse<AiJobSuggestion>> => {
    const response = await apiClient.patch<BaseResponse<AiJobSuggestion>>(`/ai/job-assistant/${id}`, data);
    const normalized = normalizeBaseResponse<AiJobSuggestion>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeAiJobSuggestion(normalized.data) : null,
    };
  },

  acceptAiJobSuggestion: async (id: string, data: AcceptAiJobSuggestionRequest): Promise<BaseResponse<AcceptAiJobSuggestionResult>> => {
    const response = await apiClient.post<BaseResponse<AcceptAiJobSuggestionResult>>(`/ai/job-assistant/${id}/accept`, data);
    const normalized = normalizeBaseResponse<AcceptAiJobSuggestionResult>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeAcceptedJobResult(normalized.data) : null,
    };
  },

  // AI Recommendations
  generateRecommendations: async (jobId: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.post(`/jobs/${jobId}/recommendations/generate`);
    return normalizeBaseResponse<void>(response);
  },

  getRecommendations: async (jobId: string): Promise<BaseResponse<ExpertMatch[]>> => {
    const response = await apiClient.get<BaseResponse<ExpertMatch[]>>(`/jobs/${jobId}/recommendations`);
    return normalizeBaseResponse<ExpertMatch[]>(response);
  },

};
