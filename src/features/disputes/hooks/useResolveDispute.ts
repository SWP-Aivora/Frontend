import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeService } from '../services';
import type { ResolveDisputeRequest } from '../types';

export const useResolveDispute = (disputeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResolveDisputeRequest) => disputeService.resolveDispute(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });
};
