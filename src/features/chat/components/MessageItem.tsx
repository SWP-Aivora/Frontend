import type { Message } from '../types';
import { cn } from '@/lib/utils';
import { FileIcon } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
}

export const MessageItem = ({ message, isCurrentUser }: MessageItemProps) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (message.type === 'SYSTEM') {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full border border-orange-200 uppercase tracking-wider">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col mb-4",
      isCurrentUser ? "items-end" : "items-start"
    )}>
      <div className={cn(
        "max-w-[70%] rounded-xl px-4 py-2.5 shadow-sm text-sm",
        isCurrentUser 
          ? "bg-blue-600 text-white rounded-tr-none" 
          : "bg-white text-slate-900 border border-slate-100 rounded-tl-none"
      )}>
        {!isCurrentUser && (
          <p className="text-xs font-bold mb-1 opacity-70">
            {message.senderName}
          </p>
        )}
        
        {message.type === 'FILE' ? (
          <a 
            href={message.fileUrl || '#'} 
            target={message.fileUrl ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 hover:underline",
              !message.fileUrl && "cursor-not-allowed pointer-events-none opacity-50"
            )}
            onClick={(e) => !message.fileUrl && e.preventDefault()}
          >
            <div className={cn(
              "p-2 rounded-lg",
              isCurrentUser ? "bg-blue-500" : "bg-slate-100"
            )}>
              <FileIcon className="w-4 h-4" />
            </div>
            <span className="truncate max-w-[150px]">{message.fileName || (message.fileUrl ? 'Attached File' : 'File Unavailable')}</span>
          </a>
        ) : (
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
        
        <div className={cn(
          "text-xs mt-1 text-right",
          isCurrentUser ? "text-blue-100" : "text-slate-400"
        )}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
};
