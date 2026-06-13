import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { walletService } from '../services';
import { TransactionType, TransactionStatus } from '../types';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { TransactionTable } from '../components/TransactionTable';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { SpendingChart } from '../components/SpendingChart';
import { LinkedMethodsCard } from '../components/LinkedMethodsCard';
import { EscrowInfoCard } from '../components/EscrowInfoCard';
import { ErrorBoundary } from '@/shared/components/common';

export const WalletPage = () => {
  const { user } = useAuthStore();
  const isClient = user?.role === Role.CLIENT;

  const { 
    data: walletResponse, 
    isLoading: isLoadingWallet, 
    isError: isWalletError, 
    refetch: refetchWallet 
  } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
  });

  const { 
    data: historyResponse, 
    isLoading: isLoadingHistory, 
    isError: isHistoryError, 
    refetch: refetchHistory 
  } = useQuery({
    queryKey: ['payments-history'],
    queryFn: () => walletService.getPaymentHistory(),
  });

  const wallet = walletResponse?.data;
  const transactions = useMemo(() => historyResponse?.data || [], [historyResponse?.data]);
  
  // High #2: Runtime type guard for amount to prevent NaN poison
  const validTx = useMemo(() => 
    transactions.filter(t => typeof t.amount === 'number' && !isNaN(t.amount)), 
    [transactions]
  );

  const isLoading = isLoadingWallet || isLoadingHistory;

  const totals = useMemo(() => {
    const spent = validTx
      .filter(t => t.type === TransactionType.PAYMENT && t.status === TransactionStatus.COMPLETED)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const earned = validTx
      .filter(t => (t.type === TransactionType.DEPOSIT || t.type === TransactionType.REFUND) && t.status === TransactionStatus.COMPLETED)
      .reduce((acc, t) => acc + t.amount, 0);

    const inEscrow = validTx
      .filter(t => t.status === TransactionStatus.PENDING)
      .reduce((acc, t) => acc + t.amount, 0);

    return { spent, earned, inEscrow };
  }, [validTx]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Wallet...</p>
      </div>
    );
  }

  // High #1: Error state for failed queries
  if (isWalletError || isHistoryError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="size-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
           <ArrowDownLeft className="size-8 text-rose-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Failed to load wallet data</h3>
        <p className="text-slate-500 font-medium max-w-sm text-center">There was a problem retrieving your financial data. Please try again.</p>
        <Button onClick={() => { refetchWallet(); refetchHistory(); }} className="rounded-full mt-4">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">
             {isClient ? 'Billing & Wallet' : 'Earnings & Payouts'}
           </h1>
           <p className="text-slate-500 font-medium mt-1">Manage your funds and view transaction history.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-full border-slate-200">Export PDF</Button>
           {isClient ? (
             <Button onClick={handleDeposit} disabled={isDepositing} className="rounded-full px-6 shadow-lg shadow-primary/20 flex items-center gap-2">
                {isDepositing ? <RefreshCw className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Deposit Demo Funds
             </Button>
           ) : (
             <WithdrawModal maxBalance={wallet?.balance || 0} />
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <WalletBalanceCard 
             balance={wallet?.balance || 0} 
             inEscrow={totals.inEscrow}
             totalStats={isClient ? totals.spent : totals.earned}
             isClient={isClient}
           />
           <SpendingChart />
        </div>

        <div className="space-y-6">
           <EscrowInfoCard />
           <LinkedMethodsCard />
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transaction History</h3>
            <div className="flex items-center gap-3">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input type="text" placeholder="Search transactions..." className="h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-100 text-sm focus:ring-2 focus:ring-primary/20 transition-all" />
               </div>
               <Button variant="outline" size="icon" className="size-10 rounded-xl border-slate-200"><Filter className="size-4" /></Button>
            </div>
         </div>

         {/* High #3 & Leader #1: ErrorBoundary wrapping the data-heavy section */}
         <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <ErrorBoundary fallback={
              <div className="p-12 text-center border-y border-rose-100 bg-rose-50/30 text-rose-600">
                <p className="font-bold mb-2">Failed to load transaction table</p>
                <p className="text-sm opacity-80">Some transaction data might be corrupted. Try refreshing or contact support.</p>
              </div>
            }>
              <TransactionTable transactions={validTx} />
            </ErrorBoundary>
            
            <div className="p-6 border-t border-slate-50 text-center">
               <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest transition-colors">Load full history</button>
            </div>
         </div>
      </div>
    </div>
  );
};
