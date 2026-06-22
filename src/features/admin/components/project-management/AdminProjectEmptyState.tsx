import { FolderKanban } from 'lucide-react';

interface AdminProjectEmptyStateProps {
  hasFilters: boolean;
}

export const AdminProjectEmptyState = ({ hasFilters }: AdminProjectEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-slate-500 py-20">
      <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <FolderKanban className="size-8 opacity-30" />
      </div>
      <p className="text-sm font-bold text-slate-500">
        {hasFilters ? 'No projects match your filters' : 'No projects found'}
      </p>
      <p className="text-xs text-slate-400 font-medium mt-1">
        {hasFilters ? 'Try a different search or status.' : 'Projects will appear here when they exist in the backend.'}
      </p>
    </div>
  );
};
