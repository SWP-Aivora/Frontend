const CHART_DATA = [40, 70, 45, 90, 65, 80, 50, 95, 60, 85, 40, 75];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const SpendingChart = () => {
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black text-slate-900">Spending Trends</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-xs font-bold text-slate-400 uppercase">This Month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase">Last Month</span>
          </div>
        </div>
      </div>
      <div className="h-48 flex items-end justify-between gap-2 px-2">
        {CHART_DATA.map((h, i) => (
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
        {MONTHS.map(m => (
          <span key={m} className="text-xs font-bold text-slate-400 uppercase">{m}</span>
        ))}
      </div>
    </div>
  );
};
