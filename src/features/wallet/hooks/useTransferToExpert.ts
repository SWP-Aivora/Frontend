import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services';
import { toast } from 'sonner';
import type { TransferFormValues } from '../schema';

interface UseTransferToExpertOptions {
  recipientId: string;
  onSuccess?: () => void;
}

export const useTransferToExpert = ({ recipientId, onSuccess }: UseTransferToExpertOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferFormValues) =>
      walletService.transferToExpert(recipientId, {
        amount: data.amount,
        description: data.description || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wallet'] });
      void queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast.success('Direct transfer completed successfully!');
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = (() => {
        if (typeof error !== 'object' || error === null) return 'Direct transfer failed.';
        const err = error as { response?: { data?: unknown; status?: number } };
        const data = err.response?.data;
        if (typeof data === 'string' && data.trim()) return data;
        if (data && typeof data === 'object') {
          const record = data as Record<string, unknown>;
          const msg = [record.message, record.detail, record.title]
            .find((v): v is string => typeof v === 'string' && v.trim() !== '');
          if (msg) return msg;
        }
        return error instanceof Error ? error.message : 'Direct transfer failed.';
      })();
      toast.error(message);
    },
  });
};
