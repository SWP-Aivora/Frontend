import { useEffect, useRef, useState } from 'react';
import { FileImage, FilePlus, Link, Lock, Plus, Send, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}

const actionItems = [
  { label: 'Add file', icon: FilePlus },
  { label: 'Add image', icon: FileImage },
  { label: 'Add link', icon: Link },
  { label: 'Add project file', icon: FileText },
  { label: 'Use template', icon: FileText },
];

export const MessageInput = ({ onSendMessage, disabled, disabledReason = 'Please wait before sending.' }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (content.trim() && !disabled && !isSending) {
      setIsSending(true);
      try {
        await onSendMessage(content.trim());
        setContent('');
      } catch {
        // Do not clear content on error so user can retry
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 border-t border-slate-200 bg-white">
      {disabled && (
        <p className="text-xs text-slate-500 mb-2 font-medium px-1">
          {disabledReason}
        </p>
      )}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
        <div className="relative shrink-0" ref={actionMenuRef}>
          <button
            type="button"
            onClick={() => setIsActionMenuOpen((open) => !open)}
            className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center justify-center"
            aria-label="Open message actions"
            aria-expanded={isActionMenuOpen}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {isActionMenuOpen && (
            <div className="absolute bottom-11 left-0 w-52 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 p-1.5 z-20">
              {actionItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-400 cursor-not-allowed"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-300">
                      <Lock className="w-3 h-3" />
                      Soon
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <textarea
          placeholder={disabled ? "Sending disabled..." : "Message..."}
          value={content}
          rows={1}
          onChange={(e) => {
            setContent(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 max-h-32 bg-transparent border-none focus:outline-none py-1.5 resize-none text-sm leading-relaxed scrollbar-hide"
          disabled={disabled}
          style={{ height: '36px' }}
        />
        
        <Button 
          type="submit" 
          size="sm" 
          aria-label="Send message"
          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50 disabled:bg-slate-300 shrink-0"
          disabled={!content.trim() || disabled || isSending}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
};
