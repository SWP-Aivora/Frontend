import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { walletService } from '../services';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { TransactionTable } from '../components/TransactionTable';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { SpendingChart } from '../components/SpendingChart';
import { EscrowInfoCard } from '../components/EscrowInfoCard';
import { ErrorBoundary } from '@/shared/components/common';

const TRANSACTIONS_PER_PAGE = 10;

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
    record.coins,
    record.coin,
    record.xu,
  ].map(toNumber).find((value): value is number => value !== null);

  if (balance !== undefined) return balance;

  if (record.wallet && typeof record.wallet === 'object') {
    return getWalletBalance(record.wallet);
  }

  return 0;
};

export const WalletPage = () => {
  const { user } = useAuthStore();
  const isClient = user?.role === Role.CLIENT;
  const isExpert = user?.role === Role.EXPERT;
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [transactionPage, setTransactionPage] = useState(1);

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
    isFetching: isFetchingHistory,
    isError: isHistoryError,
  } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletService.getPaymentHistory(),
  });

  const wallet = walletResponse?.data;
  const walletBalance = getWalletBalance(wallet);
  const transactions = useMemo(() => historyResponse?.data || [], [historyResponse?.data]);
  
  // High #2: Runtime type guard for amount to prevent NaN poison
  const validTx = useMemo(() => 
    transactions.filter(t => typeof t.amount === 'number' && !isNaN(t.amount)), 
    [transactions]
  );
  const sortedTx = useMemo(() => {
    return [...validTx].sort((a, b) => {
      const firstDate = new Date(a.createdAt).getTime();
      const secondDate = new Date(b.createdAt).getTime();
      const safeFirstDate = isNaN(firstDate) ? 0 : firstDate;
      const safeSecondDate = isNaN(secondDate) ? 0 : secondDate;

      return sortOrder === 'newest'
        ? safeSecondDate - safeFirstDate
        : safeFirstDate - safeSecondDate;
    });
  }, [sortOrder, validTx]);
  const transactionPageCount = Math.max(1, Math.ceil(sortedTx.length / TRANSACTIONS_PER_PAGE));
  const currentTransactionPage = Math.min(transactionPage, transactionPageCount);
  const paginatedTx = useMemo(() => {
    const startIndex = (currentTransactionPage - 1) * TRANSACTIONS_PER_PAGE;
    return sortedTx.slice(startIndex, startIndex + TRANSACTIONS_PER_PAGE);
  }, [currentTransactionPage, sortedTx]);

  const isLoading = isLoadingWallet;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Wallet...</p>
      </div>
    );
  }

  // High #1: Error state for failed wallet balance query
  if (isWalletError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="size-16 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
           <ArrowDownLeft className="size-8 text-rose-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Failed to load wallet data</h3>
        <p className="text-slate-500 font-medium max-w-sm text-center">There was a problem retrieving your financial data. Please try again.</p>
        <Button onClick={() => { refetchWallet(); }} className="rounded-full mt-4">
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
           {isClient && <DepositModal />}
           {isExpert && <WithdrawModal maxBalance={walletBalance} />}
        </div>
      </div>

      <EscrowInfoCard />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-stretch">
        <div className="xl:col-span-2">
          <WalletBalanceCard 
            balance={walletBalance} 
          />
        </div>

        <div className="xl:col-span-3">
          <SpendingChart transactions={validTx} isClient={isClient} />
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transaction History</h3>
            <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-sm">
               <ArrowUpDown className="size-4 text-slate-400" />
               <label htmlFor="transaction-sort" className="text-xs font-black uppercase tracking-widest text-slate-400">
                 Sort
               </label>
               <select
                 id="transaction-sort"
                 value={sortOrder}
                 onChange={(event) => {
                   setSortOrder(event.target.value as 'newest' | 'oldest');
                   setTransactionPage(1);
                 }}
                 className="bg-transparent text-sm font-bold text-slate-700 outline-none"
               >
                 <option value="newest">Newest first</option>
                 <option value="oldest">Oldest first</option>
               </select>
            </div>
         </div>

         {/* High #3 & Leader #1: ErrorBoundary wrapping the data-heavy section */}
         <div className="bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm">
            {isHistoryError && (
              <div className="border-b border-amber-100 bg-amber-50/60 px-6 py-4 text-sm font-semibold text-amber-700">
                Payment history is temporarily unavailable. Your wallet balance is still shown above.
              </div>
            )}
            <ErrorBoundary fallback={
              <div className="p-12 text-center border-y border-rose-100 bg-rose-50/30 text-rose-600">
                <p className="font-bold mb-2">Failed to load transaction table</p>
                <p className="text-sm opacity-80">Some transaction data might be corrupted. Try refreshing or contact support.</p>
              </div>
            }>
              {isLoadingHistory ? (
                <div className="px-8 py-10 text-center text-slate-400 font-medium">
                  Loading transactions...
                </div>
              ) : (
                <TransactionTable transactions={paginatedTx} isClient={isClient} />
              )}
            </ErrorBoundary>
            {isFetchingHistory && !isLoadingHistory && (
              <div className="px-6 pb-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                Refreshing transactions...
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-slate-50">
               <p className="text-xs font-bold text-slate-400">
                 Showing {paginatedTx.length === 0 ? 0 : (currentTransactionPage - 1) * TRANSACTIONS_PER_PAGE + 1}
                 {' - '}
                 {Math.min(currentTransactionPage * TRANSACTIONS_PER_PAGE, sortedTx.length)}
                 {' of '}
                 {sortedTx.length}
               </p>
               <div className="flex items-center gap-2">
                 <Button
                   variant="outline"
                   size="sm"
                   disabled={currentTransactionPage === 1}
                   onClick={() => setTransactionPage(page => Math.max(1, page - 1))}
                   className="rounded-lg"
                 >
                   Previous
                 </Button>
                 <span className="px-3 text-xs font-black uppercase tracking-widest text-slate-400">
                   Page {currentTransactionPage} of {transactionPageCount}
                 </span>
                 <Button
                   variant="outline"
                   size="sm"
                   disabled={currentTransactionPage === transactionPageCount}
                   onClick={() => setTransactionPage(page => Math.min(transactionPageCount, page + 1))}
                   className="rounded-lg"
                 >
                   Next
                 </Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
