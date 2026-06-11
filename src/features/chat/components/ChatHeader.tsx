import type { ConversationRecipient } from '../types';
import { Role } from '@/shared/types/enums';
import { cn } from '@/lib/utils';
import { ExternalLink, Archive, MoreHorizontal } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

interface ChatHeaderProps {
  recipient: ConversationRecipient;
  type: 'PROJECT' | 'PROPOSAL' | 'SUPPORT';
  relatedTitle?: string;
  projectId?: string; // Assume ID is passed or available from context
}

export const ChatHeader = ({ recipient, type, relatedTitle, projectId }: ChatHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.EXPERT: return 'bg-blue-100 text-blue-700';
      case Role.CLIENT: return 'bg-green-100 text-green-700';
      case Role.ADMIN: return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewProject = () => {
    if (!projectId) return;
    
    // Detect role from store or URL path for robustness
    const isClient = user?.role === Role.CLIENT || location.pathname.startsWith('/client');
    const isExpert = user?.role === Role.EXPERT || location.pathname.startsWith('/expert');
    
    // Role-based target path
    let target = '';
    if (isClient) {
      target = `/client/projects/${projectId}/workspace`;
    } else if (isExpert) {
      target = `/expert/projects/${projectId}/workspace`;
    }

    if (target) {
      navigate(target);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white sticky top-0 z-10 h-[72px]">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 font-bold border border-slate-200">
            {recipient.avatarUrl ? (
              <img src={recipient.avatarUrl} alt={recipient.fullName} className="w-full h-full object-cover" />
            ) : (
              recipient.fullName.charAt(0).toUpperCase()
            )}
          </div>
          {recipient.isOnline && (
            <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-900 leading-tight tracking-tight truncate">
              {recipient.fullName}
            </h3>
            <span className={cn("text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider", getRoleBadgeColor(recipient.role))}>
              {recipient.role}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 truncate">
            {recipient.isOnline ? 'Online' : 'Offline'} • {type === 'SUPPORT' ? 'Support Ticket' : relatedTitle || 'General Chat'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Only show View Project if there is a real project link and not a support chat */}
        {type === 'PROJECT' && projectId && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewProject}
            className="hidden sm:flex h-9 gap-2 text-xs font-bold text-blue-600 border-blue-100 hover:bg-blue-50 rounded-xl"
          >
            View Project
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-xl">
          <Archive className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-xl">
          <MoreHorizontal className="size-5" />
        </Button>
      </div>
    </div>
  );
};
