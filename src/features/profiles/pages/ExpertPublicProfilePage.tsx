import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Star, MapPin, ShieldCheck, 
  Briefcase, Globe, Clock, ChevronLeft
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { profileService } from '../services';
import { reviewService } from '@/features/reviews/services';
import { projectService } from '@/features/projects/services';
import { chatService } from '@/features/chat/services';
import { ProjectStatus } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth/store';

export const ExpertPublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const [activeTab, setActiveTab] = useState('overview');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleTabClick = (tabId: string, sectionId: string) => {
    setActiveTab(tabId);
    scrollToSection(sectionId);
  };

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
    queryFn: () => projectService.getProjects(),
  });
  // Filter for this expert's completed projects
  const completedProjects = (projectsResponse?.data || []).filter(
    p => p.expertId === profile?.userId && p.status === ProjectStatus.COMPLETED
  );

  const mappedProjects = completedProjects.map(p => ({
    title: p.title,
    description: p.description || '',
    rating: profile?.rating || 0
  }));

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
  const displayProjects = mappedProjects;
  const completedProjectCount = profile?.completedProjects ?? displayProjects.length;
  const totalReviewCount = profile?.totalReviews ?? displayReviews.length;
  const successRate = profile?.successRate ?? 0;
  const availabilityStatus = String(profile?.availabilityStatus ?? '').toUpperCase();
  const availabilityLabel = availabilityStatus === 'BUSY'
    ? 'Busy'
    : availabilityStatus === 'UNAVAILABLE'
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
              <div className="text-2xl font-bold text-brand-dark mb-1">{successRate}%</div>
              <div className="text-xs font-medium text-brand-muted uppercase tracking-wider">On-Time Delivery</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/85 backdrop-blur-md rounded-xl p-1.5 shadow-sm border border-blue-100/30 flex items-center gap-1.5 overflow-x-auto sticky top-4 z-30">
          <button 
            onClick={() => handleTabClick('overview', 'overview')}
            className={`px-5 py-2 text-xs md:text-sm font-bold rounded-full transition-all duration-300 ${
              activeTab === 'overview' 
                ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/10' 
                : 'text-brand-secondary hover:bg-slate-50 hover:text-brand-dark'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => handleTabClick('portfolio', 'portfolio')}
            className={`px-5 py-2 text-xs md:text-sm font-bold rounded-full transition-all duration-300 ${
              activeTab === 'portfolio' 
                ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/10' 
                : 'text-brand-secondary hover:bg-slate-50 hover:text-brand-dark'
            }`}
          >
            Portfolio
          </button>
          <button 
            onClick={() => handleTabClick('projects', 'projects')}
            className={`px-5 py-2 text-xs md:text-sm font-bold rounded-full transition-all duration-300 ${
              activeTab === 'projects' 
                ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/10' 
                : 'text-brand-secondary hover:bg-slate-50 hover:text-brand-dark'
            }`}
          >
            Completed Projects
          </button>
          <button 
            onClick={() => handleTabClick('reviews', 'reviews')}
            className={`px-5 py-2 text-xs md:text-sm font-bold rounded-full transition-all duration-300 ${
              activeTab === 'reviews' 
                ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/10' 
                : 'text-brand-secondary hover:bg-slate-50 hover:text-brand-dark'
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column - Main profile content takes 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About & Overview */}
            <div id="overview" className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100/80 transition-all hover:shadow-md/50 duration-300">
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-3">About This Expert</h3>
              {title && <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{title}</h4>}
              {bio ? (
                <p className="text-brand-secondary leading-relaxed whitespace-pre-wrap text-sm md:text-[15px]">
                  {bio}
                </p>
              ) : (
                <p className="text-sm text-slate-400">No bio returned by the API.</p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100/80 transition-all hover:shadow-md/50 duration-300">
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

            {/* Portfolio Links */}
            <div id="portfolio" className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100/80 transition-all hover:shadow-md/50 duration-300">
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Portfolio Links</h3>
              <p className="text-xs text-slate-400 mb-4">View selected work samples, demos, profiles, case studies.</p>
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/30">
                <div className="w-10 h-10 rounded-full bg-blue-50/70 flex items-center justify-center mb-3">
                  <Globe className="w-5 h-5 text-brand-primary/70" />
                </div>
                <h5 className="text-sm font-bold text-slate-700 mb-0.5">No Portfolio Links</h5>
                <p className="text-xs text-slate-400 max-w-sm">
                  This expert hasn't linked external websites or custom case studies yet.
                </p>
              </div>
            </div>

            {/* Completed Projects */}
            <div id="projects" className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100/80 transition-all hover:shadow-md/50 duration-300">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">Completed Projects</h3>
                  <h4 className="text-lg md:text-xl font-bold text-slate-900">Proof of Practical AI Outcomes</h4>
                </div>
              </div>
              
              {displayProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayProjects.map((project: { title: string; description: string; rating: number }, i) => (
                    <div key={i} className="border border-blue-100/30 bg-slate-50/20 hover:bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border-l-4 border-l-brand-primary">
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-blue-50/70 text-brand-primary text-xs font-bold px-2.5 py-1 rounded-lg">AI/ML Project</span>
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {project.rating.toFixed(1)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2 line-clamp-1 hover:text-brand-primary transition-colors">{project.title}</h4>
                      <p className="text-xs text-brand-secondary leading-relaxed line-clamp-2">{project.description}</p>
                    </div>
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
            <div id="reviews" className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100/80 transition-all hover:shadow-md/50 duration-300">
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-6">Client Reviews & Rating Summary</h3>
              
              {/* Rating Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-100 mb-6">
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
                      <span className="text-xs font-bold text-slate-700">Project Success Rate</span>
                      <span className="text-xs font-bold text-brand-primary">{successRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-primary rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(0, Math.min(100, successRate))}%` }} 
                      />
                    </div>
                  </div>
                  <p className="text-xs text-brand-secondary leading-relaxed">
                    The success rate represents the proportion of milestones successfully completed, approved on time, and meeting client quality requirements.
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              {displayReviews.length > 0 ? (
                <div className="space-y-6">
                  {displayReviews.map((review: { reviewerName?: string; rating: number; comment: string }, i: number) => (
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
                        <p className="text-sm text-brand-secondary leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-sm">
                  No reviews submitted yet.
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
    </div>
  );
};
