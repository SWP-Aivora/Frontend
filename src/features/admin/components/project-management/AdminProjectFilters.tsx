import type { FormEvent } from 'react';
import { Search } from 'lucide-react';
import { adminProjectStatusOptions } from './adminProjectStatus';

interface AdminProjectFiltersProps {
  searchInput: string;
  statusFilter: string;
  disputeFilter: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  onStatusChange: (value: string) => void;
  onDisputeChange: (value: string) => void;
}

export const AdminProjectFilters = ({
  searchInput,
  statusFilter,
  disputeFilter,
  onSearchInputChange,
  onSearchSubmit,
  onStatusChange,
  onDisputeChange,
}: AdminProjectFiltersProps) => {
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
            placeholder="Search project name..."
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

      <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:shrink-0">
        <select
          aria-label="Project status"
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
          className="w-full cursor-pointer rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:min-w-[168px] xl:w-auto"
        >
          <option value="All">All Statuses</option>
          {adminProjectStatusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Dispute filter"
          value={disputeFilter}
          onChange={(event) => onDisputeChange(event.target.value)}
          className="w-full cursor-pointer rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:min-w-[160px] xl:w-auto"
        >
          <option value="All">All Disputes</option>
          <option value="Open">Dispute Open</option>
          <option value="None">No Dispute</option>
        </select>
      </div>
    </div>
  );
};
