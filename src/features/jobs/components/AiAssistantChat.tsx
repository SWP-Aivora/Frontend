import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Sparkles, Bot, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  attachment?: string;
}

export const AiAssistantChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm your AI Job Assistant. Describe your project idea on the left, and I'll help you structure it into a professional job post.",
      timestamp: '09:00',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate AI reply
    timeoutRef.current = setTimeout(() => {
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I've analyzed your input. Would you like me to suggest some specific AI skills and milestones for this project?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiReply]);
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xl flex flex-col h-[700px] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Header */}
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="size-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 leading-none">AIVORA AI</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="size-2 bg-brand-success rounded-full animate-pulse" />
              <span className="text-xs font-bold text-brand-success uppercase tracking-wider">AI Chatbot Expert / Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="hidden sm:flex bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Assistant Mode</span>
           </div>
           <Button variant="outline" size="sm" className="rounded-lg h-9 px-4 border-slate-200 text-primary font-bold text-xs gap-2">
              <ExternalLink className="size-3" />
              Preview Job
           </Button>
        </div>
      </div>

      {/* Warning/Notice */}
      <div className="px-6 py-2.5 bg-brand-blue-light/30 border-b border-slate-100 flex items-center gap-3">
         <Sparkles className="size-3 text-primary shrink-0" />
         <p className="text-xs font-medium text-slate-500 leading-tight">
            AI suggestions are structured to help you attract the best experts. Review before posting.
         </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isAi ? "items-start" : "items-end ml-auto")}>
              <div className="flex items-center gap-2 mb-1.5">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                   {isAi ? 'AIVORA Assistant' : 'You'}
                 </span>
                 <span className="text-xs font-medium text-slate-300">{msg.timestamp}</span>
              </div>
              <div className={cn(
                "p-4 rounded-lg text-sm leading-relaxed shadow-sm",
                isAi 
                  ? "bg-white border border-slate-100 text-slate-700 rounded-tl-none" 
                  : "bg-primary text-white rounded-tr-none shadow-primary/20"
              )}>
                {msg.text}
                {msg.attachment && (
                  <div className="mt-3 p-2 bg-white/10 rounded-lg flex items-center gap-2 border border-white/20">
                     <Paperclip className="size-3" />
                     <span className="text-xs font-bold">{msg.attachment}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-50">
        <div className="relative group">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI to refine your job post..."
            className="w-full h-14 pl-6 pr-32 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all duration-300 text-sm font-medium"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="p-2.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary transition-all">
              <Paperclip className="size-5" />
            </button>
            <button 
              onClick={handleSend}
              className="bg-primary size-10 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
