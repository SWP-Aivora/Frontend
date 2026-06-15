import { renderHook, waitFor } from '@testing-library/react';
import { useDisputes } from '../../../../features/disputes/hooks/useDisputes';
import { disputeService } from '../../../../features/disputes/services';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

vi.mock('../../../../features/disputes/services', () => ({
  disputeService: {
    getDisputes: vi.fn(),
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
});
