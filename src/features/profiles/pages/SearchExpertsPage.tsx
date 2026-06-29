import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, ShieldCheck, SlidersHorizontal, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services';
import type { ExpertProfileResponse } from '../types';

type ExperienceFilter = 'all' | '1-2' | '3-5' | '5+';
type RateFilter = 'all' | '10-30' | '30-60' | '60+';
type SortOption = 'mostRating' | 'leastRating';

const experienceOptions: { value: ExperienceFilter; label: string }[] = [
  { value: 'all', label: 'Any experience' },
  { value: '1-2', label: '1 - 2 years' },
  { value: '3-5', label: '3 - 5 years' },
  { value: '5+', label: 'Above 5 years' },
];

const rateOptions: { value: RateFilter; label: string }[] = [
  { value: 'all', label: 'Any hourly rate' },
  { value: '10-30', label: '10 - 30 Aivora Coin / hr' },
  { value: '30-60', label: '30 - 60 Aivora Coin / hr' },
  { value: '60+', label: '60+ Aivora Coin / hr' },
];

const getExpertSkills = (expert: ExpertProfileResponse): string[] => (
  expert.skills?.map((skill) => skill.skillName).filter(Boolean) ?? []
);

const matchesExperience = (years: number, filter: ExperienceFilter) => {
  if (filter === 'all') return true;
  if (filter === '1-2') return years >= 1 && years <= 2;
  if (filter === '3-5') return years >= 3 && years <= 5;
  return years > 5;
};

const matchesRate = (rate: number | null, filter: RateFilter) => {
  if (filter === 'all') return true;
  const hourlyRate = rate ?? 0;
  if (filter === '10-30') return hourlyRate >= 10 && hourlyRate <= 30;
  if (filter === '30-60') return hourlyRate > 30 && hourlyRate <= 60;
  return hourlyRate > 60;
};

export const SearchExpertsPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('all');
  const [rateFilter, setRateFilter] = useState<RateFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('mostRating');

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['experts', 'search', submittedSearch],
    queryFn: () => profileService.searchExperts({ keyword: submittedSearch, pageSize: 50 }),
  });

  const experts = response?.data || [];
  const filteredExperts = experts
    .filter((expert) => (
      matchesExperience(expert.experienceYears ?? 0, experienceFilter)
        && matchesRate(expert.hourlyRate, rateFilter)
    ))
    .sort((a, b) => {
      const ratingDelta = (b.rating ?? 0) - (a.rating ?? 0);
      const reviewDelta = (b.totalReviews ?? 0) - (a.totalReviews ?? 0);
      const result = ratingDelta || reviewDelta;
      return sortOption === 'mostRating' ? result : -result;
    });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput('');
    setSubmittedSearch('');
    setExperienceFilter('all');
    setRateFilter('all');
    setSortOption('mostRating');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-brand-blue-dark rounded-[20px] px-8 py-7 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-emerald-500/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl lg:text-[34px] 2xl:text-4xl font-black tracking-tight mb-3 lg:whitespace-nowrap">
            Find the right AI Expert for your project.
          </h1>
          <p className="text-blue-100 text-base max-w-3xl">
            Browse our vetted directory of top-tier AI developers, data scientists, and automation specialists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="size-4" /> Filters
              </h3>
              <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">Clear all</button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Experience Years</h4>
                <div className="space-y-2">
                  {experienceOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="experienceYears"
                          className="peer sr-only"
                          checked={experienceFilter === option.value}
                          onChange={() => setExperienceFilter(option.value)}
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-slate-200 peer-checked:border-brand-blue-dark peer-checked:bg-brand-blue-dark transition-colors flex items-center justify-center">
                          <CheckCircle2 className="size-3 text-white opacity-0 peer-checked:opacity-100" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Hourly Rate</h4>
                <div className="space-y-2">
                  {rateOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="hourlyRate"
                          className="peer sr-only"
                          checked={rateFilter === option.value}
                          onChange={() => setRateFilter(option.value)}
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-slate-200 peer-checked:border-brand-blue-dark peer-checked:bg-brand-blue-dark transition-colors flex items-center justify-center">
                          <CheckCircle2 className="size-3 text-white opacity-0 peer-checked:opacity-100" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col xl:flex-row gap-3 xl:items-center">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search by keyword, skill, or name..."
                    className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                  />
                </div>
                <Button type="submit" className="h-11 px-6 rounded-xl bg-brand-blue-dark hover:bg-brand-blue-dark/90 text-white font-bold shrink-0">
                  Search
                </Button>
              </form>

              <div className="flex items-center gap-2 text-sm xl:shrink-0">
                <span className="text-slate-500 font-medium">Sort by rating:</span>
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                  className="h-11 rounded-xl border border-slate-100 bg-slate-50 px-3 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                >
                  <option value="mostRating">Most stars</option>
                  <option value="leastRating">Least stars</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
              <h2 className="text-sm font-black text-slate-900">{filteredExperts.length} experts found</h2>
              {submittedSearch && (
                <span className="text-xs font-bold text-slate-400">
                  Search: {submittedSearch}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="size-10 text-primary animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Loading experts...</p>
              </div>
            ) : isError ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="size-10 text-destructive" />
                <p className="text-slate-500 font-bold">Failed to load experts. Please try again.</p>
              </div>
            ) : (
              filteredExperts.map((expert) => {
                const name = expert.fullName || 'Unnamed Expert';
                const title = expert.title || 'AI Expert';
                const profileId = expert.userId;
                const location = 'Global';
                const rating = Number(expert.rating ?? 0);
                const reviews = expert.totalReviews ?? 0;
                const verified = true;
                const skills = getExpertSkills(expert);

                return (
                  <div
                    key={profileId}
                    className="bg-white border border-slate-100 hover:border-blue-200 rounded-[20px] p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex gap-4 md:w-1/3 shrink-0">
                        <div className="size-16 rounded-full bg-blue-100 border border-blue-200 overflow-hidden flex items-center justify-center shrink-0">
                          {expert.avatarUrl ? (
                            <img src={expert.avatarUrl} alt={name} className="size-full object-cover" />
                          ) : (
                            <span className="text-xl font-black text-primary">{name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <Link to={`/client/experts/${profileId}`} className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                            {name}
                          </Link>
                          <p className="text-sm font-semibold text-slate-600 line-clamp-1 mb-2">{title}</p>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-900">
                              <Star className="size-3 fill-yellow-400 text-yellow-400" /> {rating.toFixed(1)}
                            </span>
                            <span className="text-xs font-medium text-slate-500">({reviews})</span>
                            {verified && (
                              <ShieldCheck className="size-4 text-emerald-500 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                          {expert.bio || 'No expert bio provided yet.'}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                              {skill}
                            </span>
                          ))}
                          {skills.length > 3 && (
                            <span className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                              +{skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end justify-between md:border-l border-slate-100 md:pl-6 shrink-0 md:w-40">
                        <div className="flex flex-row md:flex-col items-center md:items-end w-full justify-between md:justify-start gap-2 md:gap-0 mb-4 md:mb-0">
                          <div className="text-left md:text-right">
                            <span className="text-xl font-black text-slate-900">{expert.hourlyRate || 0}</span>
                            <span className="text-xs font-medium text-slate-500"> Aivora Coin/hr</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                            <MapPin className="size-3" /> {location}
                          </div>
                        </div>

                        <Button asChild className="w-full md:w-auto rounded-full bg-brand-blue-dark hover:bg-brand-blue-dark/90 font-bold shadow-md shadow-blue-900/20">
                          <Link to={`/client/experts/${profileId}`}>View Profile</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {!isLoading && !isError && filteredExperts.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[28px] p-16 flex flex-col items-center justify-center text-center">
                <Search className="size-12 text-slate-300 mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-2">No experts found</h3>
                <p className="text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-6 rounded-full"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
