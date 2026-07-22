import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { withdrawSchema } from '../schema';
import { walletService } from '../services';

interface WithdrawModalProps {
  maxBalance: number;
}

export const WithdrawModal = ({ maxBalance }: WithdrawModalProps) => {
  const [open, setOpen] = useState(false);
  const [amountStr, setAmountStr] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const queryClient = useQueryClient();

  const withdrawMutation = useMutation({
    mutationFn: (values: { amount: number; paymentMethod: string }) => walletService.withdraw({
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      description: 'Wallet withdrawal',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast.success('Withdrawal request submitted successfully.');
      setOpen(false);
      setAmountStr('500');
      setPaymentMethod('bank');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to request withdrawal. Please try again.');
    },
  });

  const confirmWithdraw = () => {
    const result = withdrawSchema.safeParse({ amount: amountStr, paymentMethod });
    if (!result.success) {
      toast.error('Invalid withdraw amount. Please enter a valid number (1 - 100,000).');
      return;
    }

    if (result.data.amount > maxBalance) {
      toast.error('Insufficient balance to withdraw this amount.');
      return;
    }

    withdrawMutation.mutate(result.data);
  };

  const isInvalid = amountStr.trim() === '' || isNaN(Number(amountStr)) || Number(amountStr) <= 0 || Number(amountStr) > maxBalance;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setAmountStr('500');
      setPaymentMethod('bank');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button disabled={withdrawMutation.isPending} className="rounded-full px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold">
          Withdraw Earnings
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[60] grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-8 shadow-2xl rounded-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          
          <div className="flex justify-between items-start">
            <div>
              <Dialog.Title className="text-2xl font-black text-slate-900 mb-2">Withdraw Earnings</Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500 mb-6">
                Enter the amount of Aivora Coin you want to withdraw. The requested amount will be converted and transferred to your linked account.
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
              <label htmlFor="withdraw-amount" className="block text-xs font-bold text-slate-700 mb-1">Amount (Aivora Coin)</label>
              <div className="relative">
                <input 
                  id="withdraw-amount"
                  type="text" 
                  className="w-full rounded-lg border-slate-200 p-3 pl-4 pr-12 text-lg font-bold text-slate-900 focus:ring-primary focus:border-primary" 
                  placeholder="500"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Aivora Coin</span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Available to withdraw: {maxBalance.toLocaleString()} Aivora Coin</p>
            </div>
            <div>
              <label htmlFor="withdraw-payment-method" className="block text-xs font-bold text-slate-700 mb-1">Withdrawal Method</label>
              <select
                id="withdraw-payment-method"
                value={paymentMethod}
                onChange={event => setPaymentMethod(event.target.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 focus:border-primary focus:ring-primary"
              >
                <option value="bank">Bank transfer</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Dialog.Close asChild>
              <Button variant="outline" className="rounded-full font-bold">Cancel</Button>
            </Dialog.Close>
            <Button 
              onClick={confirmWithdraw} 
              disabled={withdrawMutation.isPending || isInvalid}
              className="rounded-full shadow-lg shadow-primary/20 font-black bg-primary hover:bg-primary/90"
            >
              {withdrawMutation.isPending ? 'Processing...' : 'Request Withdrawal'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
