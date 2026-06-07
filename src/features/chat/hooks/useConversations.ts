import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services';

export const useConversations = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => chatService.getAll(params),
  });
};
