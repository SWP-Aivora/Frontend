import { MoreVertical } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

export const LinkedMethodsCard = () => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Linked Methods</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs">VISA</div>
            <div>
              <p className="text-xs font-bold text-slate-900">•••• 4242</p>
              <p className="text-xs text-slate-400 font-medium">Expires 12/28</p>
            </div>
          </div>
          <MoreVertical className="size-4 text-slate-400" />
        </div>
        <Button variant="ghost" className="w-full rounded-xl border border-dashed border-slate-200 text-slate-500 hover:bg-slate-50">
          + Add New Method
        </Button>
      </div>
    </div>
  );
};
