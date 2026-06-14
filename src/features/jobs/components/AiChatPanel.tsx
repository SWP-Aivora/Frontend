import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '../types';

interface AiChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<unknown> | void;
  isGenerating: boolean;
  onRefine: (text: string) => Promise<unknown> | void;
  hasSuggestion: boolean;
}

export const AiChatPanel = ({ 
  messages, 
  onSendMessage, 
  isGenerating, 
  onRefine,
  hasSuggestion
}: AiChatPanelProps) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;
    
    const text = inputValue;
    setInputValue(''); // Optimistically clear input
    
    try {
      if (hasSuggestion) {
        await onRefine(text);
      } else {
        await onSendMessage(text);
      }
    } catch {
      // Restore input on failure
      setInputValue(text);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 leading-none">AIVORA AI</h3>
            <p className="text-[10px] font-bold text-brand-success uppercase tracking-widest mt-1">Smart Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             {hasSuggestion ? 'Refinement Mode' : 'Planning Mode'}
           </span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"
      >
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          const isSystem = msg.role === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="bg-slate-100/80 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5 border border-slate-200">
                  <Sparkles className="size-3" />
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex items-start gap-3 max-w-[90%]",
                isAi ? "mr-auto" : "flex-row-reverse ml-auto"
              )}
            >
              <div className={cn(
                "size-8 rounded-lg shrink-0 flex items-center justify-center border shadow-sm",
                isAi ? "bg-white border-slate-100" : "bg-primary border-primary"
              )}>
                {isAi ? <Bot className="size-4 text-primary" /> : <User className="size-4 text-white" />}
              </div>
              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                isAi 
                  ? "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm" 
                  : "bg-primary text-white rounded-tr-none shadow-md shadow-primary/10"
              )}>
                {msg.content}
              </div>
            </div>
          );
        })}
        
        {isGenerating && (
          <div className="flex items-start gap-3 max-w-[90%] mr-auto">
            <div className="size-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <Bot className="size-4 text-primary" />
            </div>
            <div className="bg-white border border-slate-100 text-slate-400 p-3 rounded-2xl rounded-tl-none shadow-sm italic flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isGenerating}
            placeholder={hasSuggestion ? "Ask AI to change title, budget, or milestones..." : "Describe your project idea..."}
            className="w-full h-12 pl-5 pr-12 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isGenerating}
            className="absolute right-1.5 top-1.5 size-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
