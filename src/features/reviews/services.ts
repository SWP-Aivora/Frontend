import axiosInstance from '@/lib/axios';
import type { CreateReviewRequest, Review, UserReviewsResponse } from './types';
import type { PaginatedResponse } from '@/shared/types/api';
import { normalizePaginatedResponse } from '@/lib/api-utils';

const BASE_URL = '';

export const reviewService = {
  submitReview: async (data: CreateReviewRequest) => {
    const response = await axiosInstance.post(`${BASE_URL}/reviews`, data);
    return response.data;
  },

  getUserReviews: async (userId: string, pageSize: number = 10, pageIndex: number = 1) => {
    const response = await axiosInstance.get<UserReviewsResponse>(`${BASE_URL}/users/${userId}/reviews`, {
      params: {
        PageSize: pageSize,
        PageIndex: pageIndex,
      },
    });
    return response.data;
  },

  getProjectReviews: async (projectId: string, pageSize: number = 10, pageIndex: number = 1): Promise<PaginatedResponse<Review>> => {
    const response = await axiosInstance.get(`${BASE_URL}/projects/${projectId}/reviews`, {
      params: {
        PageSize: pageSize,
        PageIndex: pageIndex,
      },
    });
    return normalizePaginatedResponse<Review>(response);
  },
};
