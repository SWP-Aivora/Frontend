import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/features/auth/store';

const mockConnection = vi.hoisted(() => ({
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  invoke: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  off: vi.fn(),
  onclose: vi.fn(),
  onreconnecting: vi.fn(),
  onreconnected: vi.fn(),
  state: 'Connected',
}));

vi.mock('@microsoft/signalr', async () => {
  const actual = await vi.importActual<typeof import('@microsoft/signalr')>('@microsoft/signalr');
  return {
    ...actual,
    HubConnectionBuilder: vi.fn().mockImplementation(() => ({
      withUrl: vi.fn().mockReturnThis(),
      withAutomaticReconnect: vi.fn().mockReturnThis(),
      build: vi.fn(() => mockConnection),
    })),
  };
});

const { useRealTimeMessages } = await import('./useMessages');
const { chatService } = await import('../services');
const { CHAT_SEND_TIMEOUT_MS } = await import('../constants');

describe('useRealTimeMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection.state = 'Connected';
    useAuthStore.setState({ accessToken: 'token-123', isAuthenticated: true });
  });

  it('joins the conversation SignalR group so ReceiveMessage broadcasts are received', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useRealTimeMessages('conversation-abc'), { wrapper });

    await waitFor(() => {
      expect(mockConnection.invoke).toHaveBeenCalledWith('JoinConversation', 'conversation-abc');
    });
  });

  it('rejects a hung SendMessage invocation with the chat send timeout error', async () => {
    vi.useFakeTimers();
    try {
      mockConnection.invoke.mockImplementation((method: string) => {
        if (method === 'SendMessage') {
          return new Promise(() => {});
        }
        return Promise.resolve();
      });

      const sendPromise = chatService.sendMessage('conversation-abc', { content: 'Hello' });

      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(CHAT_SEND_TIMEOUT_MS);

      await expect(sendPromise).rejects.toThrow('Message send timed out. Please try again.');
    } finally {
      vi.useRealTimers();
    }
  });
});
