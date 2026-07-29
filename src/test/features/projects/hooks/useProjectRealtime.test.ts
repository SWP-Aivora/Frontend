import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockJoinProject = vi.fn().mockResolvedValue(undefined);
const mockLeaveProject = vi.fn().mockResolvedValue(undefined);
const mockOnMilestoneUpdate = vi.fn().mockReturnValue(vi.fn());

vi.mock('@/features/chat', () => ({
  chatService: {
    connect: (...args: unknown[]) => mockConnect(...args),
    joinProject: (...args: unknown[]) => mockJoinProject(...args),
    leaveProject: (...args: unknown[]) => mockLeaveProject(...args),
    onMilestoneUpdate: (...args: unknown[]) => mockOnMilestoneUpdate(...args),
  },
}));

let mockAuthState = { isAuthenticated: true };
vi.mock('@/features/auth/store', () => ({
  useAuthStore: (selector: (state: typeof mockAuthState) => unknown) => selector(mockAuthState),
}));

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

describe('useProjectRealtime', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnMilestoneUpdate.mockReturnValue(vi.fn());
    mockAuthState = { isAuthenticated: true };
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  it('connects and joins the project group on mount', async () => {
    const { useProjectRealtime } = await import('../../../../features/projects/hooks/useProjectRealtime');

    renderHook(() => useProjectRealtime('project-1'), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(mockConnect).toHaveBeenCalled());
    await waitFor(() => expect(mockJoinProject).toHaveBeenCalledWith('project-1'));
  });

  it('invalidates the 3 expected query keys on a matching MilestoneUpdated event', async () => {
    const { useProjectRealtime } = await import('../../../../features/projects/hooks/useProjectRealtime');
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useProjectRealtime('project-1'), { wrapper: createWrapper(queryClient) });

    expect(mockOnMilestoneUpdate).toHaveBeenCalledTimes(1);
    const registeredCallback = mockOnMilestoneUpdate.mock.calls[0][0] as (data: { projectId: string; milestoneId: string }) => void;

    act(() => {
      registeredCallback({ projectId: 'project-1', milestoneId: 'ms-1' });
    });

    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['project', 'project-1'] }));
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['project', 'project-1', 'milestones'] }));
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['project', 'project-1', 'active-disputes'] }));
  });

  it('ignores MilestoneUpdated events for a different project', async () => {
    const { useProjectRealtime } = await import('../../../../features/projects/hooks/useProjectRealtime');
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useProjectRealtime('project-1'), { wrapper: createWrapper(queryClient) });

    const registeredCallback = mockOnMilestoneUpdate.mock.calls[0][0] as (data: { projectId: string; milestoneId: string }) => void;

    act(() => {
      registeredCallback({ projectId: 'other-project', milestoneId: 'ms-1' });
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('unsubscribes and leaves the project group on unmount', async () => {
    const mockUnsubscribe = vi.fn();
    mockOnMilestoneUpdate.mockReturnValue(mockUnsubscribe);

    const { useProjectRealtime } = await import('../../../../features/projects/hooks/useProjectRealtime');

    const { unmount } = renderHook(() => useProjectRealtime('project-1'), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(mockJoinProject).toHaveBeenCalled());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    expect(mockLeaveProject).toHaveBeenCalledWith('project-1');
  });

  it('does nothing when there is no projectId', async () => {
    const { useProjectRealtime } = await import('../../../../features/projects/hooks/useProjectRealtime');

    renderHook(() => useProjectRealtime(undefined), { wrapper: createWrapper(queryClient) });

    expect(mockConnect).not.toHaveBeenCalled();
  });
});
