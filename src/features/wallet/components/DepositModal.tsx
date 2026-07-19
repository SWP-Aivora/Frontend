import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services';
import { toast } from 'sonner';
import { depositSchema } from '../schema';

const getDepositAmountError = (amountStr: string): string | null => {
  const trimmedAmount = amountStr.trim();
  if (!trimmedAmount) return 'Amount is required.';

  const amount = Number(trimmedAmount);
  if (!Number.isFinite(amount)) return 'Amount must be a valid number.';
  if (!Number.isInteger(amount)) return 'Amount must be a whole number.';

  const result = depositSchema.safeParse({ amount: trimmedAmount });
  if (result.success) return null;

  if (amount <= 0) return 'Amount must be at least 1.';
  if (amount > 100000) return 'Amount must be 100,000 or less.';
  return 'Invalid deposit amount. Please enter a valid number (1 - 100,000).';
};

const getDepositRedirectUrl = (data: unknown): string | null => {
  if (typeof data === 'string') return data.trim() || null;
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  const candidates = [
    record.paymentUrl,
    record.paymentURL,
    record.url,
    record.redirectUrl,
    record.redirectURL,
    record.checkoutUrl,
    record.checkoutURL,
    record.vnpayUrl,
    record.vnPayUrl,
  ];

  return candidates.find((value): value is string => typeof value === 'string' && value.trim() !== '') ?? null;
};

export const DepositModal = () => {
  const [open, setOpen] = useState(false);
  const [amountStr, setAmountStr] = useState<string>('1000');
  const queryClient = useQueryClient();
  const amountError = getDepositAmountError(amountStr);

  const depositMutation = useMutation({
    mutationFn: (amt: number) => walletService.createVnPayDeposit({ amount: amt }),
    onSuccess: response => {
      const redirectUrl = getDepositRedirectUrl(response.data);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      setOpen(false);
      setAmountStr('1000');

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      toast.success('Deposit request created successfully.');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to deposit funds. Please try again.');
    },
  });

  const demoDepositMutation = useMutation({
    mutationFn: (amt: number) => walletService.depositDemo({ amount: amt, description: 'Demo top-up' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      setOpen(false);
      setAmountStr('1000');
      toast.success('Demo deposit completed.');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to complete demo deposit. Please try again.');
    },
  });

  const parseAmount = () => {
    const result = depositSchema.safeParse({ amount: amountStr });
    if (!result.success) {
      toast.error(amountError ?? 'Invalid deposit amount. Please enter a valid number (1 - 100,000).');
      return null;
    }
    return result.data.amount;
  };

  const confirmDeposit = () => {
    const amount = parseAmount();
    if (amount !== null) depositMutation.mutate(amount);
  };

  const confirmDemoDeposit = () => {
    const amount = parseAmount();
    if (amount !== null) demoDepositMutation.mutate(amount);
  };

  const isPending = depositMutation.isPending || demoDepositMutation.isPending;
  const isInvalid = amountError !== null;

  return (
    <Dialog.Root open={open} onOpenChange={(o: boolean) => {
      setOpen(o);
      if (!o) setAmountStr('1000');
    }}>
      <Dialog.Trigger asChild>
        <Button disabled={isPending} className="rounded-full px-6 shadow-lg shadow-primary/20 flex items-center gap-2">
          <Plus className="size-4" />
          Deposit Funds
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[60] grid w-[calc(100vw-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-2xl rounded-2xl duration-200 sm:p-8 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          
          <div className="flex justify-between items-start">
            <div>
              <Dialog.Title className="text-2xl font-black text-slate-900 mb-2">Deposit Aivora Coin</Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500 mb-6">
                Enter the amount of Aivora Coin you want to add to your wallet.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button aria-label="Close dialog" className="rounded-full p-1.5 hover:bg-slate-100 transition-colors">
                <X className="size-5 text-slate-500" />
              </button>
            </Dialog.Close>
          </div>
          
          <div className="space-y-4 mb-4">
            <div>
              <label htmlFor="deposit-amount" className="block text-xs font-bold text-slate-700 mb-1">Amount (Aivora Coin)</label>
              <div className="relative">
                <input 
                  id="deposit-amount"
                  type="text" 
                  aria-invalid={isInvalid}
                  aria-describedby={isInvalid ? 'deposit-amount-error' : undefined}
                  className="w-full rounded-lg border-slate-200 p-3 pl-4 pr-32 text-lg font-bold text-slate-900 focus:ring-primary focus:border-primary" 
                  placeholder="1000"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Aivora Coin</span>
              </div>
              {amountError && (
                <p id="deposit-amount-error" role="alert" className="mt-2 text-xs font-bold text-rose-600">
                  {amountError}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.35fr_1fr]">
            <Dialog.Close asChild>
              <Button variant="outline" className="w-full rounded-full font-bold">Cancel</Button>
            </Dialog.Close>
            <Button
              onClick={confirmDemoDeposit}
              disabled={isPending || isInvalid}
              variant="outline"
              className="w-full rounded-full font-bold"
              title="Instantly credit your wallet without going through VNPay — useful for testing"
            >
              {demoDepositMutation.isPending ? 'Processing...' : 'Demo Top-up'}
            </Button>
            <Button
              onClick={confirmDeposit}
              disabled={isPending || isInvalid}
              className="w-full rounded-full shadow-lg shadow-primary/20 font-black"
            >
              {depositMutation.isPending ? 'Processing...' : 'Deposit'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
