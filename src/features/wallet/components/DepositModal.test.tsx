import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DepositModal } from './DepositModal';
import { walletService } from '../services';

vi.mock('../services', () => ({
  walletService: {
    createVnPayDeposit: vi.fn(),
    depositDemo: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderDepositModal = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DepositModal />
    </QueryClientProvider>
  );
};

describe('DepositModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('treats decimal amounts as invalid before submission', async () => {
    const user = userEvent.setup();
    renderDepositModal();

    await user.click(screen.getByRole('button', { name: /deposit funds/i }));
    const amountInput = screen.getByLabelText(/amount/i);

    await user.clear(amountInput);
    await user.type(amountInput, '1.5');

    expect(screen.getByText('Amount must be a whole number.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /demo top-up/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^deposit$/i })).toBeDisabled();
    expect(walletService.depositDemo).not.toHaveBeenCalled();
    expect(walletService.createVnPayDeposit).not.toHaveBeenCalled();
  });

  it('keeps existing deposit actions enabled for valid integer amounts', async () => {
    const user = userEvent.setup();
    vi.mocked(walletService.depositDemo).mockResolvedValue({
      success: true,
      message: 'OK',
      statusCode: 200,
      data: null,
    });

    renderDepositModal();

    await user.click(screen.getByRole('button', { name: /deposit funds/i }));
    const amountInput = screen.getByLabelText(/amount/i);

    await user.clear(amountInput);
    await user.type(amountInput, '1500');

    expect(screen.queryByText('Amount must be a whole number.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /demo top-up/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /^deposit$/i })).not.toBeDisabled();

    await user.click(screen.getByRole('button', { name: /demo top-up/i }));

    await waitFor(() => {
      expect(walletService.depositDemo).toHaveBeenCalledWith({ amount: 1500, description: 'Demo top-up' });
    });
  });
});
