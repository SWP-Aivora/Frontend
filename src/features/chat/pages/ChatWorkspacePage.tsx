import { useState, useMemo, useEffect } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatBox } from '../components/ChatBox';
import { ChatHeader } from '../components/ChatHeader';
import { EmptyState } from '../components/EmptyState';
import { useConversations } from '../hooks/useConversations';
import { useMessages, useRealTimeMessages, useMarkRead, useSendMessage } from '../hooks/useMessages';
import type { Conversation } from '../types';
import { Info, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/features/projects/services';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

export const ChatWorkspacePage = () => {
  const location = useLocation();
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

  // Setup real-time message updates only when conversationId is available
  const { mutate: markAsRead } = useMarkRead();
  const { mutateAsync: sendMessage, isPending: isSendingMessage } = useSendMessage(selectedConversationId || '');

  // Enable real-time updates only when we have a valid conversation ID
  if (selectedConversationId) {
    useRealTimeMessages(selectedConversationId);
  }

  // Strictly use API data
  const conversations = useMemo(() => {
    return Array.isArray(conversationsData?.data) ? conversationsData.data : [];
  }, [conversationsData]);

  const hasProjectConversations = conversations.some((conversation) => !!conversation.projectId);

  const { data: projectsResponse } = useQuery({
    queryKey: ['projects', 'conversation-labels'],
    queryFn: () => projectService.getProjects({ PageSize: 100 }),
    enabled: hasProjectConversations,
  });

  const projectTitleById = useMemo(() => {
    const projects = Array.isArray(projectsResponse?.data) ? projectsResponse.data : [];
    return new Map(projects.map((project) => [project.id, project.title]));
  }, [projectsResponse]);

  const conversationsWithProjectTitles = useMemo(() => {
    return conversations.map((conversation) => {
      const projectTitle = conversation.projectId
        ? projectTitleById.get(conversation.projectId)
        : undefined;

      if (!projectTitle) return conversation;

      return {
        ...conversation,
        relatedTitle: projectTitle,
      };
    });
  }, [conversations, projectTitleById]);

  const targetConversationId = useMemo(() => {
    const stateConversationId = (location.state as { conversationId?: string } | null)?.conversationId;
    if (stateConversationId) return stateConversationId;

    return new URLSearchParams(location.search).get('conversationId') || undefined;
  }, [location.search, location.state]);

  useEffect(() => {
    if (!targetConversationId) return;
    if (selectedConversationId === targetConversationId) return;

    const conversationExists = conversationsWithProjectTitles.some((conversation) => conversation.id === targetConversationId);
    if (conversationExists) {
      setSelectedConversationId(targetConversationId);
    }
  }, [conversationsWithProjectTitles, selectedConversationId, targetConversationId]);

  const selectedConversation = useMemo(() => 
    conversationsWithProjectTitles.find((c: Conversation) => c.id === selectedConversationId),
  [conversationsWithProjectTitles, selectedConversationId]);

  const selectedProjectId = useMemo(() => {
    return typeof selectedConversation?.projectId === 'string' ? selectedConversation.projectId.trim() : '';
  }, [selectedConversation?.projectId]);

  const messages = useMemo(() => {
    return selectedConversationId ? (Array.isArray(messagesData?.data) ? messagesData.data : []) : [];
  }, [messagesData, selectedConversationId]);

  // Mark as read when conversation is selected and has unread messages
  useEffect(() => {
    if (selectedConversationId && selectedConversation?.unreadCount && selectedConversation.unreadCount > 0) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, selectedConversation?.unreadCount, markAsRead]);

  // Fetch project context only when the selected conversation has a valid project id.
  const { 
    data: projectResponse,
    isError: isProjectError,
    error: projectError,
    refetch: refetchProject
  } = useQuery({
    queryKey: ['project', selectedProjectId],
    queryFn: () => projectService.getProjectById(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const project = projectResponse?.data;
  const milestones = Array.isArray(project?.milestones) ? project.milestones : [];
  const currentMilestone = milestones.find(m => m.status === 1 || m.status === 2) || milestones[0];

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    try {
      await sendMessage({ content });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
      throw error;
    }
  };

  const ErrorFallback = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-lg border border-slate-100 m-4">
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

  const ProjectContextNotice = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-amber-800 uppercase tracking-wider">Project context unavailable</p>
          <p className="text-xs text-amber-700 font-medium mt-1">{message}</p>
          <button
            type="button"
            onClick={() => onRetry()}
            className="mt-3 text-[10px] font-black uppercase tracking-widest text-amber-800 hover:text-amber-900"
          >
            Retry
          </button>
        </div>
      </div>
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
            conversations={conversationsWithProjectTitles}
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
                isRightPanelCollapsed={isRightPanelCollapsed}
                onToggleRightPanel={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
              />
              
              <ChatBox 
                messages={messages} 
                isLoading={isLoadingMessages}
                isSending={isSendingMessage}
                onSendMessage={handleSendMessage}
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
            "hidden lg:flex flex-col bg-white transition-all duration-300 ease-in-out relative shrink-0 h-full overflow-hidden",
            isRightPanelCollapsed ? "w-0 border-l-0" : "w-80 border-l border-slate-200"
          )}>
            {/* Toggle Button for Right Panel - Positioned on the left edge */}
            {!isRightPanelCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                className="absolute top-6 -left-3.5 z-20 size-7 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-blue-600 transition-all"
              >
                <ChevronRight className="size-4" />
              </Button>
            )}

            <div className={cn(
              "flex-1 flex flex-col w-80 shrink-0 overflow-y-auto scrollbar-hide transition-opacity duration-300 h-full",
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
                
                {project ? (
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
                          {project.totalBudget?.toLocaleString()} Aivora Coin
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</p>
                        <p className="text-xs font-bold text-slate-900">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {isProjectError && (
                      <ProjectContextNotice
                        message={(projectError as Error)?.message || 'Project data unavailable'}
                        onRetry={refetchProject}
                      />
                    )}
                  </div>
                ) : isProjectError ? (
                  <ProjectContextNotice
                    message={(projectError as Error)?.message || 'Project data unavailable'}
                    onRetry={refetchProject}
                  />
                ) : (
                  <p className="text-xs text-slate-500 font-medium italic">No project context available yet.</p>
                )}

                <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
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
