import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Star, MapPin, ShieldCheck, 
  Briefcase, Clock, ChevronLeft, X, Calendar, DollarSign, Users
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { profileService } from '../services';
import { reviewService } from '@/features/reviews/services';
import { projectService } from '@/features/projects/services';
import type { Project } from '@/features/projects/types';
import { chatService } from '@/features/chat/services';
import { AvailabilityStatus, ProjectStatus, Role } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth/store';
import { DirectTransferModal } from '@/features/wallet';

const formatProjectDate = (value?: string | null): string => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const formatProjectBudget = (project?: Project | null): string => {
  if (!project || typeof project.totalBudget !== 'number') return 'N/A';
  return `${project.totalBudget.toLocaleString()} ${project.currency || 'Aivora Coin'}`;
};

export const ExpertPublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isClient = useAuthStore((state) => state.user?.role === Role.CLIENT);
  const [selectedCompletedProject, setSelectedCompletedProject] = useState<Project | null>(null);

  const expertId = id || '';

  // 1. Fetch Expert Profile
  const { data: profileResponse, isLoading: isProfileLoading } = useQuery({
    queryKey: ['expertProfile', expertId],
    queryFn: () => profileService.getExpertProfileById(expertId),
    enabled: !!expertId,
  });
  const profile = profileResponse?.data;

  // 2. Fetch Expert Reviews
  const { data: reviewsResponse, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['expertReviews', profile?.userId],
    queryFn: () => reviewService.getUserReviews(profile!.userId),
    enabled: !!profile?.userId,
  });
  const reviews = reviewsResponse?.items || [];
  
  // Calculate average rating from reviews
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // 3. Fetch Expert Projects
  const { data: projectsResponse, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['expertProjects'],
    queryFn: () => projectService.getProjects({ PageSize: 100, PageIndex: 1 }),
  });
  // Project completion rate is based on all projects returned by the Project API for this expert.
  const expertProjects = (projectsResponse?.data || []).filter(
    p => p.expertId === profile?.userId
  );
  const completedProjects = expertProjects.filter(
    p => p.status === ProjectStatus.COMPLETED
  );

  const { data: selectedProjectResponse, isLoading: isLoadingSelectedProject } = useQuery({
    queryKey: ['expertProfile', expertId, 'completedProject', selectedCompletedProject?.id],
    queryFn: () => projectService.getProjectById(selectedCompletedProject!.id),
    enabled: !!selectedCompletedProject?.id,
  });

  // 4. Initialize Chat Mutation
  const initChatMutation = useMutation({
    mutationFn: async () => {
      const conversationsResponse = await chatService.getAll({
        PageIndex: 1,
        PageSize: 100,
      }, currentUserId);

      const existingConversation = conversationsResponse.data?.find(
        (conversation) => conversation.recipient.id === expertId
      );

      if (existingConversation) {
        return existingConversation;
      }

      const response = await chatService.initializeConversation({ expertId }, currentUserId);
      if (!response.data) {
        throw new Error('Conversation opened, but no conversation id was returned.');
      }

      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate('/client/messages', { state: { conversationId: response.id } });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to initiate conversation. Please try again.');
    }
  });

  const isLoading = isProfileLoading || isReviewsLoading || isProjectsLoading;

  const name = profile?.fullName || '';
  const title = profile?.title || '';
  const bio = profile?.bio || '';
  const location = '';
  const hourlyRate = profile?.hourlyRate || 0;
  const rating = profile?.rating ?? parseFloat(avgRating) ?? 0;
  const skills = profile?.skills?.map(skill => skill.skillName).filter(Boolean) || [];
  
  const displayReviews = reviews;
  const displayProjects = completedProjects;
  const modalProject = selectedProjectResponse?.data ?? selectedCompletedProject;
  const completedProjectCount = profile?.completedProjects ?? displayProjects.length;
  const totalReviewCount = profile?.totalReviews ?? displayReviews.length;
  const projectCompletionRate = expertProjects.length > 0
    ? Math.round((completedProjects.length / expertProjects.length) * 100)
    : 0;
  const availabilityStatus = profile?.availabilityStatus;
  const availabilityLabel = availabilityStatus === AvailabilityStatus.BUSY
    ? 'Busy'
    : availabilityStatus === AvailabilityStatus.UNAVAILABLE
      ? 'Unavailable'
      : 'Available for Projects';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6faff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6faff] pb-20 relative overflow-hidden animate-in fade-in duration-700">
      {/* Ambient background glows */}
      <div className="absolute top-[-160px] left-[-180px] w-[520px] h-[520px] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[-160px] right-[-100px] w-[520px] h-[520px] bg-blue-300/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6 relative z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-primary transition-colors"
        >
          <ChevronLeft className="size-4" />
          Go back
        </button>
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-[#edf6ff] rounded-[30px] p-8 shadow-sm border border-blue-100/50 relative overflow-hidden">
          {/* Header decorative orb */}
          <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-blue-200/40 blur-[40px] rounded-full" />
          
          <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
            {/* Left Info */}
            <div className="flex gap-6 items-start">
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 bg-brand-primary flex items-center justify-center">
                {profile?.avatarUrl ? (
                   <img src={profile.avatarUrl} alt={name} className="size-full object-cover" />
                ) : (
                   <span className="text-4xl font-bold text-white">{name.charAt(0)}</span>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
                    {availabilityLabel}
                  </span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Expert
                  </span>
                </div>
                
                <div>
                  {name && (
                    <h1 className="text-3xl font-extrabold text-brand-dark mb-1 tracking-tight">
                      {name}
                    </h1>
                  )}
                  {title && (
                    <p className="text-brand-secondary font-medium text-[15px]">
                      {title}
                    </p>
                  )}
                </div>

                {location && (
                  <div className="flex items-center gap-4 text-sm text-brand-muted/80">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" /> {location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Action / Rates */}
            <div className="flex flex-col items-start lg:items-end justify-center">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-brand-dark">{hourlyRate}</span>
                <span className="text-brand-muted text-sm font-medium"> Aivora Coin/hr</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-200/50 to-transparent my-8" />
          
          {/* Stats Block */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-blue-100/50 relative z-10">
            <div className="p-4 md:p-6 text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-brand-dark mb-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> {rating.toFixed(1)}
              </div>
              <div className="text-xs font-medium text-brand-muted uppercase tracking-wider">Average Rating</div>
            </div>
            <div className="p-4 md:p-6 text-center">
              <div className="text-2xl font-bold text-brand-dark mb-1">{completedProjectCount}</div>
              <div className="text-xs font-medium text-brand-muted uppercase tracking-wider">Jobs Completed</div>
            </div>
            <div className="p-4 md:p-6 text-center">
              <div className="text-2xl font-bold text-brand-dark mb-1">{totalReviewCount}</div>
              <div className="text-xs font-medium text-brand-muted uppercase tracking-wider">Reviews</div>
            </div>
            <div className="p-4 md:p-6 text-center">
              <div className="text-2xl font-bold text-brand-dark mb-1">{projectCompletionRate}%</div>
              <div className="text-xs font-medium text-brand-muted uppercase tracking-wider">Project Completion</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column - Main profile content takes 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About & Overview */}
            <div id="overview" className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100/80">
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-3">About This Expert</h3>
              {title && <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{title}</h4>}
              {bio ? (
                <p className="text-brand-secondary leading-relaxed whitespace-pre-wrap text-sm md:text-[15px]">
                  {bio}
                </p>
              ) : (
                <p className="text-sm text-slate-400">No information yet.</p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100/80">
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-4">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-blue-50/70 hover:bg-blue-50 text-brand-primary px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold border border-blue-100/50 transition-colors">
                    {skill}
                  </span>
                ))}
                {skills.length === 0 && <span className="text-sm text-slate-400">No skills listed.</span>}
              </div>
            </div>

            {/* Completed Projects */}
            <div id="projects" className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100/80">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">Completed Projects</h3>
                  <h4 className="text-lg md:text-xl font-bold text-slate-900">Proof of Practical AI Outcomes</h4>
                </div>
              </div>
              
              {displayProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setSelectedCompletedProject(project)}
                      className="border border-blue-100/30 bg-slate-50/20 hover:bg-white rounded-xl p-5 text-left shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-l-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-blue-50/70 text-brand-primary text-xs font-bold px-2.5 py-1 rounded-lg">Completed Project</span>
                        {project.endDate && (
                          <span className="text-xs font-bold text-slate-500">
                            {formatProjectDate(project.endDate)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2 line-clamp-1 hover:text-brand-primary transition-colors">{project.title}</h4>
                      <p className="text-xs text-brand-secondary leading-relaxed line-clamp-2">{project.description}</p>
                      {typeof project.totalBudget === 'number' && project.totalBudget > 0 && (
                        <p className="mt-3 text-xs font-bold text-slate-700">
                          Budget: {formatProjectBudget(project)}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/30">
                  <div className="w-10 h-10 rounded-full bg-blue-50/70 flex items-center justify-center mb-3">
                    <Briefcase className="w-5 h-5 text-brand-primary/70" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-700 mb-0.5">No Completed Projects Yet</h5>
                  <p className="text-xs text-slate-400 max-w-sm">
                    This expert hasn't completed any milestone projects on AIVORA yet.
                  </p>
                </div>
              )}
            </div>

            {/* Combined Rating Summary & Reviews Section */}
            <div id="reviews" className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100/80">
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-6">Client Reviews & Rating Summary</h3>
              
              {/* Rating Overview Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${displayReviews.length > 0 ? 'pb-6 border-b border-slate-100 mb-6' : ''}`}>
                <div className="flex flex-col items-center md:items-start justify-center p-5 bg-slate-50/50 rounded-xl border border-slate-100/60 shrink-0">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-4xl font-extrabold text-slate-900">{rating.toFixed(1)}</span>
                    <span className="text-sm text-slate-400">/ 5.0</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, idx) => {
                      const starVal = idx + 1;
                      return (
                        <Star 
                          key={idx} 
                          className={`w-4 h-4 ${starVal <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs text-brand-secondary font-medium">Based on {totalReviewCount} reviews</span>
                </div>

                <div className="col-span-2 flex flex-col justify-center space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-700">Project Completion Rate</span>
                      <span className="text-xs font-bold text-brand-primary">{projectCompletionRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-primary rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(0, Math.min(100, projectCompletionRate))}%` }} 
                      />
                    </div>
                  </div>
                  <p className="text-xs text-brand-secondary leading-relaxed">
                    The completion rate represents completed projects divided by all projects returned for this expert, including active, in-review, disputed, completed, and cancelled projects.
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              {displayReviews.length > 0 && (
                <div className="space-y-6">
                  {displayReviews.map((review, i: number) => (
                    <div key={i} className={`flex gap-4 ${i > 0 ? "pt-6 border-t border-slate-100" : ""}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-sm font-bold text-brand-primary shrink-0 shadow-inner">
                        {review.reviewerName ? review.reviewerName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h5 className="text-sm font-bold text-slate-900">{review.reviewerName || 'Anonymous User'}</h5>
                            <p className="text-[10px] text-slate-400">Verified Client</p>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <Star 
                                key={idx} 
                                className={`w-3 h-3 ${idx < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-brand-secondary leading-relaxed whitespace-pre-wrap">{review.comment || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Compact Sidebar with sticky floating behaviour */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
            
            {/* CTA Invite Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:shadow-md duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -z-10" />
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Ready to Collaborate</h3>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Invite {name ? name.split(' ')[0] : 'this expert'} to your project</h4>
              <p className="text-xs text-brand-secondary mb-6 leading-relaxed">
                Select an existing project or start a chat to align on scope, budget, and requirements.
              </p>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full rounded-lg border-blue-200 text-brand-primary hover:bg-blue-50/50 font-bold h-11 text-sm transition-all duration-300"
                  onClick={() => initChatMutation.mutate()}
                  disabled={initChatMutation.isPending}
                >
                  {initChatMutation.isPending ? 'Connecting...' : 'Send Message'}
                </Button>

                {isClient && currentUserId !== profile?.userId && (
                  <DirectTransferModal 
                    recipientId={profile?.userId || ''} 
                    recipientName={name} 
                  />
                )}
              </div>
            </div>

            {/* Verification Badge */}
            <div className="bg-emerald-50/40 rounded-xl p-5 shadow-sm border border-emerald-100/50 flex gap-3.5 items-start">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Verified Expert</h3>
                <p className="text-xs text-emerald-700/80 leading-relaxed">
                  Profile details, skills, and background credentials have been verified by the AIVORA admin team.
                </p>
              </div>
            </div>

            {/* Work Preferences */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md duration-300">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100/70">Work Preferences</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50/70 flex items-center justify-center text-brand-primary shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preferred Focus</h4>
                    <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">
                      {skills.length > 0 ? skills.slice(0, 3).join(', ') : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50/70 flex items-center justify-center text-brand-primary shrink-0">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hourly Rate</h4>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {hourlyRate > 0 ? `${hourlyRate} Aivora Coin/hr` : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50/70 flex items-center justify-center text-brand-primary shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availability Status</h4>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {availabilityLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {selectedCompletedProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close completed project details"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedCompletedProject(null)}
          />
          <div className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Completed Project</p>
                <h3 className="mt-2 text-2xl font-black leading-tight text-slate-900">
                  {modalProject?.title || 'Untitled Project'}
                </h3>
                {isLoadingSelectedProject && (
                  <p className="mt-2 text-xs font-semibold text-slate-400">Loading project details...</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompletedProject(null)}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:text-slate-900"
                aria-label="Close completed project details"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[calc(85vh-104px)] overflow-y-auto p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <DollarSign className="mb-2 size-5 text-emerald-600" />
                  <p className="text-sm font-black text-slate-900">{formatProjectBudget(modalProject)}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Budget</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <Calendar className="mb-2 size-5 text-brand-primary" />
                  <p className="text-sm font-black text-slate-900">{formatProjectDate(modalProject?.startDate)}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Start Date</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <Calendar className="mb-2 size-5 text-brand-primary" />
                  <p className="text-sm font-black text-slate-900">{formatProjectDate(modalProject?.endDate)}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Completed Date</p>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-slate-100 bg-white p-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Project Summary</h4>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-brand-secondary">
                  {modalProject?.description || 'No project description available.'}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <Users className="mb-2 size-5 text-slate-500" />
                  <p className="text-sm font-black text-slate-900">{modalProject?.clientName || modalProject?.client?.fullName || 'Client'}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Client</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <ShieldCheck className="mb-2 size-5 text-emerald-600" />
                  <p className="text-sm font-black text-slate-900">{modalProject?.expertName || modalProject?.expert?.fullName || name || 'Expert'}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Expert</p>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-slate-100 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Completed Milestones</h4>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-brand-primary">
                    {modalProject?.milestones?.length ?? 0} total
                  </span>
                </div>
                {modalProject?.milestones?.length ? (
                  <div className="space-y-2">
                    {modalProject.milestones.map((milestone) => (
                      <div key={milestone.id} className="rounded-lg bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-black text-slate-900">{milestone.title}</p>
                          <span className="shrink-0 text-xs font-bold text-slate-500">
                            {milestone.amount?.toLocaleString()} {milestone.currency || modalProject.currency || 'Aivora Coin'}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-brand-secondary">{milestone.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-400">
                    Milestone details are not available from the current project response.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
