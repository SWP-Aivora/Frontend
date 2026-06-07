import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services';

export const useMessages = (conversationId: string, params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: () => chatService.getMessages(conversationId, params),
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, content, type }: { conversationId: string; content: string; type?: string }) => 
      chatService.sendMessage(conversationId, content, type),
    onSuccess: (_, _variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', _variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatService.markAsRead(conversationId),
    onSuccess: (_, _conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Optionally invalidate specific unread counts if any
    },
  });
};
