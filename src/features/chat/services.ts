import apiClient from '@/lib/axios';
import { BaseService } from '@/shared/services/BaseService';
import { API_ENDPOINTS } from '@/shared/constants';
import type { Conversation, Message } from './types';
import type { PaginatedResponse, BaseResponse } from '@/shared/types/api';

class ChatService extends BaseService<Conversation> {
  constructor() {
    super(API_ENDPOINTS.MESSAGES.CONVERSATIONS);
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, params?: Record<string, unknown>): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get<PaginatedResponse<Message>>(API_ENDPOINTS.MESSAGES.MESSAGES(conversationId), { params });
    return response.data as unknown as PaginatedResponse<Message>;
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string): Promise<BaseResponse<null>> {
    const response = await apiClient.post<BaseResponse<null>>(API_ENDPOINTS.MESSAGES.READ(conversationId));
    return response.data as unknown as BaseResponse<null>;
  }

  /**
   * Send a message
   * Note: The POST endpoint for sending messages is not yet confirmed in the API contract (full_api.json).
   * This implementation throws an error to avoid calling an unsupported endpoint.
   */
  async sendMessage(): Promise<BaseResponse<Message>> {
    throw new Error('Message sending is not yet available in the API contract.');
    
    /* 
    // Original implementation for future reference:
    const response = await apiClient.post<BaseResponse<Message>>(API_ENDPOINTS.MESSAGES.MESSAGES(_conversationId), { content: _content, type: _type });
    return response.data as unknown as BaseResponse<Message>;
    */
  }

  /**
   * Initialize a conversation
   */
  async initializeConversation(params: { expertId?: string; jobId?: string; projectId?: string }): Promise<BaseResponse<Conversation>> {
    const response = await apiClient.post<BaseResponse<Conversation>>(API_ENDPOINTS.MESSAGES.INIT, null, { params });
    return response.data as unknown as BaseResponse<Conversation>;
  }
}

export const chatService = new ChatService();
