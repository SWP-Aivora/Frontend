import type { Conversation } from '../types';
import { Role } from '@/shared/types/enums';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
}

export const ConversationItem = ({ conversation, isSelected, onClick, isCollapsed }: ConversationItemProps) => {
  const { recipient, lastMessage, lastMessageAt, unreadCount, relatedTitle } = conversation;
  
  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.EXPERT: return 'bg-blue-100 text-blue-700';
      case Role.CLIENT: return 'bg-green-100 text-green-700';
      case Role.ADMIN: return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer transition-all border-b border-slate-50 hover:bg-slate-50",
        isSelected && "bg-blue-50/50 border-r-2 border-r-blue-600",
        isCollapsed && "justify-center px-0"
      )}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 font-bold border border-slate-200">
          {recipient.avatarUrl ? (
            <img src={recipient.avatarUrl} alt={recipient.fullName} className="w-full h-full object-cover" />
          ) : (
            recipient.fullName.charAt(0).toUpperCase()
          )}
        </div>
        {recipient.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
        )}
        {isCollapsed && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-blue-600 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-[8px] font-bold text-white leading-none">{unreadCount}</span>
          </div>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
            <h4 className="font-bold text-sm text-slate-900 truncate tracking-tight">
              {recipient.fullName}
            </h4>
            <span className="text-[10px] font-medium text-slate-400 shrink-0">
              {formatTime(lastMessageAt)}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 mb-1">
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider", getRoleBadgeColor(recipient.role))}>
              {recipient.role}
            </span>
            {relatedTitle && (
              <span className="text-[10px] font-medium text-slate-400 truncate max-w-[100px]">
                • {relatedTitle}
              </span>
            )}
          </div>
          
          <p className={cn(
            "text-xs truncate leading-relaxed",
            unreadCount > 0 ? "text-slate-900 font-bold" : "text-slate-500 font-medium"
          )}>
            {lastMessage || 'No messages yet'}
          </p>
        </div>
      )}

      {!isCollapsed && unreadCount > 0 && (
        <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ml-1 shadow-sm">
          {unreadCount}
        </div>
      )}
    </div>
  );
};
