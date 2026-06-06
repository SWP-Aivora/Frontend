import { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  Filter,
  ShieldCheck,
  RefreshCw,
  MoreVertical
} from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock Transaction Data
const mockTransactions = [
  { id: 't1', type: 'deposit', amount: 5000, status: 'completed', description: 'Bank Transfer Deposit', date: '2026-06-01' },
  { id: 't2', type: 'payment', amount: 1500, status: 'completed', description: 'Milestone: Data Preprocessing', date: '2026-06-03' },
  { id: 't3', type: 'payment', amount: 1000, status: 'pending', description: 'Milestone: Model Architecture', date: '2026-06-05' },
  { id: 't4', type: 'refund', amount: 200, status: 'completed', description: 'Job Cancellation Refund', date: '2026-05-28' },
];

export const WalletPage = () => {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(3500);
  const [isLoading, setIsLoading] = useState(false);
  const isClient = user?.role === Role.CLIENT;

  const handleDeposit = async () => {
    setIsLoading(true);
    toast.info('Simulating bank gateway connection...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBalance(prev => prev + 1000);
    toast.success('Successfully deposited $1,000.00!');
    setIsLoading(false);
  };

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
             <Button onClick={handleDeposit} disabled={isLoading} className="rounded-full px-6 shadow-lg shadow-primary/20 flex items-center gap-2">
                {isLoading ? <RefreshCw className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Deposit Funds
             </Button>
           ) : (
             <Button className="rounded-full px-6 bg-brand-accent hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20">
                Withdraw Earnings
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Wallet Card */}
        <div className="lg:col-span-2 space-y-8">
           <div className={cn(
             "relative h-64 rounded-[40px] p-10 text-white overflow-hidden shadow-2xl",
             isClient ? "bg-brand-blue-dark" : "bg-indigo-900"
           )}>
              {/* Background Shapes */}
              <div className="absolute top-0 right-0 size-80 bg-brand-accent/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 size-64 bg-primary/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-blue-100/70 text-xs font-black uppercase tracking-widest mb-1">Available Balance</p>
                       <h2 className="text-5xl font-black tracking-tighter">${balance.toLocaleString()}.00</h2>
                    </div>
                    <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                       <WalletIcon className="size-8 text-blue-200" />
                    </div>
                 </div>

                 <div className="flex items-center gap-10">
                    <div>
                       <p className="text-blue-100/50 text-[10px] font-bold uppercase tracking-widest mb-1">In Review / Escrow</p>
                       <p className="text-xl font-black">$1,250.00</p>
                    </div>
                    <div>
                       <p className="text-blue-100/50 text-[10px] font-bold uppercase tracking-widest mb-1">Total {isClient ? 'Spent' : 'Earned'}</p>
                       <p className="text-xl font-black">${isClient ? '12,400' : '8,900'}.00</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Chart / Analytics Placeholder */}
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-black text-slate-900">Spending Trends</h3>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <span className="size-2 rounded-full bg-primary" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase">This Month</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="size-2 rounded-full bg-slate-200" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Last Month</span>
                    </div>
                 </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                 {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85, 40, 75].map((h, i) => (
                    <div key={i} className="flex-1 space-y-2 group cursor-help">
                       <div className="relative w-full">
                          <div className="h-32 w-full bg-slate-50 rounded-t-lg" />
                          <div 
                            style={{ height: `${h}%` }} 
                            className="absolute bottom-0 w-full bg-primary/20 group-hover:bg-primary transition-all rounded-t-lg" 
                          />
                       </div>
                    </div>
                 ))}
              </div>
              <div className="flex justify-between mt-4 px-2">
                 {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                   <span key={m} className="text-[9px] font-bold text-slate-400 uppercase">{m}</span>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           {/* Security Box */}
           <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8">
              <div className="size-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm">
                 <ShieldCheck className="size-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-black text-emerald-900 mb-2">Secure Escrow</h3>
              <p className="text-sm text-emerald-700/70 font-medium leading-relaxed">
                 All payments are held securely in AIVORA's escrow system. Funds are only released when milestones are approved.
              </p>
           </div>

           {/* Cards Placeholder */}
           <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Linked Methods</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs">VISA</div>
                       <div>
                          <p className="text-xs font-bold text-slate-900">•••• 4242</p>
                          <p className="text-[10px] text-slate-400 font-medium">Expires 12/28</p>
                       </div>
                    </div>
                    <MoreVertical className="size-4 text-slate-400" />
                 </div>
                 <Button variant="ghost" className="w-full rounded-xl border border-dashed border-slate-200 text-slate-500 hover:bg-slate-50">
                    + Add New Method
                 </Button>
              </div>
           </div>
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

         <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50 border-bottom border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {mockTransactions.map((t) => (
                    <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                               "size-10 rounded-xl flex items-center justify-center shadow-sm",
                               t.type === 'deposit' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                             )}>
                                {t.type === 'deposit' ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 leading-tight">{t.description}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">ID: {t.id.toUpperCase()}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className="text-xs font-bold text-slate-500">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                       </td>
                       <td className="px-8 py-6">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase",
                            t.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          )}>
                             <span className="size-1.5 rounded-full bg-current" />
                             {t.status}
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <span className={cn(
                            "text-base font-black",
                            t.type === 'deposit' ? "text-emerald-600" : "text-slate-900"
                          )}>
                             {t.type === 'deposit' ? '+' : '-'}${t.amount.toLocaleString()}.00
                          </span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            
            <div className="p-6 border-t border-slate-50 text-center">
               <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Load full history</button>
            </div>
         </div>
      </div>
    </div>
  );
};
