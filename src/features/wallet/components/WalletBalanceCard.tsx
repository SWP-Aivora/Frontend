import { Wallet as WalletIcon } from 'lucide-react';

interface WalletBalanceCardProps {
  balance: number;
}

export const WalletBalanceCard = ({ balance }: WalletBalanceCardProps) => {
  return (
    <div className="relative h-full min-h-[300px] overflow-hidden rounded-lg bg-brand-blue-dark p-6 text-white shadow-2xl lg:p-7">
      <div className="absolute -top-28 -right-20 size-80 rounded-full bg-blue-400/20 blur-[100px]" />
      <div className="absolute -bottom-24 -left-20 size-72 rounded-full bg-primary/20 blur-[80px]" />
      <div className="absolute right-8 bottom-6 opacity-[0.08]">
        <WalletIcon className="size-36 text-white" />
      </div>
      <div className="absolute inset-x-7 top-20 h-px bg-white/10" />

      <div className="relative z-10 flex h-full min-h-[248px] flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-blue-100/70">Available Balance</p>
        </div>

        <div className="min-w-0">
          <h2 className="max-w-full break-words text-[clamp(1.65rem,3.25vw,2.9rem)] font-black leading-[1.02] tracking-tight">
            {balance?.toLocaleString() || '0'} Aivora Coin
          </h2>
          <p className="mt-2.5 max-w-sm text-[11px] font-semibold leading-relaxed text-blue-100/75">
            Ready to withdraw after approved milestones.
          </p>
        </div>

        <div className="space-y-3">
          <div className="h-px bg-white/10" />
          <div className="flex flex-wrap gap-2.5">
            <div className="rounded-md border border-white/10 bg-white/10 px-2.5 py-2 backdrop-blur-md">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-100/60">Currency</p>
              <p className="mt-0.5 text-[11px] font-black text-white">Aivora Coin</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/10 px-2.5 py-2 backdrop-blur-md">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-100/60">Payment Flow</p>
              <p className="mt-0.5 text-[11px] font-black text-white">30/70 staged</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/10 px-2.5 py-2 backdrop-blur-md">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-100/60">Release</p>
              <p className="mt-0.5 text-[11px] font-black text-white">Approval pays 70%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
