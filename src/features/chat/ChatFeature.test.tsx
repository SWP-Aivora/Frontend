import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConversationList } from './components/ConversationList';
import { MessageInput } from './components/MessageInput';
import { ChatWorkspacePage } from './pages/ChatWorkspacePage';
import type { Conversation } from './types';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mediaService } from '@/shared/services/mediaService';

// Mock hooks
vi.mock('./hooks/useConversations', () => ({
  useConversations: vi.fn(() => ({
    data: { data: [] },
    isLoading: false
  }))
}));

vi.mock('./hooks/useMessages', () => ({
  useMessages: vi.fn(() => ({
    data: { data: [] },
    isLoading: false
  })),
  useSendMessage: vi.fn(() => ({
    mutateAsync: vi.fn()
  })),
  useMarkRead: vi.fn(() => ({
    mutate: vi.fn()
  })),
  useRealTimeMessages: vi.fn(),
  useTyping: vi.fn(() => ({ isOtherTyping: false, notifyTyping: vi.fn() }))
}));

vi.mock('@/shared/services/mediaService', () => ({
  mediaService: {
    uploadFile: vi.fn(),
    uploadImage: vi.fn()
  }
}));

vi.mock('@/features/projects/services', () => ({
  projectService: {
    getProjectById: vi.fn()
  }
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Chat Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ConversationList', () => {
    const mockConversations = [
      { 
        id: '1', 
        recipient: { fullName: 'John Doe', role: 'EXPERT' }, 
        unreadCount: 2,
        type: 'PROJECT'
      }
    ];

    it('renders loading state', () => {
      render(
        <ConversationList 
          conversations={[]} 
          isLoading={true} 
          onSelect={() => {}} 
          isCollapsed={false}
          onToggle={() => {}}
          searchTerm=""
          onSearchChange={() => {}}
        />,
        { wrapper }
      );
      expect(screen.getByText(/loading conversations/i)).toBeInTheDocument();
    });

    it('renders empty state', () => {
      render(
        <ConversationList 
          conversations={[]} 
          isLoading={false} 
          onSelect={() => {}} 
          isCollapsed={false}
          onToggle={() => {}}
          searchTerm=""
          onSearchChange={() => {}}
        />,
        { wrapper }
      );
      expect(screen.getByText(/no conversations found/i)).toBeInTheDocument();
    });

    it('calls onSelect when a conversation is clicked', () => {
      const onSelect = vi.fn();
      render(
        <ConversationList 
          conversations={mockConversations as unknown as Conversation[]} 
          isLoading={false} 
          onSelect={onSelect} 
          isCollapsed={false}
          onToggle={() => {}}
          searchTerm=""
          onSearchChange={() => {}}
        />,
        { wrapper }
      );
      
      fireEvent.click(screen.getByText('John Doe'));
      expect(onSelect).toHaveBeenCalledWith('1');
    });
  });

  describe('MessageInput', () => {
    it('calls onSendMessage when text is entered and send is clicked', async () => {
      const onSendMessage = vi.fn().mockResolvedValue(undefined);
      render(
        <MessageInput onSendMessage={onSendMessage} disabled={false} />,
        { wrapper }
      );

      const input = screen.getByPlaceholderText(/message/i);
      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(onSendMessage).toHaveBeenCalledWith('Hello world');
      });
    });

    it('disables send button when input is empty', () => {
      render(
        <MessageInput onSendMessage={vi.fn()} disabled={false} />,
        { wrapper }
      );
      expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
    });

    it('shows temporary disabled message and disables input when disabled prop is true', () => {
      render(
        <MessageInput onSendMessage={vi.fn()} disabled={true} />,
        { wrapper }
      );
      
      expect(screen.getByText(/please wait before sending/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/sending disabled/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
    });

    it('shows only API-supported upload actions in the message action menu', () => {
      const onSendMessage = vi.fn();
      render(
        <MessageInput onSendMessage={onSendMessage} disabled={false} />,
        { wrapper }
      );

      fireEvent.click(screen.getByRole('button', { name: /open message actions/i }));

      ['Add file', 'Add image'].forEach((label) => {
        expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toBeInTheDocument();
      });
      ['Add link', 'Add project file', 'Use template'].forEach((label) => {
        expect(screen.queryByRole('button', { name: new RegExp(label, 'i') })).not.toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('shows the API-based file upload notice before continuing', () => {
      const { container } = render(
        <MessageInput onSendMessage={vi.fn()} disabled={false} />,
        { wrapper }
      );
      const fileInput = container.querySelector('input[type="file"]:not([accept="image/*"])') as HTMLInputElement;

      fireEvent.change(fileInput, {
        target: {
          files: [new File(['image'], 'preview.png', { type: 'image/png' })]
        }
      });

      expect(screen.getByRole('dialog', { name: /file upload notice/i })).toBeInTheDocument();
      expect(screen.getByText(/api accepts a multipart file upload/i)).toBeInTheDocument();
      expect(screen.getByText(/does not document a file-extension allow-list/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
      expect(mediaService.uploadFile).not.toHaveBeenCalled();
    });
  });

  describe('ChatWorkspacePage - Search', () => {
    it('passes search parameters to useConversations hook', async () => {
      const { useConversations } = await import('./hooks/useConversations');
      
      render(<ChatWorkspacePage />, { wrapper });

      const input = screen.getByPlaceholderText(/search conversations/i);
      fireEvent.change(input, { target: { value: 'test search' } });

      // Wait for debounce
      await waitFor(() => {
        expect(useConversations).toHaveBeenCalledWith(expect.objectContaining({
          SearchTerm: 'test search',
          PageIndex: 1,
          PageSize: 100
        }));
      }, { timeout: 1000 });
    });
  });
});
