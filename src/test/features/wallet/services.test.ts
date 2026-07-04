import { describe, it, expect, vi, beforeEach } from 'vitest';
import { walletService } from '../../../features/wallet/services';
import apiClient from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('walletService.depositDemo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the demo deposit endpoint and returns the updated wallet', async () => {
    (vi.mocked(apiClient.post)).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'wallet-1',
          userId: 'user-1',
          balance: 2000,
          currency: 'AICOIN',
          createdAt: '2026-07-01T00:00:00Z',
          updatedAt: '2026-07-04T00:00:00Z',
        },
        message: 'Demo deposit completed',
      },
    });

    const result = await walletService.depositDemo({ amount: 1000, description: 'Demo top-up' });

    expect(apiClient.post).toHaveBeenCalledWith('wallet/deposit-demo', { amount: 1000, description: 'Demo top-up' });
    expect(result.success).toBe(true);
    expect(result.data?.balance).toBe(2000);
  });
});
