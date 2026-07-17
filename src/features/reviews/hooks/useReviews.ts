import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services';
import type { CreateReviewRequest } from '../types';
import { toast } from 'sonner';

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewService.submitReview(data),
    onSuccess: () => {
      toast.success('Review submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to submit review';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    },
  });
};

export const useUserReviews = (userId: string, pageSize?: number, pageIndex?: number) => {
  return useQuery({
    queryKey: ['reviews', userId, pageSize, pageIndex],
    queryFn: () => reviewService.getUserReviews(userId, pageSize, pageIndex),
    enabled: !!userId,
  });
};

export const useProjectReviews = (projectId: string, pageSize?: number, pageIndex?: number, enabled = true) => {
  return useQuery({
    queryKey: ['reviews', 'project', projectId, pageSize, pageIndex],
    queryFn: () => reviewService.getProjectReviews(projectId, pageSize, pageIndex),
    enabled: enabled && !!projectId,
  });
};
