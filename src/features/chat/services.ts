import apiClient from '@/lib/axios';
import { BaseService } from '@/shared/services/BaseService';
import { API_ENDPOINTS } from '@/shared/constants';
import type { Conversation, Message } from './types';
import type { PaginatedResponse, BaseResponse } from '@/shared/types/api';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';

class ChatService extends BaseService<Conversation> {
  constructor() {
    super(API_ENDPOINTS.MESSAGES.CONVERSATIONS);
  }

  /**
   * Get all conversations
   */
  async getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<Conversation>> {
    const response = await apiClient.get(this.endpoint, { params });
    return normalizePaginatedResponse<Conversation>(response);
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, params?: Record<string, unknown>): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get(API_ENDPOINTS.MESSAGES.MESSAGES(conversationId), { params });
    return normalizePaginatedResponse<Message>(response);
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
