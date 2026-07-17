import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { walletService } from '../services';
import { transferSchema, type TransferFormValues } from '../schema';
import { useTransferToExpert } from '../hooks/useTransferToExpert';

interface DirectTransferModalProps {
  recipientId: string;
  recipientName: string;
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

const getWalletBalance = (wallet: unknown): number => {
  if (!wallet || typeof wallet !== 'object') return 0;
  const record = wallet as Record<string, unknown>;
  const balance = [
    record.balance,
    record.availableBalance,
    record.walletBalance,
    record.amount,
  ].map(toNumber).find((value): value is number => value !== null);

  if (balance !== undefined) return balance;

  if (record.wallet && typeof record.wallet === 'object') {
    return getWalletBalance(record.wallet);
  }
  return 0;
};

export const DirectTransferModal = ({ recipientId, recipientName }: DirectTransferModalProps) => {
  const [open, setOpen] = useState(false);

  const { data: walletResponse } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
    enabled: open,
  });

  const walletBalance = walletResponse?.data ? getWalletBalance(walletResponse.data) : 0;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: 10,
      description: '',
    },
    mode: 'onChange',
  });

  const transferMutation = useTransferToExpert({
    recipientId,
    onSuccess: () => {
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: TransferFormValues) => {
    if (data.amount > walletBalance) {
      setError('amount', {
        type: 'manual',
        message: 'Available wallet balance is not enough for this transfer.',
      });
      return;
    }
    transferMutation.mutate(data);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button 
          disabled={transferMutation.isPending} 
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 text-sm shadow-md transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Direct Transfer
        </Button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[60] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-8 shadow-2xl rounded-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <ArrowRightLeft className="size-5" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-black text-slate-900">
                  Direct Transfer
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500">
                  Send Aivora Coin directly to the expert outside the normal milestone workflow.
                </Dialog.Description>
              </div>
            </div>
            
            <Dialog.Close asChild>
              <button aria-label="Close dialog" className="rounded-full p-1.5 hover:bg-slate-100 transition-colors">
                <X className="size-5 text-slate-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Alert Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-800 my-2">
            <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Direct Transfer Notice:</span> This transfer is separate from milestone tracking, Client approval, disputes, and staged-payment protections. The funds will be credited to the expert's wallet immediately and <span className="font-bold underline">cannot be refunded through a milestone dispute</span>.
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Recipient:</span>
              <span className="font-bold text-slate-900">{recipientName}</span>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="transfer-amount" className="block text-xs font-bold text-slate-700 mb-1">
                Transfer Amount (Aivora Coin)
              </label>
              <div className="relative">
                <input
                  id="transfer-amount"
                  type="number"
                  className={`w-full rounded-lg p-3 pl-4 pr-12 text-lg font-bold text-slate-900 border ${errors.amount ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-primary/20'} focus:outline-none focus:ring-2`}
                  placeholder="100"
                  {...register('amount')}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">AICOIN</span>
              </div>
              {errors.amount && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.amount.message}</p>
              )}
              <p className="text-[10px] font-medium text-slate-400 mt-1">
                Available balance: {walletBalance.toLocaleString()} Aivora Coin
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="transfer-description" className="block text-xs font-bold text-slate-700 mb-1">
                Message / Description (Optional)
              </label>
              <textarea
                id="transfer-description"
                rows={3}
                className={`w-full rounded-lg p-3 text-sm text-slate-900 border ${errors.description ? 'border-rose-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary/20`}
                placeholder="Example: Extra tip for excellent completed work..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" className="rounded-full font-bold">
                  Cancel
                </Button>
              </Dialog.Close>
              
              <Button
                type="submit"
                disabled={transferMutation.isPending}
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black px-6 shadow-md shadow-blue-500/20"
              >
                {transferMutation.isPending ? 'Transferring...' : 'Confirm Transfer'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
