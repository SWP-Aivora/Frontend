import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services';
import type { ExpertReviewActionParams } from '../types';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

export const useAdminExpertReviews = (params?: Record<string, unknown>, enabled = true) => {
  return useQuery({
    queryKey: ['admin', 'expert-reviews', params],
    queryFn: () => adminService.getExpertReviews(params),
    enabled,
    select: (response) => response.data,
    retry: false,
  });
};

export const useExpertReviewDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['admin', 'expert-reviews', id],
    queryFn: () => adminService.getExpertReviewDetail(id!),
    enabled: !!id,
    select: (response) => response.data,
    retry: false,
  });
};

export const useProcessExpertReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: ExpertReviewActionParams) => adminService.processExpertReview(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'expert-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(`Expert review ${variables.status.toLowerCase()} successfully`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || 'Failed to process expert review');
    }
  });
};
