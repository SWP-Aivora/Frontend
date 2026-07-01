import apiClient from '@/lib/axios';
import { env } from '@/lib/env';
import { BaseService } from '@/shared/services/BaseService';
import { API_ENDPOINTS } from '@/shared/constants';
import type { Conversation, Message, SendMessagePayload } from './types';
import type { PaginatedResponse, BaseResponse } from '@/shared/types/api';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';
import { Role } from '@/shared/types/enums';
import type { AxiosResponse } from 'axios';
import * as signalR from '@microsoft/signalr';

const getSignalRErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown SignalR error';
};

const createSignalRError = (operation: string, error: unknown): Error => (
  new Error(`${operation}: ${getSignalRErrorMessage(error)}`)
);

const buildApiUrl = (endpoint: string): string => (
  `${env.API_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
);

const CHAT_HUB_URL = buildApiUrl(API_ENDPOINTS.MESSAGES.CHAT_HUB);

type ChatConnectionPoolEntry = {
  connection: signalR.HubConnection;
  startPromise: Promise<void> | null;
};

const mapConversationResponse = (item: Record<string, unknown>, currentUserId?: string): Conversation => {
  const isClient = item.clientId === currentUserId;

  return {
    id: item.id as string,
    recipient: {
      id: (isClient ? item.expertId : item.clientId) as string,
      fullName: (isClient ? item.expertName : item.clientName) as string,
      role: isClient ? Role.EXPERT : Role.CLIENT,
      avatarUrl: (isClient ? item.expertAvatar : item.clientAvatar) as string,
      isOnline: false,
      email: '',
    },
    lastMessage: (item.lastMessage as string) || 'No messages yet',
    lastMessageAt: item.updatedAt as string,
    unreadCount: (item.unreadCount as number) || 0,
    type: item.projectId ? 'PROJECT' : (item.jobId ? 'PROPOSAL' : 'SUPPORT'),
    relatedTitle: (item.projectTitle || item.jobTitle || 'General Inquiry') as string,
    projectId: item.projectId as string
  };
};

class ChatService extends BaseService<Conversation> {
  private readonly chatConnectionPool = new Map<string, ChatConnectionPoolEntry>();
  private activeChatConnectionKey: string | null = null;
  private callbacks: ChatCallbacks = {};

  constructor() {
    super(API_ENDPOINTS.MESSAGES.CONVERSATIONS);
  }

  /**
   * Set callbacks for real-time events
   */
  setCallbacks(callbacks: ChatCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Listen to new messages
   */
  onMessage(callback: (message: NewMessagePayload) => void): void {
    this.callbacks.onMessage = callback;
  }

  /**
   * Listen to typing indicators
   */
  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void): void {
    this.callbacks.onTyping = callback;
  }

  /**
   * Listen to job status updates
   */
  onJobStatusUpdate(callback: (data: { jobId: string; status: string; title?: string }) => void): void {
    this.callbacks.onJobStatusUpdate = callback;
  }

  private getChatConnectionKey(token: string): string {
    return `${CHAT_HUB_URL}:${token}`;
  }

  private createChatConnectionEntry(token: string, connectionKey: string): ChatConnectionPoolEntry {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    this.setupMessageListeners(connection);
    this.setupJobStatusListeners(connection);

    connection.onclose(() => {
      const currentEntry = this.chatConnectionPool.get(connectionKey);

      if (currentEntry?.connection === connection) {
        this.chatConnectionPool.delete(connectionKey);
      }

      if (this.activeChatConnectionKey === connectionKey) {
        this.activeChatConnectionKey = null;
      }
    });

    return {
      connection,
      startPromise: null,
    };
  }

  private async getChatConnectionEntry(token: string): Promise<ChatConnectionPoolEntry> {
    const connectionKey = this.getChatConnectionKey(token);

    if (this.activeChatConnectionKey && this.activeChatConnectionKey !== connectionKey) {
      await this.resetChatConnection();
    }

    let entry = this.chatConnectionPool.get(connectionKey);

    if (!entry) {
      entry = this.createChatConnectionEntry(token, connectionKey);
      this.chatConnectionPool.set(connectionKey, entry);
    }

    this.activeChatConnectionKey = connectionKey;

    return entry;
  }

  private async waitForChatConnectionReconnect(
    connection: signalR.HubConnection
  ): Promise<signalR.HubConnectionState> {
    while (connection.state === signalR.HubConnectionState.Reconnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return connection.state;
  }

  private setupMessageListeners(connection: signalR.HubConnection): void {
    // Listen for new messages
    connection.on('ReceiveMessage', (message: NewMessagePayload) => {
      console.log('New message received:', message);
      this.callbacks.onMessage?.(message);
    });

    // Listen for typing indicators
    connection.on('UserTyping', (data: { userId: string; isTyping: boolean }) => {
      console.log('User typing:', data);
      this.callbacks.onTyping?.(data);
    });

    connection.onreconnected(() => {
      console.log('SignalR reconnected');
    });

    connection.onreconnecting(() => {
      console.log('SignalR reconnecting');
    });
  }

  private setupJobStatusListeners(connection: signalR.HubConnection): void {
    // Listen for job status updates
    connection.on('JobStatusUpdated', (data: { jobId: string; status: string; title?: string }) => {
      console.log('Job status updated:', data);
      this.callbacks.onJobStatusUpdate?.(data);
    });
  }

  private async ensureChatConnection(token: string): Promise<signalR.HubConnection> {
    const entry = await this.getChatConnectionEntry(token);
    const { connection } = entry;

    if (connection.state === signalR.HubConnectionState.Connected) {
      return connection;
    }

    if (connection.state === signalR.HubConnectionState.Reconnecting) {
      const connectionState = await this.waitForChatConnectionReconnect(connection);

      if (connectionState === signalR.HubConnectionState.Connected) {
        return connection;
      }
    }

    if (entry.startPromise) {
      await entry.startPromise;
      return connection;
    }

    const startPromise = connection.start()
      .catch((firstStartError: unknown) => connection.start()
        .catch((retryStartError: unknown) => {
          throw createSignalRError(
            `Unable to connect to chat hub after retry (${getSignalRErrorMessage(firstStartError)})`,
            retryStartError
          );
        }))
      .finally(() => {
        if (entry.startPromise === startPromise) {
          entry.startPromise = null;
        }
      });

    entry.startPromise = startPromise;
    await entry.startPromise;
    return connection;
  }

  async resetChatConnection(): Promise<void> {
    const entries = [...this.chatConnectionPool.values()];

    this.chatConnectionPool.clear();
    this.activeChatConnectionKey = null;

    await Promise.all(entries.map(async ({ connection }) => {
      if (connection.state === signalR.HubConnectionState.Disconnected) {
        return;
      }

      try {
        await connection.stop();
      } catch (cleanupError: unknown) {
        console.warn('Failed to stop chat SignalR connection', cleanupError);
      }
    }));
  }

  /**
   * Get all conversations
   */
  async getAll(params?: Record<string, unknown>, currentUserId?: string): Promise<PaginatedResponse<Conversation>> {
    const response = await apiClient.get(this.endpoint, { params });
    const paginated = normalizePaginatedResponse<Record<string, unknown>>(response as AxiosResponse);

    const items = paginated.data || [];

    // Map Backend ConversationResponse to Frontend Conversation
    const mappedItems = items.map((item: Record<string, unknown>) => mapConversationResponse(item, currentUserId));

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
  async sendMessage(conversationId: string, payload: SendMessagePayload, token?: string): Promise<void> {
    const content = payload.content.trim();
    if (!content) {
      throw new Error('Message cannot be empty');
    }

    if (!token) {
      throw new Error('You must be logged in to send messages');
    }

    try {
      const connection = await this.ensureChatConnection(token);

      try {
        await connection.invoke('SendMessage', {
          conversationId,
          content,
        });
      } catch (invokeError: unknown) {
        throw createSignalRError('Unable to send chat message', invokeError);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }

      throw createSignalRError('Unable to send chat message', error);
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
  async initializeConversation(
    params: { expertId?: string; jobId?: string; projectId?: string },
    currentUserId?: string
  ): Promise<BaseResponse<Conversation>> {
    const response = await apiClient.post(API_ENDPOINTS.MESSAGES.INIT, null, { params });
    const normalized = normalizeBaseResponse<Record<string, unknown>>(response);

    return {
      ...normalized,
      data: normalized.data ? mapConversationResponse(normalized.data, currentUserId) : null,
    };
  }
}

export const chatService = new ChatService();
