import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { useAuthStore } from '@/features/auth/store';

interface ChatBoxProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage?: (content: string) => Promise<void>;
  readOnlyReason?: string;
}

export const ChatBox = ({ messages, isLoading, onSendMessage, readOnlyReason }: ChatBoxProps) => {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-slate-500 text-sm">Loading messages...</span>
          </div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-slate-500 text-sm">No messages yet.</span>
          </div>
        )}
      </div>

      {readOnlyReason ? (
        <div className="p-4 border-t border-slate-200 bg-white">
          <p className="text-xs text-slate-500 font-medium text-center italic">
            {readOnlyReason}
          </p>
        </div>
      ) : onSendMessage && (
        <MessageInput onSendMessage={onSendMessage} disabled={isLoading} />
      )}
    </div>
  );
};
