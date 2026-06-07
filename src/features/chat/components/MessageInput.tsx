import { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onAttachFile?: (file: File) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSendMessage, onAttachFile, disabled }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (content.trim() && !disabled) {
      onSendMessage(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAttachFile) {
      onAttachFile(file);
    }
  };

  return (
    <div className="p-3 border-t border-slate-200 bg-white">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-2 py-1 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        
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
