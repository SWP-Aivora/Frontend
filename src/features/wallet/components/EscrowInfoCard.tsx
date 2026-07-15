import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const StagedPaymentInfoCard = () => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 rounded-lg p-8">
      <div className="size-12 rounded-lg bg-white flex items-center justify-center mb-6 shadow-sm">
        <ShieldCheck className="size-6 text-emerald-600" />
      </div>
      <h3 className="text-lg font-black text-emerald-900 mb-2">Staged Milestone Payments</h3>
      <p className="text-sm text-emerald-700/70 font-medium leading-relaxed mb-4">
        Payments are split into two secure installments for better project management.
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-emerald-700">30%</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-900">Upfront Payment</p>
            <p className="text-xs text-emerald-600">Released immediately when work begins</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-blue-700">70%</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">Completion Payment</p>
            <p className="text-xs text-blue-600">Released after deliverable approval</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50/60 rounded-lg p-2">
        <AlertTriangle className="size-4" />
        <span>Note: Funding a milestone will immediately transfer 30% to the expert</span>
      </div>
    </div>
  );
};
