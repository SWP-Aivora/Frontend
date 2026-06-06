import { useQuery } from '@tanstack/react-query';
import { disputeService } from '../services';

export const useDisputeDetails = (id: string) => {
  return useQuery({
    queryKey: ['dispute', id],
    queryFn: () => disputeService.getDisputeById(id),
    enabled: !!id,
  });
};
