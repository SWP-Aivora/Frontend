import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services';
import type { SendMessagePayload } from '../types';
import { useAuthStore } from '@/features/auth/store';

export const useMessages = (conversationId: string, params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: () => chatService.getMessages(conversationId, params),
    enabled: !!conversationId,
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatService.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Optionally invalidate specific unread counts if any
    },
  });
};

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => chatService.sendMessage(conversationId, payload, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
