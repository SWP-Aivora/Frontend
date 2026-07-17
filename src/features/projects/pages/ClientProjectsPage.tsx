import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, CheckCircle2, ChevronRight, Clock3, Search, Wallet, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/lib/utils';
import { ProjectStatus } from '@/shared/types/enums';
import { useProjects } from '../hooks/useProjects';
import type { Project } from '../types';

type StatusFilter = 'all' | 'pending' | 'active' | 'review' | 'disputed' | 'completed' | 'cancelled';
type SortOrder = 'newest' | 'oldest';

const PAGE_SIZE = 10;

const normalizeProjectStatus = (status: unknown): Exclude<StatusFilter, 'all'> => {
  const numericStatus = typeof status === 'number'
    ? status
    : typeof status === 'string' && status.trim() !== '' && !Number.isNaN(Number(status))
      ? Number(status)
      : null;

  if (numericStatus === ProjectStatus.PENDING_FUNDING) return 'pending';
  if (numericStatus === ProjectStatus.ACTIVE) return 'active';
  if (numericStatus === ProjectStatus.IN_REVIEW) return 'review';
  if (numericStatus === ProjectStatus.DISPUTED) return 'disputed';
  if (numericStatus === ProjectStatus.COMPLETED) return 'completed';
  if (numericStatus === ProjectStatus.CANCELLED) return 'cancelled';

  const normalized = String(status ?? '').toUpperCase().replace(/\s+|_/g, '');
  if (normalized === 'PENDINGPAYMENT' || normalized === 'PENDINGFUNDING') return 'pending';
  if (normalized === 'ACTIVE' || normalized === 'INPROGRESS') return 'active';
  if (normalized === 'INREVIEW') return 'review';
  if (normalized === 'DISPUTED') return 'disputed';
  if (normalized === 'COMPLETED') return 'completed';
  if (normalized === 'CANCELLED' || normalized === 'CANCELED') return 'cancelled';

  return 'active';
};

const getStatusConfig = (status: Exclude<StatusFilter, 'all'>) => {
  switch (status) {
    case 'pending':
      return { label: 'Pending Funding', color: 'text-amber-700 bg-amber-50', icon: Wallet };
    case 'active':
      return { label: 'Active', color: 'text-primary bg-primary/10', icon: Clock3 };
    case 'review':
      return { label: 'In Review', color: 'text-violet-700 bg-violet-50', icon: Search };
    case 'disputed':
      return { label: 'Disputed', color: 'text-rose-700 bg-rose-50', icon: XCircle };
    case 'completed':
      return { label: 'Completed', color: 'text-brand-success bg-brand-success/10', icon: CheckCircle2 };
    case 'cancelled':
      return { label: 'Cancelled', color: 'text-slate-600 bg-slate-100', icon: XCircle };
    default:
      return { label: 'Active', color: 'text-primary bg-primary/10', icon: Clock3 };
  }
};

const formatBudget = (project: Project) => {
  const amount = Number(project.totalBudget ?? 0);
  const currency = project.currency || 'Aivora Coin';

  return amount > 0 ? `${amount.toLocaleString()} ${currency}` : `0 ${currency}`;
};

export const ClientProjectsPage = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const { data: projectsResponse, isLoading, isError, refetch, isFetching } = useProjects({
    PageIndex: pageIndex,
    PageSize: PAGE_SIZE,
  });

  const projects = useMemo(() => projectsResponse?.data ?? [], [projectsResponse?.data]);
  const metadata = projectsResponse?.metadata;
  const totalPages = Math.max(1, metadata?.totalPages ?? 1);
  const normalizedSearch = appliedSearchTerm.trim().toLowerCase();

  const filteredProjects = useMemo(() => (
    projects
      .map(project => ({ project, status: normalizeProjectStatus(project.status) }))
      .filter(item => filter === 'all' || item.status === filter)
      .filter(({ project }) => {
        if (!normalizedSearch) return true;

        return [
          project.title,
          project.description,
          project.expertName,
          project.expert?.fullName,
        ].some(value => String(value ?? '').toLowerCase().includes(normalizedSearch));
      })
      .sort((a, b) => {
        const aTime = new Date(a.project.createdAt).getTime();
        const bTime = new Date(b.project.createdAt).getTime();
        return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
      })
  ), [filter, normalizedSearch, projects, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4" role="status" aria-live="polite">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-rose-100 bg-rose-50 p-10 text-center">
        <h1 className="text-2xl font-black text-slate-900">Unable to load projects</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">Refresh the project list and try again.</p>
        <Button onClick={() => refetch()} className="mt-6 rounded-full px-8" disabled={isFetching}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Projects</h1>
          <p className="text-slate-500 font-medium mt-1">Open workspaces for accepted proposals and active delivery.</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
          <Link to="/client/job-posts" className="flex items-center gap-2">
            <Briefcase className="size-4" />
            My Job Posts
          </Link>
        </Button>
      </div>

      <div className="bg-white border border-slate-100 rounded-lg p-2 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm relative z-10">
        <div className="flex items-center gap-2 p-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
          {(['all', 'active', 'disputed', 'completed', 'cancelled'] as StatusFilter[]).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all duration-300',
                filter === status
                  ? 'bg-brand-blue-dark text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto px-2 pb-2 md:pb-0 md:px-0">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project or expert..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
            />
          </div>
          <Button
            type="button"
            onClick={() => setAppliedSearchTerm(searchInput)}
            className="h-10 rounded-lg px-5 font-black"
          >
            <Search className="mr-2 size-4" />
            Search
          </Button>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="newest">Newest Created</option>
            <option value="oldest">Oldest Created</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map(({ project, status }) => {
          const config = getStatusConfig(status);
          const StatusIcon = config.icon;

          return (
            <div
              key={project.id}
              className="group bg-white border border-slate-100 hover:border-primary/30 rounded-lg p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={cn('px-3 py-1 rounded-full flex items-center gap-1.5', config.color)}>
                      <StatusIcon className="size-3.5" />
                      <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                      <Link
                        to={`/client/projects/${project.id}/workspace`}
                        className="inline-block hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                      >
                        {project.title}
                      </Link>
                    </h3>
                    {project.description && (
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-500">{project.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md">
                        Expert: {project.expertName || project.expert?.fullName || 'Assigned expert'}
                      </span>
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
                        {formatBudget(project)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 min-w-[160px] pl-6 md:border-l border-slate-100">
                  <Button asChild variant="ghost" className="rounded-full bg-slate-50 hover:bg-primary hover:text-white group/btn">
                    <Link to={`/client/projects/${project.id}/workspace`}>
                      Open Workspace
                      <ChevronRight className="size-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-20 flex flex-col items-center justify-center text-center">
            <div className="size-16 rounded-lg bg-white flex items-center justify-center shadow-sm mb-4">
              <Briefcase className="size-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No projects found</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-6">Accepted proposal workspaces will appear here.</p>
            <Button asChild className="rounded-full shadow-lg shadow-primary/20">
              <Link to="/client/job-posts">View My Job Posts</Link>
            </Button>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPageIndex(page => Math.max(1, page - 1))}
            disabled={pageIndex === 1 || isFetching}
            className="rounded-full"
          >
            Previous
          </Button>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">
            Page {metadata?.pageIndex ?? pageIndex} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPageIndex(page => Math.min(totalPages, page + 1))}
            disabled={pageIndex >= totalPages || isFetching}
            className="rounded-full"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
