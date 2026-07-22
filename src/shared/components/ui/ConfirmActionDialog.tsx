import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel: string;
  pendingLabel?: string;
  isPending?: boolean;
  destructive?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ConfirmActionDialog = ({
  open,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel,
  pendingLabel,
  isPending = false,
  destructive = true,
  onOpenChange,
  onConfirm,
}: ConfirmActionDialogProps) => (
  <Dialog.Root open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Dialog.Title className="text-2xl font-black text-slate-900">{title}</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm font-medium leading-6 text-slate-500">
              {description}
            </Dialog.Description>
          </div>
          <Dialog.Close asChild disabled={isPending}>
            <button
              type="button"
              aria-label="Close dialog"
              className="shrink-0 rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
          </Dialog.Close>
        </div>

        <div className="flex justify-end gap-3">
          <Dialog.Close asChild disabled={isPending}>
            <Button type="button" variant="outline" disabled={isPending} className="rounded-full font-bold">
              {cancelLabel}
            </Button>
          </Dialog.Close>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={
              destructive
                ? 'rounded-full border-none bg-rose-600 font-black text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700'
                : 'rounded-full font-black shadow-lg shadow-primary/20'
            }
          >
            {isPending ? pendingLabel ?? 'Working...' : confirmLabel}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
