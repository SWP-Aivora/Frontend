import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Skip effect if no conversation ID or not authenticated
    if (!conversationId || !isAuthenticated) return;

    let isSubscribed = true;

    chatService.connect()
      .then(() => chatService.joinConversation(conversationId))
      .catch((error) => {
        if (isSubscribed) {
          console.warn('[chat] Unable to connect to real-time messages', error);
        }
      });

    const handleNewMessage = (message: NewMessagePayload) => {
      if (message.conversationId === conversationId) {
        const newMessage: Message = {
          id: message.id, // server-assigned id; enables dedup against refetched messages
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
  }, [conversationId, queryClient, isAuthenticated]);
};

/**
 * Typing indicator for a conversation.
 * - `isOtherTyping`: the other participant is currently typing.
 * - `notifyTyping`: call on each keystroke; sends a debounced "typing" ping
 *   and an automatic "stopped" ping after a short idle.
 */
export const useTyping = (conversationId?: string) => {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const stopTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearOtherTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSendingTyping = useRef(false);

  useEffect(() => {
    if (!conversationId) return;

    setIsOtherTyping(false);

    const unsubscribe = chatService.onTyping((data) => {
      if (data.conversationId !== conversationId) return;
      if (data.userId === currentUserId) return;

      setIsOtherTyping(data.isTyping);

      // Fail-safe: clear the indicator if no follow-up ping arrives.
      if (clearOtherTimer.current) clearTimeout(clearOtherTimer.current);
      if (data.isTyping) {
        clearOtherTimer.current = setTimeout(() => setIsOtherTyping(false), 4000);
      }
    });

    return () => {
      unsubscribe();
      if (clearOtherTimer.current) clearTimeout(clearOtherTimer.current);
      setIsOtherTyping(false);
    };
  }, [conversationId, currentUserId]);

  const notifyTyping = useCallback(() => {
    if (!conversationId) return;

    if (!isSendingTyping.current) {
      isSendingTyping.current = true;
      void chatService.sendTyping(conversationId, true);
    }

    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => {
      isSendingTyping.current = false;
      void chatService.sendTyping(conversationId, false);
    }, 2000);
  }, [conversationId]);

  return { isOtherTyping, notifyTyping };
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

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => chatService.sendMessage(conversationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
