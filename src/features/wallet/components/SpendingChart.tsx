import { useMemo } from 'react';
import { WalletTransactionType } from '../types';
import type { Transaction } from '../types';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface SpendingChartProps {
  transactions: Transaction[];
  isClient: boolean;
}

const getTransactionDescription = (transaction: Transaction): string =>
  (transaction.description ?? '').toLowerCase();

const isClientReleasedPayment = (transaction: Transaction): boolean =>
  transaction.type === WalletTransactionType.PAYMENT &&
  getTransactionDescription(transaction).includes('released');

const getSignedAmount = (transaction: Transaction, isClient: boolean): number => {
  if (transaction.type === WalletTransactionType.DEPOSIT || transaction.type === WalletTransactionType.REFUND) {
    return transaction.amount;
  }

  if (transaction.type === WalletTransactionType.WITHDRAWAL) {
    return -transaction.amount;
  }

  if (transaction.type === WalletTransactionType.PAYMENT) {
    return isClient ? -transaction.amount : transaction.amount;
  }

  return 0;
};

export const SpendingChart = ({ transactions, isClient }: SpendingChartProps) => {
  const chartData = useMemo(() => {
    const totals = Array.from({ length: 7 }, () => 0);

    transactions
      .filter(t => !isClient || !getTransactionDescription(t).includes('funding') || isClientReleasedPayment(t))
      .forEach(t => {
        const date = new Date(t.createdAt);
        if (!isNaN(date.getTime())) {
          totals[date.getDay()] += getSignedAmount(t, isClient);
        }
      });

    const max = Math.max(...totals.map(total => Math.abs(total)), 0);
    return totals.map(total => ({
      total,
      hasActivity: total !== 0,
      height: max > 0 ? Math.max((Math.abs(total) / max) * 50, 4) : 0,
      isIncoming: total > 0,
    }));
  }, [isClient, transactions]);

  return (
    <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black text-slate-900">{isClient ? 'Weekly Spending Flow' : 'Weekly Earning Flow'}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-400 uppercase">In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-500" />
            <span className="text-xs font-bold text-slate-400 uppercase">Out</span>
          </div>
        </div>
      </div>
      <div className="relative h-48 grid grid-cols-7 gap-3 px-2">
        <div className="absolute left-2 right-2 top-1/2 h-px bg-slate-200" />
        {chartData.map((entry, i) => (
          <div
            key={WEEK_DAYS[i]}
            title={`${WEEK_DAYS[i]}: ${entry.total.toLocaleString()} Aivora Coin`}
            className="relative h-full group cursor-help"
          >
            <div className="absolute inset-x-0 top-0 bottom-0 rounded-lg bg-slate-50" />
            {entry.hasActivity ? (
              <div 
                style={{ height: `${entry.height}%` }} 
                className={`absolute left-0 right-0 ${
                  entry.isIncoming
                    ? 'bottom-1/2 rounded-t-lg bg-emerald-500/30 group-hover:bg-emerald-500'
                    : 'top-1/2 rounded-b-lg bg-rose-500/30 group-hover:bg-rose-500'
                } transition-colors`}
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 px-2">
        {WEEK_DAYS.map(day => (
          <span key={day} className="text-xs font-bold text-slate-400 uppercase">{day}</span>
        ))}
      </div>
    </div>
  );
};
