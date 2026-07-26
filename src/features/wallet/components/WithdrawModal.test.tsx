import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WithdrawModal } from './WithdrawModal';

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
  it('offers only VNPay sandbox as the withdrawal method', async () => {
    const user = userEvent.setup();

    renderWithdrawModal();

    await user.click(screen.getByRole('button', { name: /withdraw earnings/i }));
    expect(screen.getByLabelText(/withdrawal method/i)).toHaveValue('vnpay_sandbox');
    expect(screen.getByRole('option', { name: /vnpay sandbox/i })).toHaveValue('vnpay_sandbox');
    expect(screen.queryByRole('option', { name: /paypal/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /bank transfer/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /crypto/i })).not.toBeInTheDocument();
  });
});
