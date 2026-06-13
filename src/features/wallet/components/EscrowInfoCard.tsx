import { ShieldCheck } from 'lucide-react';

export const EscrowInfoCard = () => {
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8">
      <div className="size-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-sm">
        <ShieldCheck className="size-6 text-emerald-600" />
      </div>
      <h3 className="text-lg font-black text-emerald-900 mb-2">Secure Escrow</h3>
      <p className="text-sm text-emerald-700/70 font-medium leading-relaxed">
        All payments are held securely in AIVORA's escrow system. Funds are only released when milestones are approved.
      </p>
    </div>
  );
};
