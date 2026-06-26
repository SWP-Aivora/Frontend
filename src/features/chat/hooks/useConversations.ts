import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services';
import { useAuthStore } from '@/features/auth/store';

export const useConversations = (params?: Record<string, unknown>) => {
  const currentUserId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['conversations', params, currentUserId],
    queryFn: () => chatService.getAll(params, currentUserId),
  });
};
