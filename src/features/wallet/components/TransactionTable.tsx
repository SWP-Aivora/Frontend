import { TransactionType, TransactionStatus } from '../types';
import type { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  isClient: boolean;
}

export const TransactionTable = ({ transactions, isClient }: TransactionTableProps) => {
  const isIncomingTransaction = (transaction: Transaction): boolean =>
    transaction.type === TransactionType.DEPOSIT ||
    transaction.type === TransactionType.REFUND ||
    (!isClient && transaction.type === TransactionType.PAYMENT);

  const getTransactionTypeInfo = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT: return { label: 'Deposit', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case TransactionType.WITHDRAWAL: return { label: 'Withdrawal', icon: ArrowUpRight, color: 'text-rose-600', bg: 'bg-rose-50' };
      case TransactionType.PAYMENT: return { label: 'Payment', icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' };
      case TransactionType.REFUND: return { label: 'Refund', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      default: return { label: 'Unknown', icon: ArrowUpRight, color: 'text-slate-600', bg: 'bg-slate-50' };
    }
  };

  const getStatusInfo = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING: return { label: 'Pending', color: 'bg-amber-50 text-amber-600' };
      case TransactionStatus.COMPLETED: return { label: 'Completed', color: 'bg-emerald-50 text-emerald-600' };
      case TransactionStatus.FAILED: return { label: 'Failed', color: 'bg-rose-50 text-rose-600' };
      default: return { label: 'Unknown', color: 'bg-slate-50 text-slate-600' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50/50 border-bottom border-slate-100">
          <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Transaction</th>
          <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Date</th>
          <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
          <th className="px-8 py-5 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {transactions.map((t) => {
          const typeInfo = getTransactionTypeInfo(t.type);
          const statusInfo = getStatusInfo(TransactionStatus.COMPLETED);
          const isIncoming = isIncomingTransaction(t);
          return (
            <tr key={t.id || Math.random()} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex size-9 items-center justify-center rounded-md shadow-sm",
                    typeInfo.bg,
                    typeInfo.color
                  )}>
                    <typeInfo.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black leading-tight text-slate-900">
                      {t.description || typeInfo.label}
                    </p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">ID: {t.id?.toUpperCase() ?? 'N/A'}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="text-[11px] font-bold text-slate-500">
                  {formatDate(t.createdAt)}
                </span>
              </td>
              <td className="px-8 py-6">
                <div className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-black uppercase",
                  statusInfo.color
                )}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {statusInfo.label}
                </div>
              </td>
              <td className="px-8 py-6 text-right">
                <span className={cn(
                  "text-sm font-black",
                  isIncoming ? "text-emerald-600" : "text-slate-900"
                )}>
                  {isIncoming ? '+' : '-'}{t.amount?.toLocaleString() ?? '0'} Aivora Coin
                </span>
              </td>
            </tr>
          );
        })}
        {transactions.length === 0 && (
          <tr>
            <td colSpan={4} className="px-8 py-10 text-center text-sm font-medium text-slate-400">
              No transactions found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
