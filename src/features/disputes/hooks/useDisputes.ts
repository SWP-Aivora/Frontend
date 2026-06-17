import { useQuery } from '@tanstack/react-query';
import { disputeService } from '../services';

export const useDisputes = (params: { PageIndex?: number; PageSize?: number; SearchTerm?: string } = {}) => {
  return useQuery({
    queryKey: ['disputes', params],
    queryFn: () => disputeService.getDisputes(params),
  });
};
