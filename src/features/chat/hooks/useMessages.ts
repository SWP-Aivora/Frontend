import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { chatService } from '../services';
import type { SendMessagePayload } from '../types';
import { useAuthStore } from '@/features/auth/store';
import { chatService } from '../services';
import type { SendMessagePayload, NewMessagePayload } from '../types';
import { useAuthStore } from '@/features/auth/store';

export const useMessages = (conversationId: string, params?: Record<string, unknown>) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: () => chatService.getMessages(conversationId, params),
    enabled: !!conversationId,
  });
};

export const useRealTimeMessages = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleNewMessage = (message: NewMessagePayload) => {
      if (message.conversationId === conversationId) {
        // Add new message to cache
        queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
          if (!oldData) return oldData;

          const newMessage = {
            id: message.senderId + '_' + Date.now(), // Generate unique ID
            conversationId: message.conversationId,
            senderId: message.senderId,
            senderName: message.senderName,
            content: message.content,
            createdAt: message.createdAt,
            isRead: false,
            type: message.attachmentUrl ? 'FILE' : 'TEXT',
            fileUrl: message.attachmentUrl,
            fileName: message.attachmentUrl ? (message.attachmentUrl as string).split('/').pop() : undefined
          };

          return {
            ...oldData,
            data: [...(oldData.data || []), newMessage]
          };
        });
      }
    };

    // Subscribe to new messages
    chatService.onMessage(handleNewMessage);

    return () => {
      chatService.setCallbacks({}); // Cleanup listeners
    };
  }, [conversationId, queryClient]);
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
