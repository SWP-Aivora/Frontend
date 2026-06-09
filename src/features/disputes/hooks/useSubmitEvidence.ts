import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeService } from '../services';
import type { AddEvidenceRequest } from '../types';

export const useSubmitEvidence = (disputeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddEvidenceRequest) => disputeService.addEvidence(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
    },
  });
};
