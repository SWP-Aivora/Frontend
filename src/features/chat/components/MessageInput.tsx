import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export const MessageInput = ({ onSendMessage, disabled }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

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
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-2 py-1 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
        {/* Attachment button hidden in production until media upload API is fully confirmed */}

        <textarea

          placeholder="Message..."
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
          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50 disabled:bg-slate-300 shrink-0"
          disabled={!content.trim() || disabled}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
};
