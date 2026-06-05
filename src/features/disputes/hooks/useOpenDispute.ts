import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeService } from '../services';
import type { OpenDisputeRequest } from '../types';

export const useOpenDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OpenDisputeRequest) => disputeService.openDispute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      queryClient.invalidateQueries({ queryKey: ['milestone'] });
    },
  });
};
