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

describe('walletService.transferToExpert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the transfer endpoint with expertId and payload', async () => {
    (vi.mocked(apiClient.post)).mockResolvedValue({
      data: {
        success: true,
        data: {
          wallet: {
            id: 'wallet-1',
            userId: 'user-client',
            balance: 9000,
            currency: 'AICOIN',
          },
          transaction: {
            id: 'tx-1',
            walletId: 'wallet-1',
            amount: 1000,
            type: 2, // Payment/Transfer type
            status: 1, // Completed
            description: 'Direct Transfer to Expert',
            createdAt: '2026-07-04T00:00:00Z',
          },
        },
        message: 'Transfer to expert processed successfully',
      },
    });

    const result = await walletService.transferToExpert('expert-user-id', {
      amount: 1000,
      description: 'Direct Transfer to Expert',
    });

    expect(apiClient.post).toHaveBeenCalledWith('wallet/transfer/expert-user-id', {
      amount: 1000,
      description: 'Direct Transfer to Expert',
    });
    expect(result.success).toBe(true);
    expect(result.data?.transaction.amount).toBe(1000);
  });
});
