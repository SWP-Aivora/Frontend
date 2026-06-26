import { TransactionType, TransactionStatus } from '../types';
import type { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  /**
   * Maps transaction type string from backend to display info.
   * CREDIT / DEPOSIT → green (incoming), DEBIT / PAYMENT / WITHDRAWAL → outgoing,
   * PAYMENT_RELEASE / REFUND → green (incoming release).
   */
  const getTransactionTypeInfo = (type: TransactionType) => {
    switch (type) {
      case TransactionType.CREDIT:
      case TransactionType.DEPOSIT:
        return { label: 'Deposit', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case TransactionType.DEBIT:
      case TransactionType.WITHDRAWAL:
        return { label: 'Withdrawal', icon: ArrowUpRight, color: 'text-rose-600', bg: 'bg-rose-50' };
      case TransactionType.PAYMENT:
        return { label: 'Payment', icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' };
      case TransactionType.PAYMENT_RELEASE:
      case TransactionType.REFUND:
        return { label: 'Release', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      default: return { label: String(type), icon: ArrowUpRight, color: 'text-slate-600', bg: 'bg-slate-50' };
    }
  };

  const getStatusInfo = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING: return { label: 'Pending', color: 'bg-amber-50 text-amber-600' };
      case TransactionStatus.COMPLETED: return { label: 'Completed', color: 'bg-emerald-50 text-emerald-600' };
      case TransactionStatus.FAILED: return { label: 'Failed', color: 'bg-rose-50 text-rose-600' };
      default: return { label: String(status), color: 'bg-slate-50 text-slate-600' };
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
          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Transaction</th>
          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {transactions.map((t) => {
          const typeInfo = getTransactionTypeInfo(t.type);
          const statusInfo = getStatusInfo(t.status);
          return (
            <tr key={t.id || Math.random()} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center shadow-sm",
                    typeInfo.bg,
                    typeInfo.color
                  )}>
                    <typeInfo.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-tight">
                      {t.description || typeInfo.label}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">ID: {t.id?.toUpperCase() ?? 'N/A'}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="text-xs font-bold text-slate-500">
                  {formatDate(t.createdAt)}
                </span>
              </td>
              <td className="px-8 py-6">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase",
                  statusInfo.color
                )}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {statusInfo.label}
                </div>
              </td>
              <td className="px-8 py-6 text-right">
                <span className={cn(
                  "text-base font-black",
                  (t.type === TransactionType.DEPOSIT || t.type === TransactionType.REFUND) ? "text-emerald-600" : "text-slate-900"
                )}>
                  {(t.type === TransactionType.CREDIT || t.type === TransactionType.DEPOSIT || t.type === TransactionType.PAYMENT_RELEASE || t.type === TransactionType.REFUND) ? '+' : '-'}{t.amount?.toLocaleString() ?? '0'} Xu
                </span>
              </td>
            </tr>
          );
        })}
        {transactions.length === 0 && (
          <tr>
            <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-medium">
              No transactions found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
