import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as reactQuery from '@tanstack/react-query';
import { useTransferToExpert } from '../../../../features/wallet/hooks/useTransferToExpert';
import { walletService } from '../../../../features/wallet/services';

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

vi.mock('../../../../features/wallet/services', () => ({
  walletService: {
    transferToExpert: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useTransferToExpert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets up the mutation correctly calling walletService.transferToExpert', async () => {
    const mockMutate = vi.fn();
    (vi.mocked(reactQuery.useMutation)).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as reactQuery.UseMutationResult<unknown, unknown, unknown, unknown>);

    renderHook(() => useTransferToExpert({ recipientId: 'expert-123' }));
    
    expect(reactQuery.useMutation).toHaveBeenCalledTimes(1);
    
    const mutationOptions = vi.mocked(reactQuery.useMutation).mock.calls[0][0] as {
      mutationFn: (data: unknown) => Promise<unknown>;
    };

    const testData = { amount: 500, description: 'Direct tip' };
    await mutationOptions.mutationFn(testData);

    expect(walletService.transferToExpert).toHaveBeenCalledWith('expert-123', testData);
  });
});
