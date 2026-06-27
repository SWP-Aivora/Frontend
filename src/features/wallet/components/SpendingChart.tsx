import { useMemo } from 'react';
import type { Transaction, TransactionStatus, TransactionType } from '../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DEPOSIT: TransactionType = 0;
const PAYMENT: TransactionType = 2;
const REFUND: TransactionType = 3;
const COMPLETED: TransactionStatus = 1;

interface SpendingChartProps {
  transactions: Transaction[];
  isClient: boolean;
}

export const SpendingChart = ({ transactions, isClient }: SpendingChartProps) => {
  const chartData = useMemo(() => {
    const totals = Array.from({ length: 12 }, () => 0);

    transactions
      .filter(t => t.status === COMPLETED)
      .filter(t => isClient ? t.type === PAYMENT : (t.type === DEPOSIT || t.type === REFUND))
      .forEach(t => {
        const date = new Date(t.createdAt);
        if (!isNaN(date.getTime())) {
          totals[date.getMonth()] += t.amount;
        }
      });

    const max = Math.max(...totals, 0);
    return totals.map(total => ({
      total,
      height: max > 0 ? Math.max((total / max) * 100, 6) : 0,
    }));
  }, [isClient, transactions]);

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black text-slate-900">{isClient ? 'Spending Trends' : 'Earning Trends'}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-xs font-bold text-slate-400 uppercase">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase">No activity</span>
          </div>
        </div>
      </div>
      <div className="h-48 flex items-end justify-between gap-2 px-2">
        {chartData.map((entry, i) => (
          <div key={MONTHS[i]} title={`${MONTHS[i]}: ${entry.total.toLocaleString()} Xu`} className="flex-1 space-y-2 group cursor-help">
            <div className="relative w-full">
              <div className="h-32 w-full bg-slate-50 rounded-t-lg" />
              <div 
                style={{ height: `${entry.height}%` }} 
                className="absolute bottom-0 w-full bg-primary/20 group-hover:bg-primary transition-all rounded-t-lg" 
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 px-2">
        {MONTHS.map(m => (
          <span key={m} className="text-xs font-bold text-slate-400 uppercase">{m}</span>
        ))}
      </div>
    </div>
  );
};
