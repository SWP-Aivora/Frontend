import axiosInstance from '@/lib/axios';
import type { CreateReviewRequest, Review, UserReviewsResponse } from './types';
import type { PaginatedResponse } from '@/shared/types/api';
import { normalizePaginatedResponse } from '@/lib/api-utils';

const BASE_URL = '';

type ReviewRecord = Review & Record<string, unknown>;

const getString = (value: unknown, fallback = ''): string => (
  typeof value === 'string' ? value : fallback
);

const getNullableString = (value: unknown): string | null => (
  typeof value === 'string' ? value : null
);

const getNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const getNullableNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const normalizeReview = (review: Review): Review => {
  const raw = review as ReviewRecord;

  return {
    ...review,
    id: review.id || getString(raw.Id),
    projectId: review.projectId || getString(raw.ProjectId),
    reviewerId: review.reviewerId || getString(raw.ReviewerId),
    reviewerName: review.reviewerName || getString(raw.ReviewerName),
    revieweeId: review.revieweeId || getString(raw.RevieweeId),
    revieweeName: review.revieweeName || getString(raw.RevieweeName),
    rating: getNumber(review.rating ?? raw.Rating),
    comment: review.comment ?? getNullableString(raw.Comment),
    communicationRating: review.communicationRating ?? getNullableNumber(raw.CommunicationRating),
    qualityRating: review.qualityRating ?? getNullableNumber(raw.QualityRating),
    deadlineRating: review.deadlineRating ?? getNullableNumber(raw.DeadlineRating),
    requirementClarityRating: review.requirementClarityRating ?? getNullableNumber(raw.RequirementClarityRating),
    createdAt: review.createdAt || getString(raw.CreatedAt),
  };
};

export const reviewService = {
  submitReview: async (data: CreateReviewRequest) => {
    const response = await axiosInstance.post(`${BASE_URL}/reviews`, data);
    return response.data;
  },

  getUserReviews: async (userId: string, pageSize: number = 10, pageIndex: number = 1): Promise<UserReviewsResponse> => {
    const response = await axiosInstance.get(`${BASE_URL}/users/${userId}/reviews`, {
      params: {
        PageSize: pageSize,
        PageIndex: pageIndex,
      },
    });
    const normalized = normalizePaginatedResponse<Review>(response);
    return {
      items: (normalized.data ?? []).map(normalizeReview),
      totalCount: normalized.metadata?.totalCount ?? normalized.data?.length ?? 0,
    };
  },

  getProjectReviews: async (projectId: string, pageSize: number = 10, pageIndex: number = 1): Promise<PaginatedResponse<Review>> => {
    const response = await axiosInstance.get(`${BASE_URL}/projects/${projectId}/reviews`, {
      params: {
        PageSize: pageSize,
        PageIndex: pageIndex,
      },
    });
    const normalized = normalizePaginatedResponse<Review>(response);
    return {
      ...normalized,
      data: (normalized.data ?? []).map(normalizeReview),
    };
  },
};
