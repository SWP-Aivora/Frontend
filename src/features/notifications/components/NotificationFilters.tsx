import { Search, Plus } from 'lucide-react';

interface NotificationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const NotificationFilters = ({ searchTerm, onSearchChange }: NotificationFiltersProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[22px] shadow-sm p-4 flex flex-col xl:flex-row gap-4 items-center">
      {/* Search */}
      <div className="relative flex-1 w-full bg-slate-50 border border-slate-200 rounded-[18px] overflow-hidden">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="size-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search title, project, proposal, payment, dispute, or user"
          className="w-full bg-transparent border-none py-3 pl-11 pr-4 text-[11px] font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-0"
        />
      </div>

      {/* Filters (UI only for now, waiting for backend support) */}
      <div className="flex flex-wrap gap-3">
        <FilterDropdown label="Notification type" value="All types" />
        <FilterDropdown label="Read status" value="All status" />
        <FilterDropdown label="Priority" value="High first" />
        <FilterDropdown label="Date range" value="Last 30 days" />
        
        <button className="flex items-center justify-center size-10 rounded-full border border-slate-200 text-primary hover:bg-slate-50">
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  );
};

const FilterDropdown = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white border border-slate-200 rounded-[14px] px-4 py-2 min-w-[120px] cursor-not-allowed opacity-70" title="Filter pending backend support">
    <p className="text-[9px] font-medium text-slate-500 mb-1">{label}</p>
    <p className="text-[11px] font-semibold text-slate-900">{value}</p>
  </div>
);
