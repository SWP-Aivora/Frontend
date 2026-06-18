import apiClient from '@/lib/axios';
import { env } from '@/lib/env';
import { BaseService } from '@/shared/services/BaseService';
import { API_ENDPOINTS } from '@/shared/constants';
import type { Conversation, Message, SendMessagePayload } from './types';
import type { PaginatedResponse, BaseResponse } from '@/shared/types/api';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';
import { useAuthStore } from '../auth/store';
import { Role } from '@/shared/types/enums';
import type { AxiosResponse } from 'axios';
import * as signalR from '@microsoft/signalr';

class ChatService extends BaseService<Conversation> {
  constructor() {
    super(API_ENDPOINTS.MESSAGES.CONVERSATIONS);
  }

  /**
   * Get all conversations
   */
  async getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<Conversation>> {
    const response = await apiClient.get(this.endpoint, { params });
    const paginated = normalizePaginatedResponse<Record<string, unknown>>(response as AxiosResponse);
    
    const currentUserId = useAuthStore.getState().user?.id;

    const items = paginated.data || [];

    // Map Backend ConversationResponse to Frontend Conversation
    const mappedItems = items.map((item: Record<string, unknown>) => {
      const isClient = item.clientId === currentUserId;
      
      return {
        id: item.id as string,
        recipient: {
          id: (isClient ? item.expertId : item.clientId) as string,
          fullName: (isClient ? item.expertName : item.clientName) as string,
          role: isClient ? Role.EXPERT : Role.CLIENT,
          avatarUrl: (isClient ? item.expertAvatar : item.clientAvatar) as string,
          isOnline: false, // Default as backend doesn't provide this yet
        },
        lastMessage: (item.lastMessage as string) || 'No messages yet',
        lastMessageAt: item.updatedAt as string,
        unreadCount: (item.unreadCount as number) || 0,
        type: item.projectId ? 'PROJECT' : (item.jobId ? 'PROPOSAL' : 'SUPPORT'),
        relatedTitle: (item.projectTitle || item.jobTitle || 'General Inquiry') as string,
        projectId: item.projectId as string
      } as Conversation;
    });

    return {
      ...paginated,
      data: mappedItems
    };
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, params?: Record<string, unknown>): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get(API_ENDPOINTS.MESSAGES.MESSAGES(conversationId), { params });
    const paginated = normalizePaginatedResponse<Record<string, unknown>>(response as AxiosResponse);

    const items = paginated.data || [];

    const mappedItems = items.map((item: Record<string, unknown>) => ({
      id: item.id as string,
      conversationId: item.conversationId as string,
      senderId: item.senderId as string,
      senderName: item.senderName as string,
      content: (item.content as string) || '',
      createdAt: item.createdAt as string,
      isRead: item.isRead as boolean,
      type: item.attachmentUrl ? 'FILE' : 'TEXT',
      fileUrl: item.attachmentUrl as string,
      fileName: item.attachmentUrl ? (item.attachmentUrl as string).split('/').pop() : undefined
    } as Message));

    return {
      ...paginated,
      data: mappedItems
    };
  }

  /**
   * Send a message through the backend SignalR hub.
   * The hub persists the message server-side before completing the invocation.
   */
  async sendMessage(conversationId: string, payload: SendMessagePayload): Promise<void> {
    const content = payload.content.trim();
    if (!content) {
      throw new Error('Message cannot be empty');
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      throw new Error('You must be logged in to send messages');
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${env.API_URL.replace(/\/$/, '')}/chat`, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    try {
      await connection.start();
      await connection.invoke('SendMessage', {
        conversationId,
        content,
      });
    } finally {
      await connection.stop();
    }
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string): Promise<BaseResponse<null>> {
    const response = await apiClient.post(API_ENDPOINTS.MESSAGES.READ(conversationId));
    return normalizeBaseResponse<null>(response);
  }

  /**
   * Initialize a conversation
   */
  async initializeConversation(params: { expertId?: string; jobId?: string; projectId?: string }): Promise<BaseResponse<Conversation>> {
    const response = await apiClient.post(API_ENDPOINTS.MESSAGES.INIT, null, { params });
    return normalizeBaseResponse<Conversation>(response);
  }
}

export const chatService = new ChatService();
