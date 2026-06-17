import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { CreateReviewRequest, UserReviewsResponse } from './types';

export const reviewService = {
  submitReview: async (data: CreateReviewRequest) => {
    const response = await axiosInstance.post(API_ENDPOINTS.REVIEWS.BASE, data);
    return response.data;
  },

  getUserReviews: async (userId: string, pageSize: number = 10, pageIndex: number = 1) => {
    const response = await axiosInstance.get<UserReviewsResponse>(API_ENDPOINTS.REVIEWS.USER(userId), {
      params: {
        PageSize: pageSize,
        PageIndex: pageIndex,
      },
    });
    return response.data;
  },
};
