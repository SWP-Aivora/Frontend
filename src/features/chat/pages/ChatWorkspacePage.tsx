import { useState, useMemo, useEffect } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatBox } from '../components/ChatBox';
import { ChatHeader } from '../components/ChatHeader';
import { EmptyState } from '../components/EmptyState';
import { useConversations } from '../hooks/useConversations';
import { useMessages, useRealTimeMessages, useMarkRead, useSendMessage, useTyping } from '../hooks/useMessages';
import type { Conversation } from '../types';
import { ChevronRight, AlertCircle, RefreshCw, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api-utils';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/features/projects/services';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { serviceRequestContextService } from '@/shared/services/serviceRequestContextService';
import { QUERY_KEYS } from '@/shared/constants';

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

  // Enable real-time updates - hook handles conditional logic internally
  useRealTimeMessages(selectedConversationId);
  const { isOtherTyping, notifyTyping } = useTyping(selectedConversationId);

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

  const serviceRequestIds = useMemo(() => {
    return Array.from(new Set(
      conversations
        .filter((conversation) => conversation.type === 'SERVICE_REQUEST' && conversation.serviceRequestId)
        .map((conversation) => conversation.serviceRequestId!),
    ));
  }, [conversations]);

  const { data: serviceRequestTitleResponses } = useQuery({
    queryKey: ['service-requests', 'conversation-labels', serviceRequestIds],
    queryFn: async () => Promise.all(serviceRequestIds.map((id) => serviceRequestContextService.getById(id))),
    enabled: serviceRequestIds.length > 0,
  });

  const serviceRequestTitleById = useMemo(() => {
    const entries = (serviceRequestTitleResponses ?? [])
      .map((response) => response.data)
      .filter((request): request is NonNullable<typeof request> => Boolean(request))
      .map((request) => [request.id, request.serviceTitle || request.packageTitle || ''] as const)
      .filter(([, title]) => Boolean(title));

    return new Map(entries);
  }, [serviceRequestTitleResponses]);

  const conversationsWithProjectTitles = useMemo(() => {
    return conversations.map((conversation) => {
      const projectTitle = conversation.projectId
        ? projectTitleById.get(conversation.projectId)
        : undefined;
      const serviceRequestTitle = conversation.serviceRequestId
        ? serviceRequestTitleById.get(conversation.serviceRequestId)
        : undefined;

      const relatedTitle = projectTitle || serviceRequestTitle;
      if (!relatedTitle) return conversation;

      return {
        ...conversation,
        relatedTitle,
      };
    });
  }, [conversations, projectTitleById, serviceRequestTitleById]);

  const targetConversationId = useMemo(() => {
    const stateConversationId = (location.state as { conversationId?: string; serviceRequestId?: string; jobId?: string } | null)?.conversationId;
    if (stateConversationId) return stateConversationId;

    return new URLSearchParams(location.search).get('conversationId') || undefined;
  }, [location.search, location.state]);

  const targetServiceRequestId = useMemo(() => {
    const stateServiceRequestId = (location.state as { conversationId?: string; serviceRequestId?: string; jobId?: string } | null)?.serviceRequestId;
    if (stateServiceRequestId) return stateServiceRequestId;

    return new URLSearchParams(location.search).get('serviceRequestId') || undefined;
  }, [location.search, location.state]);

  const targetJobId = useMemo(() => {
    const stateJobId = (location.state as { conversationId?: string; serviceRequestId?: string; jobId?: string } | null)?.jobId;
    if (stateJobId) return stateJobId;

    return new URLSearchParams(location.search).get('jobId') || undefined;
  }, [location.search, location.state]);

  useEffect(() => {
    if (!targetConversationId && !targetServiceRequestId && !targetJobId) return;

    const targetConversation = conversationsWithProjectTitles.find((conversation) => {
      if (targetConversationId) return conversation.id === targetConversationId;
      if (targetServiceRequestId) return conversation.serviceRequestId === targetServiceRequestId;
      return conversation.jobId === targetJobId;
    });

    if (targetConversation && selectedConversationId !== targetConversation.id) {
      setSelectedConversationId(targetConversation.id);
    }
  }, [conversationsWithProjectTitles, selectedConversationId, targetConversationId, targetJobId, targetServiceRequestId]);

  const selectedConversation = useMemo(() => 
    conversationsWithProjectTitles.find((c: Conversation) => c.id === selectedConversationId),
  [conversationsWithProjectTitles, selectedConversationId]);

  const selectedServiceRequestId = useMemo(() => {
    return typeof selectedConversation?.serviceRequestId === 'string' ? selectedConversation.serviceRequestId.trim() : '';
  }, [selectedConversation?.serviceRequestId]);

  const messages = useMemo(() => {
    return selectedConversationId ? (Array.isArray(messagesData?.data) ? messagesData.data : []) : [];
  }, [messagesData, selectedConversationId]);
  const sharedFiles = useMemo(() => {
    return messages
      .filter((message) => Boolean(message.fileUrl))
      .map((message) => ({
        id: message.id,
        url: message.fileUrl!,
        name: message.fileName || message.fileUrl!.split('#')[0].split('?')[0].split('/').pop() || 'Attached File',
        senderName: message.senderName,
        createdAt: message.createdAt,
      }));
  }, [messages]);

  // Mark as read when conversation is selected and has unread messages
  useEffect(() => {
    if (selectedConversationId && selectedConversation?.unreadCount && selectedConversation.unreadCount > 0) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, selectedConversation?.unreadCount, markAsRead]);

  const {
    data: serviceRequestResponse,
    isLoading: isServiceRequestLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.SERVICES.REQUEST_DETAIL(selectedServiceRequestId),
    queryFn: () => serviceRequestContextService.getById(selectedServiceRequestId),
    enabled: selectedConversation?.type === 'SERVICE_REQUEST' && !!selectedServiceRequestId,
  });

  const serviceRequest = serviceRequestResponse?.data;
  const serviceRequestTitle = useMemo(() => {
    if (!serviceRequest) return '';

    return serviceRequest.serviceTitle
      || serviceRequest.packageTitle
      || 'Service Request';
  }, [serviceRequest]);
  const selectedConversationForDisplay = useMemo(() => {
    if (
      !selectedConversation
      || selectedConversation.type !== 'SERVICE_REQUEST'
      || !serviceRequestTitle
      || selectedConversation.relatedTitle === serviceRequestTitle
    ) {
      return selectedConversation;
    }

    return {
      ...selectedConversation,
      relatedTitle: serviceRequestTitle,
    };
  }, [selectedConversation, serviceRequestTitle]);

  const handleSendMessage = async (content: string, attachmentUrl?: string) => {
    if (!selectedConversationId) return;

    try {
      await sendMessage({ content, attachmentUrl });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to send message. Please try again.'));
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
          ) : selectedConversationForDisplay ? (
            <>
              <ChatHeader 
                recipient={selectedConversationForDisplay.recipient} 
                type={selectedConversationForDisplay.type}
                relatedTitle={selectedConversationForDisplay.relatedTitle}
                projectId={selectedConversationForDisplay.projectId}
                serviceRequestId={selectedConversationForDisplay.serviceRequestId}
                serviceId={serviceRequest?.serviceId}
                isServiceRequestLoading={isServiceRequestLoading}
                isRightPanelCollapsed={isRightPanelCollapsed}
                onToggleRightPanel={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
              />
              
              <ChatBox
                messages={messages}
                isLoading={isLoadingMessages}
                isSending={isSendingMessage}
                isOtherTyping={isOtherTyping}
                onSendMessage={handleSendMessage}
                onTyping={notifyTyping}
              />
            </>
          ) : (
            <div className="flex-1 h-full">
              <EmptyState />
            </div>
          )}
        </div>

        {/* Right Column: Shared Files */}
        {selectedConversation && (
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
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs">Shared Files</h3>
                </div>

                {sharedFiles.length > 0 ? (
                  <div className="space-y-3">
                    {sharedFiles.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-blue-100 hover:bg-blue-50"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                          <FileText className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black text-slate-900 group-hover:text-blue-700">{file.name}</span>
                          <span className="mt-1 block text-xs font-medium text-slate-500">
                            {file.senderName}
                            {file.createdAt ? ` - ${new Date(file.createdAt).toLocaleDateString()}` : ''}
                          </span>
                        </span>
                        <ExternalLink className="mt-1 size-4 shrink-0 text-slate-300 group-hover:text-blue-500" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium italic">Shared files will appear here when available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
