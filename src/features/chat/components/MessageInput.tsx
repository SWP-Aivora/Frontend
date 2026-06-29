import { useEffect, useRef, useState } from 'react';
import { FileImage, FilePlus, Loader2, Plus, Send } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { mediaService } from '@/shared/services/mediaService';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}

export const MessageInput = ({ onSendMessage, disabled, disabledReason = 'Please wait before sending.' }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const appendUploadedUrl = (label: string, url: string) => {
    setContent((current) => {
      const prefix = current.trim() ? `${current.trim()}\n` : '';
      return `${prefix}${label}: ${url}`;
    });
  };

  const handleUpload = async (file: File | undefined, kind: 'file' | 'image') => {
    if (!file || disabled || isSending || isUploading) return;

    setIsUploading(true);
    setUploadError(null);
    setIsActionMenuOpen(false);

    try {
      const response = kind === 'image'
        ? await mediaService.uploadImage(file, 'chat')
        : await mediaService.uploadFile(file, 'chat');
      const url = response.data?.url;

      if (!response.success || !url) {
        throw new Error(response.message || 'Upload failed');
      }

      appendUploadedUrl(kind === 'image' ? 'Image' : 'File', url);
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (kind === 'image' && imageInputRef.current) imageInputRef.current.value = '';
      if (kind === 'file' && fileInputRef.current) fileInputRef.current.value = '';
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
      {uploadError && (
        <p className="text-xs text-rose-500 mb-2 font-medium px-1">
          {uploadError}
        </p>
      )}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
        <div className="relative shrink-0" ref={actionMenuRef}>
          <button
            type="button"
            onClick={() => setIsActionMenuOpen((open) => !open)}
            className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Open message actions"
            aria-expanded={isActionMenuOpen}
            disabled={disabled || isSending || isUploading}
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(event) => handleUpload(event.target.files?.[0], 'file')}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleUpload(event.target.files?.[0], 'image')}
          />

          {isActionMenuOpen && (
            <div className="absolute bottom-11 left-0 w-44 rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/60 p-1.5 z-20">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <FilePlus className="w-3.5 h-3.5 shrink-0" />
                <span>Add file</span>
              </button>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <FileImage className="w-3.5 h-3.5 shrink-0" />
                <span>Add image</span>
              </button>
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
          disabled={!content.trim() || disabled || isSending || isUploading}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
};
