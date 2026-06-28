import { Search } from 'lucide-react';

export type ReadStatusFilter = 'all' | 'read' | 'unread';

interface NotificationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ReadStatusFilter;
  onStatusFilterChange: (value: ReadStatusFilter) => void;
  totalCount: number;
  unreadCount: number;
}

const statusOptions: Array<{ value: ReadStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'read', label: 'Read' },
  { value: 'unread', label: 'Unread' },
];

export const NotificationFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  unreadCount,
}: NotificationFiltersProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col xl:flex-row gap-4 xl:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="size-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search title or message"
          className="w-full bg-transparent border-none py-3 pl-11 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-0"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full xl:w-auto">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 whitespace-nowrap">
          <span>Total {totalCount} notifications</span>
          <span className="h-4 w-px bg-slate-200" />
          <span>{unreadCount} unread</span>
        </div>

        <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1 w-fit">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusFilterChange(option.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === option.value
                  ? 'bg-brand-blue-dark text-white shadow-sm'
                  : 'text-slate-600 hover:text-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
