import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { chatService } from '../services';
import type { SendMessagePayload, NewMessagePayload } from '../types';
import type { Message } from '../types';
import { useAuthStore } from '@/features/auth/store';

export const useMessages = (conversationId: string, params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: () => chatService.getMessages(conversationId, params),
    enabled: !!conversationId,
  });
};

export const useRealTimeMessages = (conversationId?: string) => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // Skip effect if no conversation ID or no token
    if (!conversationId || !token) return;

    let isSubscribed = true;

    chatService.connect(token)
      .then(() => chatService.joinConversation(conversationId, token))
      .catch((error) => {
        if (isSubscribed) {
          console.warn('[chat] Unable to connect to real-time messages', error);
        }
      });

    const handleNewMessage = (message: NewMessagePayload) => {
      if (message.conversationId === conversationId) {
        const newMessage: Message = {
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

        queryClient.setQueriesData(
          { queryKey: ['messages', conversationId] },
          (oldData: { data?: Message[] } | undefined) => {
          if (!oldData) return oldData;

          if (oldData.data?.some((existingMessage) => existingMessage.id === newMessage.id)) {
            return oldData;
          }

          return {
            ...oldData,
            data: [...(oldData.data || []), newMessage]
          };
          }
        );

        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    };

    // Subscribe to new messages
    const unsubscribeMessage = chatService.onMessage(handleNewMessage);

    // Subscribe to read confirmations
    const unsubscribeRead = chatService.onReadConfirmation((data) => {
      if (data.conversationId !== conversationId) return;

      queryClient.setQueriesData(
        { queryKey: ['messages', conversationId] },
        (oldData: { data?: Message[] } | undefined) => {
          if (!oldData?.data) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((existingMessage) => ({ ...existingMessage, isRead: true }))
          };
        }
      );
    });

    return () => {
      isSubscribed = false;
      unsubscribeMessage();
      unsubscribeRead();
      chatService.leaveConversation(conversationId);
    };
  }, [conversationId, queryClient, token]);
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
