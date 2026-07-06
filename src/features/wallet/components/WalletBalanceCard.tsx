import { Wallet as WalletIcon } from 'lucide-react';

interface WalletBalanceCardProps {
  balance: number;
}

export const WalletBalanceCard = ({ balance }: WalletBalanceCardProps) => {
  return (
    <div className="relative h-full min-h-[360px] rounded-xl bg-brand-blue-dark p-7 lg:p-8 text-white overflow-hidden shadow-2xl">
      <div className="absolute -top-28 -right-20 size-80 rounded-full bg-blue-400/20 blur-[100px]" />
      <div className="absolute -bottom-24 -left-20 size-72 rounded-full bg-primary/20 blur-[80px]" />
      <div className="absolute right-8 bottom-6 opacity-[0.08]">
        <WalletIcon className="size-40 text-white" />
      </div>
      <div className="absolute inset-x-8 top-24 h-px bg-white/10" />

      <div className="relative z-10 flex h-full min-h-[304px] flex-col justify-between gap-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-blue-100/70 text-xs font-black uppercase tracking-widest">Available Balance</p>
        </div>

        <div className="min-w-0">
          <h2 className="max-w-full text-[clamp(2rem,4vw,3.75rem)] font-black leading-[1.02] tracking-tight break-words">
            {balance?.toLocaleString() || '0'} Aivora Coin
          </h2>
          <p className="mt-3 max-w-sm text-sm font-semibold leading-relaxed text-blue-100/75">
            Ready to withdraw after approved milestones.
          </p>
        </div>

        <div className="space-y-4">
          <div className="h-px bg-white/10" />
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/60">Currency</p>
              <p className="mt-0.5 text-xs font-black text-white">Aivora Coin</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/60">Protection</p>
              <p className="mt-0.5 text-xs font-black text-white">Escrow protected</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/60">Release</p>
              <p className="mt-0.5 text-xs font-black text-white">Milestone approved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
