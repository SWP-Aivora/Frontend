import { Role } from '@/shared/types/enums';

export interface ConversationRecipient {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface Conversation {
  id: string;
  recipient: ConversationRecipient;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  type: 'PROJECT' | 'PROPOSAL' | 'SUPPORT';
  relatedTitle?: string;
  projectId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  type: 'TEXT' | 'FILE' | 'SYSTEM';
  fileUrl?: string;
  fileName?: string;
}

export interface SendMessagePayload {
  content: string;
}

export interface NewMessagePayload {
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  attachmentUrl?: string;
}
