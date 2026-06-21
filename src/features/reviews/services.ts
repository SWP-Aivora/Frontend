import axiosInstance from '@/lib/axios';
import type { CreateReviewRequest, UserReviewsResponse } from './types';

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
};
