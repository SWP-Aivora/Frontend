import { useState, useMemo, useEffect } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatBox } from '../components/ChatBox';
import { ChatHeader } from '../components/ChatHeader';
import { EmptyState } from '../components/EmptyState';
import { useConversations } from '../hooks/useConversations';
import { useMessages, useMarkRead } from '../hooks/useMessages';
import type { Conversation } from '../types';
import { Info, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/features/projects/services';

export const ChatWorkspacePage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Real API hooks
  const { 
    data: conversationsData, 
    isLoading: isLoadingConversations,
    isError: isConversationsError,
    error: conversationsError,
    refetch: refetchConversations
  } = useConversations({ 
    SearchTerm: debouncedSearch,
    PageIndex: 1,
    PageSize: 100
  });
  
  const { 
    data: messagesData, 
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    error: messagesError,
    refetch: refetchMessages
  } = useMessages(selectedConversationId || '');
  
  const { mutate: markAsRead } = useMarkRead();

  // Strictly use API data
  const conversations = useMemo(() => {
    return Array.isArray(conversationsData?.data) ? conversationsData.data : [];
  }, [conversationsData]);

  const selectedConversation = useMemo(() => 
    conversations.find((c: Conversation) => c.id === selectedConversationId),
  [conversations, selectedConversationId]);

  const messages = useMemo(() => {
    return selectedConversationId ? (Array.isArray(messagesData?.data) ? messagesData.data : []) : [];
  }, [messagesData, selectedConversationId]);

  // Mark as read when conversation is selected and has unread messages
  useEffect(() => {
    if (selectedConversationId && selectedConversation?.unreadCount && selectedConversation.unreadCount > 0) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, selectedConversation?.unreadCount, markAsRead]);

  // Fetch project context if projectId exists
  const { 
    data: projectResponse,
    isError: isProjectError,
    error: projectError,
    refetch: refetchProject
  } = useQuery({
    queryKey: ['project', selectedConversation?.projectId],
    queryFn: () => projectService.getProjectById(selectedConversation!.projectId!),
    enabled: !!selectedConversation?.projectId,
  });

  const { 
    data: milestonesResponse,
    isError: isMilestonesError,
    error: milestonesError,
    refetch: refetchMilestones
  } = useQuery({
    queryKey: ['milestones', selectedConversation?.projectId],
    queryFn: () => projectService.getMilestonesByProject(selectedConversation!.projectId!),
    enabled: !!selectedConversation?.projectId,
  });

  const project = projectResponse?.data;
  const milestones = milestonesResponse?.data ?? [];
  const currentMilestone = milestones.find(m => m.status === 1 || m.status === 2) || milestones[0];

  const ErrorFallback = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-slate-100 m-4">
      <AlertCircle className="size-8 text-rose-400 mb-3" />
      <p className="text-sm font-bold text-slate-800 mb-1">Failed to load content</p>
      <p className="text-xs text-slate-500 mb-4 max-w-[240px]">{message}</p>
      <Button 
        onClick={onRetry} 
        variant="outline" 
        size="sm" 
        className="rounded-full h-8 text-[10px] font-black uppercase tracking-widest px-4"
      >
        <RefreshCw className="size-3 mr-2" />
        Retry
      </Button>
    </div>
  );

  return (
    <div className="h-[calc(100vh-80px)] bg-white flex overflow-hidden border-t border-slate-200">
      {/* Left Column: Conversation List */}
      <div className="shrink-0 flex flex-col border-r border-slate-200 h-full relative z-30">
        {isConversationsError ? (
          <div className="w-[320px] h-full flex items-center justify-center bg-white">
            <ErrorFallback 
              message={(conversationsError as Error)?.message || 'Unable to retrieve conversations'} 
              onRetry={refetchConversations} 
            />
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
            isLoading={isLoadingConversations}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}
      </div>

      {/* Main Workspace Wrapper (Middle + Right) */}
      <div className="flex-1 flex overflow-hidden h-full">
        {/* Middle Column: Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative border-r border-slate-100 h-full">
          {isMessagesError ? (
             <div className="flex-1 flex items-center justify-center">
                <ErrorFallback 
                  message={(messagesError as Error)?.message || 'Failed to load messages'} 
                  onRetry={refetchMessages} 
                />
             </div>
          ) : selectedConversation ? (
            <>
              <ChatHeader 
                recipient={selectedConversation.recipient} 
                type={selectedConversation.type}
                relatedTitle={selectedConversation.relatedTitle}
                projectId={selectedConversation.projectId}
              />
              
              <ChatBox 
                messages={messages} 
                isLoading={isLoadingMessages} 
                readOnlyReason="Messaging is read-only until the backend send endpoint is available."
              />
            </>
          ) : (
            <div className="flex-1 h-full">
              <EmptyState />
            </div>
          )}
        </div>

        {/* Right Column: Context & Files (Only for project/proposal) */}
        {selectedConversation && selectedConversation.type !== 'SUPPORT' && (
          <div className={cn(
            "hidden lg:flex flex-col bg-white transition-all duration-300 ease-in-out relative shrink-0 h-full",
            isRightPanelCollapsed ? "w-12" : "w-80"
          )}>
            {/* Toggle Button for Right Panel - Positioned on the left edge */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
              className={cn(
                "absolute top-6 -left-3.5 z-20 size-7 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-blue-600 transition-all",
                isRightPanelCollapsed && "left-2.5"
              )}
            >
              {isRightPanelCollapsed ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            </Button>

            <div className={cn(
              "flex-1 flex flex-col min-w-[320px] overflow-y-auto scrollbar-hide transition-opacity duration-300 h-full",
              isRightPanelCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs">Project Context</h3>
                  {project && (
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase">
                        {project.status === 1 ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  )}
                </div>
                
                {isProjectError || isMilestonesError ? (
                   <ErrorFallback 
                    message={(projectError as Error)?.message || (milestonesError as Error)?.message || 'Project data unavailable'} 
                    onRetry={() => { refetchProject(); refetchMilestones(); }} 
                   />
                ) : project ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Project Title</p>
                      <p className="text-sm font-black text-slate-900 leading-tight">{project.title}</p>
                    </div>
                    
                    {currentMilestone && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Milestone</p>
                        <p className="text-sm font-bold text-slate-800">{currentMilestone.title}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total Budget</p>
                        <p className="text-xs font-bold text-slate-900 bg-blue-50 px-2 py-1 rounded inline-block">
                          ${project.totalBudget?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</p>
                        <p className="text-xs font-bold text-slate-900">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium italic">No project context available yet.</p>
                )}

                <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex gap-3">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      This context is visible to both parties to ensure alignment on project goals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs">Shared Files</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium italic">Project files will appear here when available.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

