import { type Dispatch, type FormEvent, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { JobBoardCard } from '../components/JobBoardCard';
import { type JobCard } from '../schema';
import { type Job } from '../types';
import { Search, DollarSign, BrainCircuit, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services';

const budgetTypeFilters = [
  { label: 'Fixed Price', value: 'FIXED' },
  { label: 'Hourly Rate', value: 'HOURLY' },
];

const skillLevelFilters = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
  { label: 'Expert', value: 'EXPERT' },
];

const normalizeBudgetType = (value: unknown) => {
  if (value === 0) return 'FIXED';
  if (value === 1) return 'HOURLY';

  const normalized = String(value ?? '').toUpperCase();
  if (normalized === 'FIXED' || normalized === 'HOURLY') return normalized;

  return null;
};

const normalizeSkillLevel = (value: unknown) => {
  if (value === 0) return 'BEGINNER';
  if (value === 1) return 'INTERMEDIATE';
  if (value === 2) return 'ADVANCED';
  if (value === 3) return 'EXPERT';

  const normalized = String(value ?? '').toUpperCase();
  if (['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(normalized)) return normalized;

  return null;
};

const mapBudgetTypeToCardValue = (value: unknown) => {
  const normalized = normalizeBudgetType(value);
  return normalized === 'HOURLY' ? 1 : 0;
};

const mapSkillLevelToCardValue = (value: unknown) => {
  const normalized = normalizeSkillLevel(value);
  if (normalized === 'BEGINNER') return 0;
  if (normalized === 'INTERMEDIATE') return 1;
  if (normalized === 'ADVANCED') return 2;
  if (normalized === 'EXPERT') return 3;
  return null;
};

const mapJobToJobCard = (job: Job): JobCard => ({
  id: job.id,
  title: job.title,
  description: job.finalDescription || job.originalDescription,
  businessDomain: job.businessDomain,
  budgetType: mapBudgetTypeToCardValue(job.budgetType),
  budgetMin: job.budgetMin,
  budgetMax: job.budgetMax,
  timelineDays: job.timelineDays,
  experienceLevel: mapSkillLevelToCardValue(job.experienceLevel),
  createdAt: new Date(job.createdAt).toLocaleDateString(),
  skills: job.skills?.map(s => s.name) || [],
  proposalsCount: 0,
  clientName: job.client?.fullName || ('clientName' in job ? String(job.clientName || '') : '') || 'Anonymous Client',
  clientVerified: true,
});

export const FindWorkPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [selectedBudgetTypes, setSelectedBudgetTypes] = useState<string[]>([]);
  const [selectedSkillLevels, setSelectedSkillLevels] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [loadedJobs, setLoadedJobs] = useState<Job[]>([]);
  const pageSize = 20;

  const { data: jobsResponse, isLoading, isFetching, error } = useQuery({
    queryKey: ['jobs', 'find-work', pageIndex],
    queryFn: () => jobService.getJobs({ PageSize: pageSize, PageIndex: pageIndex }),
  });

  useEffect(() => {
    const pageJobs = jobsResponse?.data ?? [];
    if (pageJobs.length === 0) return;

    setLoadedJobs(current => {
      const nextJobs = pageIndex === 1 ? pageJobs : [...current, ...pageJobs];
      return Array.from(new Map(nextJobs.map(job => [job.id, job])).values());
    });
  }, [jobsResponse?.data, pageIndex]);

  const hasNextPage = jobsResponse?.metadata?.hasNextPage ?? false;

  const filteredJobs = useMemo(() => {
    const normalizedSearch = appliedSearchTerm.trim().toLowerCase();

    return loadedJobs.filter(job => {
      const budgetType = normalizeBudgetType(job.budgetType);
      const skillLevel = normalizeSkillLevel(job.experienceLevel);
      const clientName = job.client?.fullName || ('clientName' in job ? String(job.clientName || '') : '');

      const matchesBudgetType =
        selectedBudgetTypes.length === 0 || (budgetType !== null && selectedBudgetTypes.includes(budgetType));
      const matchesSkillLevel =
        selectedSkillLevels.length === 0 ||
        (skillLevel !== null && selectedSkillLevels.includes(skillLevel));

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          job.title,
          job.originalDescription,
          job.finalDescription,
          clientName,
        ].some(value => value?.toLowerCase().includes(normalizedSearch));

      return matchesBudgetType && matchesSkillLevel && matchesSearch;
    });
  }, [loadedJobs, appliedSearchTerm, selectedBudgetTypes, selectedSkillLevels]);

  const toggleSelectedValue = (
    value: string,
    setSelectedValues: Dispatch<SetStateAction<string[]>>
  ) => {
    setSelectedValues(current =>
      current.includes(value)
        ? current.filter(selectedValue => selectedValue !== value)
        : [...current, value]
    );
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedSearchTerm(searchTerm);
  };

  const clearFilters = () => {
    setSelectedBudgetTypes([]);
    setSelectedSkillLevels([]);
    setSearchTerm('');
    setAppliedSearchTerm('');
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Search */}
      <div className="bg-brand-blue-dark rounded-xl p-10 md:p-14 relative overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            Find the Perfect <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-brand-accent">AI Project</span>
          </h1>
          <p className="text-brand-blue-light/80 text-lg font-medium mb-8 max-w-xl">
            Browse thousands of high-quality AI jobs from verified clients. Apply, deliver, and get paid securely.
          </p>

          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50" />
              <input 
                type="text" 
                placeholder="Search by title, description, or client..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-transparent border-none text-white placeholder:text-white/50 focus:outline-none focus:ring-0 text-base"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-white/20 self-center" />
            <Button className="h-12 px-8 rounded-xl font-bold bg-white text-brand-blue-dark hover:bg-slate-100 transition-colors w-full md:w-auto">
              Search Jobs
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-lg font-black text-slate-900">Filters</h2>
             <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">Clear all</button>
          </div>

          {/* Budget Filter */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
               <DollarSign className="size-4 text-brand-accent" />
               Budget Type
            </div>
            <div className="space-y-3">
              {budgetTypeFilters.map(filter => (
                <label key={filter.value} className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative size-5 rounded-md border-2 border-slate-300 bg-white group-hover:border-brand-accent transition-colors overflow-hidden">
                      <input
                        type="checkbox"
                        className="peer absolute inset-0 opacity-0 cursor-pointer"
                        checked={selectedBudgetTypes.includes(filter.value)}
                        onChange={() => toggleSelectedValue(filter.value, setSelectedBudgetTypes)}
                      />
                      <div className="absolute inset-0 bg-brand-accent opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="size-3 text-white"><path d="M5 13l4 4L19 7" /></svg>
                      </div>
                   </div>
                   <span className="text-sm font-medium text-slate-700">{filter.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skill Level Filter */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
               <BrainCircuit className="size-4 text-brand-accent" />
               Skill Level
            </div>
            <div className="space-y-3">
              {skillLevelFilters.map(filter => (
                <label key={filter.value} className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative size-5 rounded-md border-2 border-slate-300 bg-white group-hover:border-brand-accent transition-colors overflow-hidden">
                      <input
                        type="checkbox"
                        className="peer absolute inset-0 opacity-0 cursor-pointer"
                        checked={selectedSkillLevels.includes(filter.value)}
                        onChange={() => toggleSelectedValue(filter.value, setSelectedSkillLevels)}
                      />
                      <div className="absolute inset-0 bg-brand-accent opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="size-3 text-white"><path d="M5 13l4 4L19 7" /></svg>
                      </div>
                   </div>
                   <span className="text-sm font-medium text-slate-700">{filter.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Main Job List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-4 shadow-sm mb-6">
             <p className="text-sm font-bold text-slate-500">
               Showing <span className="text-slate-900">{filteredJobs.length}</span> jobs
             </p>
             <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Sort by:</span>
                <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 px-3 py-1.5 focus:outline-none focus:border-brand-accent cursor-pointer">
                  <option>Newest First</option>
                  <option>Highest Budget</option>
                  <option>Relevance</option>
                </select>
             </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Failed to load jobs.</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No jobs found matching your criteria.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {filteredJobs.map(job => (
                  <JobBoardCard key={job.id} job={mapJobToJobCard(job)} />
               ))}
            </div>
          )}
          
          <div className="pt-8 flex justify-center">
             <Button
               variant="outline"
               disabled={!hasNextPage || isFetching}
               onClick={() => setPageIndex(current => current + 1)}
               className="rounded-full px-8 h-12 font-bold border-slate-200 text-slate-600 hover:text-brand-accent hover:border-brand-accent transition-all"
             >
                {isFetching && pageIndex > 1 ? 'Loading...' : hasNextPage ? 'Load More Jobs' : 'No More Jobs'}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
