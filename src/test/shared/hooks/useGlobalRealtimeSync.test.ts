import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// --- Mocks ---

// Mock chatService
const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockOnJobStatusUpdate = vi.fn().mockReturnValue(vi.fn()); // returns unsubscribe
const mockOnNewJobPublished = vi.fn().mockReturnValue(vi.fn()); // returns unsubscribe

vi.mock('@/features/chat/services', () => ({
  configureChatAccessTokenProvider: vi.fn(),
  chatService: {
    connect: (...args: unknown[]) => mockConnect(...args),
    onJobStatusUpdate: (...args: unknown[]) => mockOnJobStatusUpdate(...args),
    onNewJobPublished: (...args: unknown[]) => mockOnNewJobPublished(...args),
    resetChatConnection: vi.fn(),
  },
}));

// Mock useAuthStore — initial default: not authenticated
let mockAuthState = {
  accessToken: null as string | null,
  isAuthenticated: false,
};

vi.mock('@/features/auth/store', () => ({
  useAuthStore: () => mockAuthState,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// --- Helpers ---

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

// --- Tests ---

describe('useGlobalRealtimeSync', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    // Reset auth state to unauthenticated by default
    mockAuthState = { accessToken: null, isAuthenticated: false };
  });

  it('calls chatService.connect() when user is authenticated', async () => {
    mockAuthState = { accessToken: 'test-token-123', isAuthenticated: true };

    // Dynamically import AFTER mocks are set up
    const { useGlobalRealtimeSync } = await import(
      '@/shared/hooks/useGlobalRealtimeSync'
    );

    renderHook(() => useGlobalRealtimeSync(), {
      wrapper: createWrapper(queryClient),
    });

    expect(mockConnect).toHaveBeenCalledWith();
  });

  it('does NOT call chatService.connect when there is no authentication', async () => {
    mockAuthState = { accessToken: null, isAuthenticated: false };

    const { useGlobalRealtimeSync } = await import(
      '@/shared/hooks/useGlobalRealtimeSync'
    );

    renderHook(() => useGlobalRealtimeSync(), {
      wrapper: createWrapper(queryClient),
    });

    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('subscribes to chatService.onJobStatusUpdate and invalidates all relevant query keys on event', async () => {
    mockAuthState = { accessToken: 'token-abc', isAuthenticated: true };

    const { useGlobalRealtimeSync } = await import(
      '@/shared/hooks/useGlobalRealtimeSync'
    );

    // Spy on queryClient.invalidateQueries
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    queryClient.setQueryData(['project', 'project-1'], {
      data: {
        id: 'project-1',
        jobId: 'job-1',
      },
    });

    renderHook(() => useGlobalRealtimeSync(), {
      wrapper: createWrapper(queryClient),
    });

    // onJobStatusUpdate should have been called with a callback
    expect(mockOnJobStatusUpdate).toHaveBeenCalledTimes(1);
    const registeredCallback = mockOnJobStatusUpdate.mock.calls[0][0] as (
      data: { jobId: string; status: string; title?: string }
    ) => void;

    // Simulate a job status event
    act(() => {
      registeredCallback({
        jobId: 'job-1',
        status: 'completed',
        title: 'My Test Job',
      });
    });

    // All relevant query keys should be invalidated
    const expectedKeys = [
      ['jobs'],
      ['clientJobs'],
      ['myProposals'],
      ['expertProjects'],
      ['clientProjects'],
      ['project', 'project-1'],
      ['project', 'project-1', 'milestones'],
      ['project', 'project-1', 'active-disputes'],
      ['wallet'],
      ['notifications'],
    ];

    for (const key of expectedKeys) {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: key })
      );
    }
    expect(invalidateSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['project'] })
    );
    expect(invalidateSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['milestone'] })
    );
  });

  it('cleans up (unsubscribes) on unmount', async () => {
    mockAuthState = { accessToken: 'token-xyz', isAuthenticated: true };

    const mockUnsubscribe = vi.fn();
    mockOnJobStatusUpdate.mockReturnValue(mockUnsubscribe);

    const { useGlobalRealtimeSync } = await import(
      '@/shared/hooks/useGlobalRealtimeSync'
    );

    const { unmount } = renderHook(() => useGlobalRealtimeSync(), {
      wrapper: createWrapper(queryClient),
    });

    // Unmount should trigger cleanup
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
  it('does NOT call chatService.connect when user is NOT authenticated', async () => {
    mockAuthState = { accessToken: 'some-token', isAuthenticated: false };

    const { useGlobalRealtimeSync } = await import(
      '@/shared/hooks/useGlobalRealtimeSync'
    );

    renderHook(() => useGlobalRealtimeSync(), {
      wrapper: createWrapper(queryClient),
    });

    expect(mockConnect).not.toHaveBeenCalled();
  });
});
