import { Wallet as WalletIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletBalanceCardProps {
  balance: number;
  inEscrow: number;
  totalStats: number;
  isClient: boolean;
}

export const WalletBalanceCard = ({ balance, inEscrow, totalStats, isClient }: WalletBalanceCardProps) => {
  return (
    <div className={cn(
      "relative h-64 rounded-xl p-10 text-white overflow-hidden shadow-2xl",
      isClient ? "bg-brand-blue-dark" : "bg-indigo-900"
    )}>
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 size-80 bg-brand-accent/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 size-64 bg-primary/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100/70 text-xs font-black uppercase tracking-widest mb-1">Available Balance (Coins)</p>
            <h2 className="text-5xl font-black tracking-tighter">
              {balance?.toLocaleString() || '0'} Xu
            </h2>
          </div>
          <div className="size-14 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
            <WalletIcon className="size-8 text-blue-200" />
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div>
            <p className="text-blue-100/50 text-xs font-bold uppercase tracking-widest mb-1">In Review / Escrow</p>
            <p className="text-xl font-black">{inEscrow.toLocaleString()} Xu</p>
          </div>
          <div>
            <p className="text-blue-100/50 text-xs font-bold uppercase tracking-widest mb-1">
              Total {isClient ? 'Spent' : 'Earned'}
            </p>
            <p className="text-xl font-black">
              {totalStats.toLocaleString()} Xu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
