// Cấu hình các hàm gọi API (axios) liên quan đến Hồ sơ (Profile) và Tìm kiếm chuyên gia
import apiClient from '@/lib/axios';
import axios from 'axios';
import type { UserProfile, ClientProfile, ExpertProfile, ExpertProfileResponse } from './types';
import type { UserUpdateFormValues, ClientProfileFormValues, ExpertProfileFormValues } from './schema';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { normalizeBaseResponse, normalizePaginatedResponse } from '@/lib/api-utils';
import { API_ENDPOINTS } from '@/shared/constants';
import { AvailabilityStatus } from '@/shared/types/enums';

type SearchExpertsParams = {
  keyword?: string;
  page?: number;
  pageSize?: number;
};

type ExpertSearchEnvelope = {
  experts?: ExpertProfileResponse[];
  Experts?: ExpertProfileResponse[];
  totalCount?: number;
  TotalCount?: number;
  page?: number;
  Page?: number;
  pageSize?: number;
  PageSize?: number;
  totalPages?: number;
  TotalPages?: number;
};

type ExpertRecord = ExpertProfileResponse & Record<string, unknown>;
type UpdateExpertProfileRequest = {
  title: string | null;
  bio: string | null;
  hourlyRate: number | null;
  experienceYears: number;
  availabilityStatus: number;
};

const getString = (value: unknown, fallback = ''): string => (
  typeof value === 'string' ? value : fallback
);

const getOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const getNumber = (value: unknown, fallback = 0): number => (
  getOptionalNumber(value) ?? fallback
);

const getFirstNumber = (...values: unknown[]): number => {
  for (const value of values) {
    const normalized = getOptionalNumber(value);
    if (normalized !== undefined) return normalized;
  }
  return 0;
};

const normalizeAvailabilityStatus = (value: unknown): AvailabilityStatus => {
  if (typeof value === 'string') {
    const key = value.toUpperCase() as keyof typeof AvailabilityStatus;
    if (key in AvailabilityStatus) return AvailabilityStatus[key];
  }
  return Number.isInteger(value) ? value as AvailabilityStatus : AvailabilityStatus.AVAILABLE;
};

const toNullableTrimmedString = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
};

const toFiniteNumberOrNull = (value: number | null | undefined): number | null => (
  typeof value === 'number' && Number.isFinite(value) ? value : null
);

const toNonNegativeInteger = (value: number | null | undefined): number => (
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0
);

const toAvailabilityStatus = (value: number | null | undefined): number => (
  typeof value === 'number' && Number.isInteger(value) ? value : AvailabilityStatus.AVAILABLE
);

export const buildUpdateExpertProfileRequest = (data: ExpertProfileFormValues): UpdateExpertProfileRequest => ({
  title: toNullableTrimmedString(data.title),
  bio: toNullableTrimmedString(data.bio),
  hourlyRate: toFiniteNumberOrNull(data.hourlyRate),
  experienceYears: toNonNegativeInteger(data.experienceYears),
  availabilityStatus: toAvailabilityStatus(data.availabilityStatus),
});

const normalizeExpertProfileResponse = (expert: ExpertProfileResponse): ExpertProfileResponse => {
  const raw = expert as ExpertRecord;
  const rawSkills = Array.isArray(expert.skills)
    ? expert.skills
    : (Array.isArray(raw.Skills) ? raw.Skills : []);

  return {
    ...expert,
    userId: expert.userId || getString(raw.UserId),
    fullName: expert.fullName || getString(raw.FullName),
    avatarUrl: expert.avatarUrl ?? getString(raw.AvatarUrl, ''),
    title: expert.title ?? getString(raw.Title),
    bio: expert.bio ?? getString(raw.Bio, ''),
    hourlyRate: getNumber(expert.hourlyRate ?? raw.HourlyRate, 0),
    experienceYears: getNumber(expert.experienceYears ?? raw.ExperienceYears, 0),
    availabilityStatus: normalizeAvailabilityStatus(expert.availabilityStatus ?? raw.AvailabilityStatus),
    rating: getNumber(expert.rating ?? raw.Rating, 0),
    totalReviews: getNumber(expert.totalReviews ?? raw.TotalReviews, 0),
    completedProjects: getFirstNumber(
      expert.completedProjects,
      raw.CompletedProjects,
      raw.completedProjectCount,
      raw.CompletedProjectCount
    ),
    successRate: getFirstNumber(
      expert.successRate,
      raw.SuccessRate,
      raw.completionRate,
      raw.CompletionRate,
      raw.projectCompletionRate,
      raw.ProjectCompletionRate,
      raw.completedProjectRate,
      raw.CompletedProjectRate,
      raw.completedProjectsRate,
      raw.CompletedProjectsRate,
      raw.successRatePercent,
      raw.SuccessRatePercent
    ),
    skills: rawSkills.map((skill) => {
      const rawSkill = skill as Record<string, unknown>;
      return {
        skillId: getString(rawSkill.skillId ?? rawSkill.SkillId),
        skillName: getString(rawSkill.skillName ?? rawSkill.SkillName),
        proficiencyLevel: getNumber(rawSkill.proficiencyLevel ?? rawSkill.ProficiencyLevel, 0),
      };
    }),
  };
};

const normalizeExpertSearchResponse = (
  response: unknown,
  pageSize: number
): PaginatedResponse<ExpertProfileResponse> => {
  const base = normalizeBaseResponse<ExpertSearchEnvelope>(response);
  const payload = base.data;
  const experts = payload?.experts ?? payload?.Experts ?? [];
  const pageIndex = payload?.page ?? payload?.Page ?? 1;
  const resolvedPageSize = payload?.pageSize ?? payload?.PageSize ?? pageSize;
  const totalCount = payload?.totalCount ?? payload?.TotalCount ?? experts.length;
  const totalPages = (payload?.totalPages ?? payload?.TotalPages ?? Math.ceil(totalCount / resolvedPageSize)) || 0;

  return {
    success: base.success,
    message: base.message,
    statusCode: base.statusCode,
    data: experts.map(normalizeExpertProfileResponse),
    metadata: {
      pageIndex,
      pageSize: resolvedPageSize,
      totalCount,
      totalPages,
      hasPreviousPage: pageIndex > 1,
      hasNextPage: pageIndex < totalPages,
    },
  };
};

export const profileService = {
  // Base User endpoints (using AUTH.ME as it corresponds to /api/v1/auth/me in backend)
  getUserProfile: async (): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return normalizeBaseResponse<UserProfile>(response);
  },

  updateUser: async (data: UserUpdateFormValues): Promise<BaseResponse<UserProfile>> => {
    const response = await apiClient.put(API_ENDPOINTS.USERS.ME, data);
    return normalizeBaseResponse<UserProfile>(response);
  },

  // Client Profile endpoints
  getClientProfile: async (): Promise<BaseResponse<ClientProfile>> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILES.CLIENT);
      return normalizeBaseResponse<ClientProfile>(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: true,
          message: 'Client profile has not been created yet.',
          data: null,
          statusCode: 404,
        };
      }

      throw error;
    }
  },

  updateClientProfile: async (data: ClientProfileFormValues): Promise<BaseResponse<ClientProfile>> => {
    const response = await apiClient.put(API_ENDPOINTS.PROFILES.CLIENT, data);
    return normalizeBaseResponse<ClientProfile>(response);
  },

  // Expert Profile endpoints
  getExpertProfile: async (): Promise<BaseResponse<ExpertProfile>> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILES.EXPERT);
      const normalized = normalizeBaseResponse<ExpertProfile>(response);
      return {
        ...normalized,
        data: normalized.data
          ? { ...normalized.data, availabilityStatus: normalizeAvailabilityStatus(normalized.data.availabilityStatus) }
          : null,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: true,
          message: 'Expert profile has not been created yet.',
          data: null,
          statusCode: 404,
        };
      }

      throw error;
    }
  },

  updateExpertProfile: async (data: ExpertProfileFormValues): Promise<BaseResponse<ExpertProfile>> => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILES.EXPERT, buildUpdateExpertProfileRequest(data));
      return normalizeBaseResponse<ExpertProfile>(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: false,
          message: 'Expert profile update is not available yet.',
          data: null,
          statusCode: 404,
        };
      }

      throw error;
    }
  },

  getExpertProfileById: async (expertId: string): Promise<BaseResponse<ExpertProfileResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILES.EXPERT_BY_ID(expertId));
    const normalized = normalizeBaseResponse<ExpertProfileResponse>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeExpertProfileResponse(normalized.data) : null,
    };
  },

  /**
   * Fetch featured experts for the landing page.
   * Uses robust pagination normalization to handle various response shapes.
   */
  getFeaturedExperts: async (count: number = 4): Promise<PaginatedResponse<ExpertProfileResponse>> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILES.FEATURED_EXPERTS, { params: { count } });
      const normalized = normalizePaginatedResponse<ExpertProfileResponse>(response);
      return {
        ...normalized,
        data: (normalized.data || []).map(normalizeExpertProfileResponse),
      };
    } catch (error) {
      console.error('[profileService] getFeaturedExperts failed:', error);
      // Fallback for list endpoints
      return {
        success: false,
        message: 'Failed to fetch featured experts',
        data: [],
        statusCode: 500,
        metadata: { pageIndex: 1, pageSize: count, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false }
      };
    }
  },

  searchExperts: async (params: SearchExpertsParams = {}): Promise<PaginatedResponse<ExpertProfileResponse>> => {
    const pageSize = params.pageSize ?? 50;
    const response = await apiClient.get(API_ENDPOINTS.PROFILES.SEARCH_EXPERTS, {
      params: {
        keyword: params.keyword || undefined,
        page: params.page ?? 1,
        pageSize,
      },
    });

    return normalizeExpertSearchResponse(response, pageSize);
  },
};
