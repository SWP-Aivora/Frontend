import { Link } from 'react-router-dom';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricBadge } from '@/shared/components/admin';
import type { DashboardSummary } from '../types';

interface SummaryCardsRowProps {
  summary?: DashboardSummary;
}

export const SummaryCardsRow = ({ summary }: SummaryCardsRowProps) => (
  <div className="w-full overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
    <div className="flex flex-nowrap gap-6 min-w-max">
      <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">User Management</h3>
            <MetricBadge count={summary?.newUsers7d || 0} type="positive" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-primary tracking-tighter">
              {summary?.totalUsers?.toLocaleString() || '0'}
            </div>
            <Link to="/admin/users" className="text-xs font-bold text-primary hover:underline mt-0.5 inline-block">
              View details &gt;
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar space-y-3.5">
          {summary?.userOverview?.map((item) => (
            <div key={item.role} className="space-y-1.5 min-w-[200px]">
              <div className="flex justify-between items-end">
                <span className="text-slate-600 font-bold text-xs">{item.role}</span>
                <span className="text-slate-900 font-black text-sm">{item.count.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${item.fillPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Expert Profile Review</h3>
            <MetricBadge count={summary?.newExpertReviews7d || 0} type="attention" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-orange-500 tracking-tighter">
              {summary?.pendingReviews || 0}
            </div>
            <Link
              to="/admin/expert-reviews"
              className="text-xs font-bold text-primary hover:underline mt-0.5 inline-block"
            >
              View details &gt;
            </Link>
          </div>
        </div>
        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 mb-5 shrink-0">
          <div
            className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all duration-1000"
            style={{ width: summary?.pendingReviews ? '65%' : '0%' }}
          />
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar space-y-3">
          {summary?.reviewQueue && summary.reviewQueue.length > 0 ? (
            summary.reviewQueue.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between group/item cursor-pointer min-w-[200px]">
                <span className="text-slate-600 font-bold text-xs group-hover/item:text-primary transition-colors">
                  {item.label}
                </span>
                <div
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-black',
                    item.count > 10 ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600',
                  )}
                >
                  {item.count}
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold italic">
              No pending expert reviews
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Financials</h3>
            <MetricBadge count={summary?.newTransactions7d || 0} type="positive" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-600 tracking-tighter">
              ${(summary?.totalTransactionsValue || 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar divide-y divide-slate-50">
          {summary?.transactionSummary && summary.transactionSummary.length > 0 ? (
            summary.transactionSummary.map((item) => (
              <div key={item.type} className="flex items-center justify-between py-2.5 group/item min-w-[200px]">
                <span className="text-slate-500 font-bold text-xs uppercase tracking-wider group-hover/item:text-primary transition-colors">
                  {item.type}
                </span>
                <span className="text-slate-900 font-black text-sm tracking-tight">${item.amount.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <p className="text-slate-400 text-xs font-bold italic">
                {(summary?.totalTransactionsValue || 0) > 0
                  ? 'Platform volume exists, but breakdown is unavailable.'
                  : 'No financial data yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Job Market</h3>
            <MetricBadge count={summary?.newJobs7d || 0} type="positive" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-600 tracking-tighter">{summary?.openJobs || '0'}</div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar space-y-2.5">
          {summary?.topCategories && summary.topCategories.length > 0 ? (
            <>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1 shrink-0">Top Domains</p>
              {summary.topCategories.map((domain) => (
                <div key={domain.name} className="flex items-center justify-between group/item min-w-[200px]">
                  <span className="text-slate-600 font-bold text-xs group-hover/item:text-primary transition-colors">
                    {domain.name}
                  </span>
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black">
                    {domain.jobCount} jobs
                  </span>
                </div>
              ))}
            </>
          ) : summary?._rawJobs && summary._rawJobs.length > 0 ? (
            <>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1 shrink-0">Recent Listings</p>
              {summary._rawJobs.map((job, idx) => (
                <div key={idx} className="flex items-center justify-between group/item min-w-[200px]">
                  <span className="text-slate-600 font-bold text-xs group-hover/item:text-primary transition-colors line-clamp-1 flex-1 mr-2">
                    {job.title}
                  </span>
                  <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                    {job.status}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <p className="text-slate-400 text-xs font-bold italic leading-relaxed">No active listings yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
        <div className="flex justify-between items-start mb-3 shrink-0">
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Disputes</h3>
            <MetricBadge count={summary?.newDisputes7d || 0} type="negative" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-rose-500 tracking-tighter">{summary?.openDisputes || '0'}</div>
            <Link to="/admin/disputes" className="text-xs font-bold text-rose-600 hover:underline mt-0.5 inline-block">
              View details &gt;
            </Link>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 overflow-x-auto">
          {(summary?.openDisputes || 0) > 0 ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100/50 min-w-[200px]">
                <ShieldAlert className="size-5 text-rose-400 shrink-0" />
                <p className="text-sm font-medium text-rose-700 leading-tight">
                  Active dispute resolution is required to maintain platform trust.
                </p>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                  <span>Priority</span>
                  <span>High</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-full" />
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-bold italic text-center gap-2">
              <CheckCircle className="size-8 text-emerald-400 opacity-50" />
              No active disputes requiring action.
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Health Alerts</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Platform stability</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-rose-600 tracking-tighter">
              {summary?.healthAlerts?.length || 0}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar divide-y divide-slate-50">
          {summary?.healthAlerts && summary.healthAlerts.length > 0 ? (
            summary.healthAlerts.map((alert, idx) => (
              <div key={idx} className="flex gap-4 py-3 group/item min-w-[200px]">
                <div
                  className={cn(
                    'size-2 rounded-full mt-1.5 shrink-0',
                    alert.severity === 'critical' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-orange-500',
                  )}
                />
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight mb-1 group-hover/item:text-primary transition-colors">
                    {alert.title}
                  </p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-1">{alert.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold italic">
              No health alerts
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
