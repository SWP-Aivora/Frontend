import { Search } from 'lucide-react';
import { adminProjectStatusOptions } from './adminProjectStatus';

interface AdminProjectFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export const AdminProjectFilters = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: AdminProjectFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-3">
      <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 w-full lg:flex-1">
        <Search className="size-4 text-slate-400 absolute left-4" />
        <input
          type="text"
          placeholder="Search project title..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs ml-6 w-full text-slate-700 placeholder:text-slate-400 font-medium"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer w-full lg:w-auto"
      >
        <option value="All">All Statuses</option>
        {adminProjectStatusOptions.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
};
