import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services';
import { toast } from 'sonner';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: (_variables: { conversationId: string; content: string }) => 
      chatService.sendMessage(),
    onSuccess: (_, _variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', _variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
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
