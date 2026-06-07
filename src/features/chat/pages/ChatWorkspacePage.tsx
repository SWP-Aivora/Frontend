import { useState, useMemo } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatBox } from '../components/ChatBox';
import { ChatHeader } from '../components/ChatHeader';
import { EmptyState } from '../components/EmptyState';
import { useConversations } from '../hooks/useConversations';
import { useMessages, useSendMessage } from '../hooks/useMessages';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../mock';
import type { Conversation } from '../types';
import { FileText, Download, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/lib/utils';

export const ChatWorkspacePage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  
  // Real API hooks
  const { data: conversationsData, isLoading: isLoadingConversations } = useConversations();
  const { data: messagesData, isLoading: isLoadingMessages } = useMessages(selectedConversationId || '');
  const sendMessageMutation = useSendMessage();

  // Fallback to mock data if API is not ready/empty
  const conversations = useMemo(() => {
    if (conversationsData?.data && conversationsData.data.length > 0) {
      return conversationsData.data;
    }
    return MOCK_CONVERSATIONS;
  }, [conversationsData]);

  const selectedConversation = useMemo(() => 
    conversations.find((c: Conversation) => c.id === selectedConversationId),
  [conversations, selectedConversationId]);

  const messages = useMemo(() => {
    if (messagesData?.data && messagesData.data.length > 0) {
      return messagesData.data;
    }
    return selectedConversationId ? (MOCK_MESSAGES[selectedConversationId] || []) : [];
  }, [messagesData, selectedConversationId]);

  const handleSendMessage = (content: string) => {
    if (selectedConversationId) {
      sendMessageMutation.mutate({ conversationId: selectedConversationId, content });
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-white flex overflow-hidden border-t border-slate-200">
      {/* Left Column: Conversation List */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelect={setSelectedConversationId}
        isLoading={isLoadingConversations}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Workspace Wrapper (Middle + Right) */}
      <div className="flex-1 flex overflow-hidden h-full">
        {/* Middle Column: Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative border-r border-slate-100 h-full">
          {selectedConversation ? (
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
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">ACTIVE</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Project Title</p>
                    <p className="text-sm font-black text-slate-900 leading-tight">{selectedConversation.relatedTitle}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Milestone</p>
                    <p className="text-sm font-bold text-slate-800">Conversation Flow Design</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Payment</p>
                      <p className="text-xs font-bold text-slate-900 bg-blue-50 px-2 py-1 rounded inline-block">HELD</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</p>
                      <p className="text-xs font-bold text-slate-900">June 12</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                      <span className="text-[10px] font-black text-blue-600">62%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex gap-3">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                      This context is visible to both parties to ensure alignment on project goals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs">Shared Files</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">3 TOTAL</span>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Product Catalog.xlsx', size: '2.4 MB', type: 'XLSX' },
                    { name: 'Conversation Flow.pdf', size: '1.1 MB', type: 'PDF' },
                    { name: 'Testing Report.docx', size: '850 KB', type: 'DOCX' }
                  ].map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                      <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                        <FileText className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 truncate tracking-tight">{file.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{file.size} • {file.type}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 rounded-lg">
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button variant="ghost" className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 h-10 rounded-xl">
                  View all files
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
