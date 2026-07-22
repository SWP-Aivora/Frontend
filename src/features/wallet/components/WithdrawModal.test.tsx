import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WithdrawModal } from './WithdrawModal';
import { walletService } from '../services';

vi.mock('../services', () => ({
  walletService: {
    withdraw: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithdrawModal = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <WithdrawModal maxBalance={5000} />
    </QueryClientProvider>
  );
};

describe('WithdrawModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the selected withdrawal payment method in the real request payload', async () => {
    const user = userEvent.setup();
    vi.mocked(walletService.withdraw).mockResolvedValue({
      success: true,
      message: 'OK',
      statusCode: 200,
      data: {
        id: 'wallet-1',
        userId: 'user-1',
        balance: 3500,
        currency: 'AICOIN',
        createdAt: '2026-07-01T00:00:00Z',
        updatedAt: '2026-07-22T00:00:00Z',
      },
    });

    renderWithdrawModal();

    await user.click(screen.getByRole('button', { name: /withdraw earnings/i }));
    await user.selectOptions(screen.getByLabelText(/withdrawal method/i), 'paypal');
    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '1200');
    await user.click(screen.getByRole('button', { name: /request withdrawal/i }));

    await waitFor(() => {
      expect(walletService.withdraw).toHaveBeenCalledWith({
        amount: 1200,
        paymentMethod: 'paypal',
        description: 'Wallet withdrawal',
      });
    });
  });
});
