import { ShieldCheck } from 'lucide-react';

export const EscrowInfoCard = () => {
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="size-12 shrink-0 rounded-lg bg-white flex items-center justify-center shadow-sm">
        <ShieldCheck className="size-6 text-emerald-600" />
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-black text-emerald-900 mb-1">Secure Escrow</h3>
        <p className="text-sm text-emerald-700/70 font-medium leading-relaxed">
          All payments are held securely in AIVORA's escrow system. Funds are only released when milestones are approved.
        </p>
      </div>
    </div>
  );
};
