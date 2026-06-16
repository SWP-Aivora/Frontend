import { act, renderHook, waitFor } from '@testing-library/react';
import { useDisputes } from '../../../../features/disputes/hooks/useDisputes';
import { useDisputeDetails } from '../../../../features/disputes/hooks/useDisputeDetails';
import { useOpenDispute } from '../../../../features/disputes/hooks/useOpenDispute';
import { useResolveDispute } from '../../../../features/disputes/hooks/useResolveDispute';
import { useSubmitEvidence } from '../../../../features/disputes/hooks/useSubmitEvidence';
import { disputeService } from '../../../../features/disputes/services';
import { DisputeResolutionType, DisputeStatus, type Dispute } from '../../../../features/disputes/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

vi.mock('../../../../features/disputes/services', () => ({
  disputeService: {
    getDisputes: vi.fn(),
    getDisputeById: vi.fn(),
    openDispute: vi.fn(),
    resolveDispute: vi.fn(),
    addEvidence: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const dispute: Dispute = {
  id: 'd1',
  milestoneId: 'm1',
  milestoneTitle: 'Milestone 1',
  milestoneAmount: 500,
  projectId: 'p1',
  projectTitle: 'Project 1',
  clientId: 'c1',
  clientName: 'Client Name',
  expertId: 'e1',
  expertName: 'Expert Name',
  reason: 'Work not delivered',
  description: 'The submitted work was not delivered as agreed.',
  status: DisputeStatus.OPEN,
  evidences: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

describe('useDisputes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('calls disputeService.getDisputes with provided params', async () => {
    const mockData = { 
      data: [], 
      success: true, 
      message: '', 
      statusCode: 200, 
      metadata: { pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false } 
    };
    (vi.mocked(disputeService.getDisputes)).mockResolvedValue(mockData);

    const params = { PageIndex: 1, PageSize: 10 };
    const { result } = renderHook(() => useDisputes(params), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(disputeService.getDisputes).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(mockData);
  });

  it('does not fetch dispute details when id is empty', () => {
    renderHook(() => useDisputeDetails(''), { wrapper });

    expect(disputeService.getDisputeById).not.toHaveBeenCalled();
  });

  it('fetches dispute details when id is provided', async () => {
    const mockData = {
      data: dispute,
      success: true,
      message: '',
      statusCode: 200
    };
    (vi.mocked(disputeService.getDisputeById)).mockResolvedValue(mockData);

    const { result } = renderHook(() => useDisputeDetails('d1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(disputeService.getDisputeById).toHaveBeenCalledWith('d1');
    expect(result.current.data).toEqual(mockData);
  });

  it('opens dispute through mutation hook', async () => {
    const payload = {
      milestoneId: 'm1',
      reason: 'Work not delivered',
      description: 'The submitted work was not delivered as agreed.'
    };
    (vi.mocked(disputeService.openDispute)).mockResolvedValue({
      data: dispute,
      success: true,
      message: '',
      statusCode: 200
    });

    const { result } = renderHook(() => useOpenDispute(), { wrapper });

    act(() => {
      result.current.mutate(payload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(disputeService.openDispute).toHaveBeenCalledWith(payload);
  });

  it('submits evidence through mutation hook', async () => {
    const payload = {
      content: 'This evidence explains the dispute context in enough detail.',
      fileUrl: 'https://example.com/evidence.png'
    };
    (vi.mocked(disputeService.addEvidence)).mockResolvedValue({
      data: null,
      success: true,
      message: '',
      statusCode: 200
    });

    const { result } = renderHook(() => useSubmitEvidence('d1'), { wrapper });

    act(() => {
      result.current.mutate(payload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(disputeService.addEvidence).toHaveBeenCalledWith('d1', payload);
  });

  it('resolves dispute through mutation hook using string resolution type', async () => {
    const payload = {
      resolutionType: DisputeResolutionType.RELEASE_TO_EXPERT,
      resolutionNote: 'The resolution note must also be at least 50 characters long to satisfy the validation rules.'
    };
    (vi.mocked(disputeService.resolveDispute)).mockResolvedValue({
      data: null,
      success: true,
      message: '',
      statusCode: 200
    });

    const { result } = renderHook(() => useResolveDispute('d1'), { wrapper });

    act(() => {
      result.current.mutate(payload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(disputeService.resolveDispute).toHaveBeenCalledWith('d1', payload);
  });
});
