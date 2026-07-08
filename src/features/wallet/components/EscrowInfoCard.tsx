import { ShieldCheck } from 'lucide-react';

export const EscrowInfoCard = () => {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-emerald-100 bg-emerald-50 px-6 py-5 sm:flex-row sm:items-center">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-white shadow-sm">
        <ShieldCheck className="size-5 text-emerald-600" />
      </div>
      <div className="min-w-0">
        <h3 className="mb-1 text-base font-black text-emerald-900">Secure Escrow</h3>
        <p className="text-xs font-medium leading-relaxed text-emerald-700/70">
          All payments are held securely in AIVORA's escrow system. Funds are only released when milestones are approved.
        </p>
      </div>
    </div>
  );
};
