import type { Conversation, Message } from './types';
import { Role } from '@/shared/types/enums';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    recipient: {
      id: 'expert-1',
      fullName: 'An Nguyen',
      email: 'an.nguyen@expert.com',
      role: Role.EXPERT,
      isOnline: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=expert-1'
    },
    lastMessage: 'I uploaded the updated conversation flow document for review.',
    lastMessageAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    unreadCount: 2,
    type: 'PROJECT',
    relatedTitle: 'Vietnamese Support Chatbot',
    projectId: 'p1'
  },
  {
    id: '2',
    recipient: {
      id: 'expert-2',
      fullName: 'Minh Pham',
      email: 'minh.pham@expert.com',
      role: Role.EXPERT,
      isOnline: false,
      avatarUrl: 'https://i.pravatar.cc/150?u=expert-2'
    },
    lastMessage: 'Yes. Please send the latest product catalog.',
    lastMessageAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    type: 'PROPOSAL',
    relatedTitle: 'RAG Assistant Proposal'
  },
  {
    id: '3',
    recipient: {
      id: 'admin-1',
      fullName: 'AIVORA Support',
      email: 'support@aivora.vn',
      role: Role.ADMIN,
      isOnline: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=admin-1'
    },
    lastMessage: 'Your payment is being processed.',
    lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    type: 'SUPPORT',
    relatedTitle: 'Payment Support'
  }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      conversationId: '1',
      senderId: 'client-1',
      senderName: 'Linh Tran',
      content: 'Could you update the product recommendation flow in the chatbot design?',
      createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'TEXT'
    },
    {
      id: 'm2',
      conversationId: '1',
      senderId: 'expert-1',
      senderName: 'An Nguyen',
      content: 'Yes. Please send the latest product catalog so I can match the conversation flow.',
      createdAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'TEXT'
    },
    {
      id: 'm3',
      conversationId: '1',
      senderId: 'system',
      senderName: 'System',
      content: 'Milestone funded / Conversation Flow Design',
      createdAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'SYSTEM'
    },
    {
      id: 'm4',
      conversationId: '1',
      senderId: 'expert-1',
      senderName: 'An Nguyen',
      content: 'I uploaded the updated conversation flow document for review.',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      isRead: false,
      type: 'TEXT'
    },
    {
      id: 'm5',
      conversationId: '1',
      senderId: 'expert-1',
      senderName: 'An Nguyen',
      content: 'flow.pdf',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      isRead: false,
      type: 'FILE',
      fileUrl: '#',
      fileName: 'flow.pdf'
    }
  ]
};
