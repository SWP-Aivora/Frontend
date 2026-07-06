import type { FormEvent } from 'react';
import { Search } from 'lucide-react';
import { adminJobPostStatusOptions } from './adminJobPostStatus';

interface AdminJobPostFiltersProps {
  searchInput: string;
  statusFilter: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  onStatusChange: (value: string) => void;
}

export const AdminJobPostFilters = ({
  searchInput,
  statusFilter,
  onSearchInputChange,
  onSearchSubmit,
  onStatusChange,
}: AdminJobPostFiltersProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit();
  };

  return (
    <div className="flex flex-col xl:flex-row items-stretch gap-3">
      <form onSubmit={handleSubmit} className="flex w-full min-w-0 gap-2 xl:flex-1">
        <div className="relative flex min-w-0 flex-1 items-center bg-slate-50 border border-slate-100 rounded-lg px-4 py-2">
          <Search className="size-4 text-slate-400 absolute left-4" />
          <input
            type="text"
            placeholder="Search job title, client, domain, or skill..."
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs ml-6 w-full text-slate-700 placeholder:text-slate-400 font-medium"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-primary-dark active:scale-95"
        >
          Search
        </button>
      </form>

      <select
        aria-label="Job post status"
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        className="w-full cursor-pointer rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:min-w-[168px] xl:w-auto"
      >
        <option value="All">All Statuses</option>
        {adminJobPostStatusOptions.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
};

