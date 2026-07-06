import { FileText } from 'lucide-react';

interface AdminJobPostEmptyStateProps {
  hasFilters: boolean;
}

export const AdminJobPostEmptyState = ({ hasFilters }: AdminJobPostEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-slate-500 py-20">
      <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <FileText className="size-8 opacity-30" />
      </div>
      <p className="text-sm font-bold text-slate-500">
        {hasFilters ? 'No job posts match your filters' : 'No job posts found'}
      </p>
      <p className="text-xs text-slate-400 font-medium mt-1">
        {hasFilters ? 'Try a different search or status.' : 'Job posts will appear here when they exist in the backend.'}
      </p>
    </div>
  );
};

