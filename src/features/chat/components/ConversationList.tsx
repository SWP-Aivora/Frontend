import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import type { Conversation } from '../types';
import { ConversationItem } from './ConversationItem';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ConversationList = ({ 
  conversations, 
  selectedId, 
  onSelect, 
  isLoading,
  isCollapsed,
  onToggle,
  searchTerm,
  onSearchChange
}: ConversationListProps) => {
  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out relative",
      isCollapsed ? "w-16" : "w-80"
    )}>
      {/* Toggle Button - Positioned on the right edge */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onToggle}
        className={cn(
          "absolute top-6 -right-3.5 z-20 size-7 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-blue-600 transition-all",
          isCollapsed && "right-2"
        )}
      >
        {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </Button>

      <div className={cn(
        "p-4 border-b border-slate-200 flex flex-col gap-4",
        isCollapsed && "items-center px-0"
      )}>
        <div className="flex items-center justify-between w-full px-2">
          {!isCollapsed && <h2 className="text-xl font-black text-slate-900 tracking-tight">Messages</h2>}
        </div>

        {!isCollapsed && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-9 bg-slate-50 border-none h-10 rounded-lg focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            {isCollapsed ? '...' : 'Loading conversations...'}
          </div>
        ) : conversations.length > 0 ? (
          conversations.map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onClick={() => onSelect(conversation.id)}
              isCollapsed={isCollapsed}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            {!isCollapsed && <p className="text-slate-500 text-sm font-medium">No conversations found</p>}
          </div>
        )}
      </div>
    </div>
  );
};
