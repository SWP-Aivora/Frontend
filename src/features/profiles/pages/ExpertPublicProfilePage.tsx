import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Star, MapPin, ShieldCheck, 
  Briefcase, Github, Linkedin, Video, FileText, ChevronRight
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { profileService } from '../services';
import { reviewService } from '@/features/reviews/services';
import { projectService } from '@/features/projects/services';
import { chatService } from '@/features/chat/services';
import { ProjectStatus } from '@/shared/types/enums';

export const ExpertPublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Use the ID from params, fallback to a dummy ID if undefined
  const expertId = id || 'dummy-id';

  // 1. Fetch Expert Profile
  const { data: profileResponse, isLoading: isProfileLoading } = useQuery({
    queryKey: ['expertProfile', expertId],
    queryFn: () => profileService.getExpertProfileById(expertId),
    enabled: !!expertId,
  });
  const profile = profileResponse?.data;

  // 2. Fetch Expert Reviews (using user.id)
  const { data: reviewsResponse, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['expertReviews', profile?.user?.id],
    queryFn: () => reviewService.getUserReviews(profile!.user.id),
    enabled: !!profile?.user?.id,
  });
  const reviews = reviewsResponse?.items || [];
  
  // Calculate average rating from reviews
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // 3. Fetch Expert Projects
  const { data: projectsResponse, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['expertProjects'],
    queryFn: () => projectService.getProjects(),
  });
  // Filter for this expert's completed projects
  const completedProjects = (projectsResponse?.data || []).filter(
    p => p.expertId === expertId && p.status === ProjectStatus.COMPLETED
  );

  const mappedProjects = completedProjects.map(p => ({
    title: p.title,
    description: p.description || '',
    rating: 5.0
  }));

  // 4. Initialize Chat Mutation
  const initChatMutation = useMutation({
    mutationFn: () => chatService.initializeConversation({ expertId }),
    onSuccess: (response) => {
      const convData = response.data as Record<string, unknown>;
      const conversationId = convData?.id || (response as Record<string, unknown>)?.id;
      if (conversationId) {
        navigate(`/client/messages?conversationId=${conversationId}`);
      } else {
        navigate('/client/messages');
      }
    },
    onError: () => {
      toast.error('Failed to initiate conversation. Please try again.');
    }
  });

  const isLoading = isProfileLoading || isReviewsLoading || isProjectsLoading;

  // Since we might not have a fully populated profile from the API for testing, 
  // we'll use a mix of real data and mock data for the rich UI representation
  const mockData = {
    name: profile?.user?.fullName || 'An Nguyen',
    title: profile?.title || 'AI Chatbot Expert',
    bio: profile?.bio || 'Helping businesses build intelligent chatbots and AI-powered customer support systems.',
    location: 'VN',
    preference: 'Remote collaboration',
    hourlyRate: profile?.hourlyRate || 25,
    stats: {
      rating: parseFloat(avgRating) || 4.8,
      projects: completedProjects.length || 18,
      reviews: reviews.length || 24,
      onTime: 95
    },
    about: 'An Nguyen builds customer support chatbots, NLP conversation flows, RAG assistants, and practical automation tools that improve response time, reduce manual support work, and create better client experiences.',
    skills: [
      { name: 'Chatbot Development', level: 'Advanced', years: 3, progress: 88 },
      { name: 'NLP', level: 'Intermediate', years: 2, progress: 60 },
      { name: 'RAG Systems', level: 'Advanced', years: 2, progress: 80 },
      { name: 'Prompt Engineering', level: 'Expert', years: 4, progress: 95 },
      { name: 'Python', level: 'Advanced', years: 4, progress: 92 },
      { name: 'AI Automation', level: 'Advanced', years: 3, progress: 85 },
    ]
  };

  const displayReviews = reviews.length > 0 ? reviews : [
    { reviewerName: 'Linh Tran', rating: 5.0, comment: 'Delivered a chatbot that matched requirements.' },
    { reviewerName: 'Minh Pham', rating: 4.8, comment: 'Completed on time with clear communication.' }
  ];

  const displayProjects = mappedProjects.length > 0 ? mappedProjects : [
    { title: 'Vietnamese Support Chatbot', description: 'Reduced repetitive product questions.', rating: 5.0 },
    { title: 'Internal RAG Assistant', description: 'Retrieved answers from company documents.', rating: 4.9 }
  ];

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
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-[#edf6ff] rounded-[30px] p-8 shadow-sm border border-blue-100/50 relative overflow-hidden">
          {/* Header decorative orb */}
          <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-blue-200/40 blur-[40px] rounded-full" />
          
          <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
            {/* Left Info */}
            <div className="flex gap-6 items-start">
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 bg-brand-primary flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{mockData.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
                    Available for Projects
                  </span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Expert
                  </span>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{mockData.name}</h1>
                  <h2 className="text-lg font-semibold text-brand-primary mt-1">{mockData.title}</h2>
                </div>
                
                <p className="text-slate-600 max-w-lg">{mockData.bio}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 font-medium pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-primary" /> {mockData.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-400" /> {mockData.preference}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Stats & CTA */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 shrink-0">
              {/* Stats row */}
              <div className="flex gap-3">
                <div className="bg-white/80 border border-blue-100 rounded-2xl p-4 w-[110px] text-center shadow-sm relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-1/2 bg-brand-primary rounded-l" />
                  <div className="text-2xl font-bold text-slate-900">{mockData.stats.rating}/5</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Rating</div>
                </div>
                <div className="bg-white/80 border border-blue-100 rounded-2xl p-4 w-[110px] text-center shadow-sm relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-1/2 bg-brand-primary rounded-l" />
                  <div className="text-2xl font-bold text-slate-900">{mockData.stats.projects}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Projects</div>
                </div>
                <div className="bg-white/80 border border-blue-100 rounded-2xl p-4 w-[110px] text-center shadow-sm relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-1/2 bg-brand-primary rounded-l" />
                  <div className="text-2xl font-bold text-slate-900">{mockData.stats.reviews}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Reviews</div>
                </div>
              </div>
              
              {/* CTA Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 w-[180px] flex flex-col items-center justify-center shrink-0">
                <div className="text-xs font-medium text-slate-500">Hourly rate</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">${mockData.hourlyRate}/hr</div>
                <Button className="w-full mt-4 rounded-full font-semibold shadow-md shadow-brand-primary/20">
                  Invite to Project
                </Button>
                <Button variant="outline" className="w-full mt-2 rounded-full font-semibold border-blue-200 text-brand-primary hover:bg-blue-50">
                  Save Expert
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-sm border border-blue-50 flex items-center gap-2">
          <button className="px-6 py-2 bg-brand-primary text-white text-sm font-bold rounded-full transition-all">Overview</button>
          <button className="px-6 py-2 text-slate-500 hover:bg-slate-100 text-sm font-semibold rounded-full transition-all">Portfolio</button>
          <button className="px-6 py-2 text-slate-500 hover:bg-slate-100 text-sm font-semibold rounded-full transition-all">Reviews</button>
          <button className="px-6 py-2 text-slate-500 hover:bg-slate-100 text-sm font-semibold rounded-full transition-all">Projects</button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-3">About This Expert</h3>
              <h4 className="text-xl font-bold text-slate-900 mb-4">{mockData.title} for Business Automation</h4>
              <p className="text-slate-600 leading-relaxed text-sm">
                {mockData.about}
              </p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Skills and Expertise</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {mockData.skills.map((skill) => (
                  <span key={skill.name} className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-xs font-semibold">
                    {skill.name}
                  </span>
                ))}
              </div>
              
              <div className="space-y-5">
                {mockData.skills.slice(0, 2).map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-800">{skill.name}</span>
                      <span className="text-xs font-medium text-slate-500">{skill.level} &middot; {skill.years}y</span>
                    </div>
                    <div className="h-2 w-full bg-blue-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-primary rounded-full" 
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Projects */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Completed Projects</h3>
                  <p className="text-xs text-slate-400 mt-1">Proof of delivery and practical AI outcomes.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayProjects.map((project: { title: string; description: string; rating: number }, i) => (
                  <div key={i} className="border border-blue-50 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-blue-50 text-brand-primary text-xs font-semibold px-3 py-1 rounded-full">AI/ML</span>
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {project.rating || 5.0}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2 line-clamp-1">{project.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* CTA Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10" />
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Ready to Collaborate</h3>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Invite {mockData.name.split(' ')[0]} to your project</h4>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Select an existing project or start a conversation about requirements, timeline, and budget.
              </p>
              <div className="space-y-3">
                <Button className="w-full rounded-full shadow-md shadow-brand-primary/20">Invite to Project</Button>
                <Button 
                  variant="outline" 
                  className="w-full rounded-full border-blue-200 text-brand-primary"
                  onClick={() => initChatMutation.mutate()}
                  disabled={initChatMutation.isPending}
                >
                  {initChatMutation.isPending ? 'Connecting...' : 'Send Message'}
                </Button>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-emerald-50 rounded-3xl p-6 shadow-sm border border-emerald-100/50">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-800">Verified by AIVORA</h3>
              </div>
              <p className="text-xs text-emerald-700/80 leading-relaxed">
                Profile, skills, and professional information reviewed by the AIVORA admin team.
              </p>
            </div>

            {/* Rating Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Rating Summary</h3>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold text-slate-900">{mockData.stats.rating}</span>
                <span className="text-xs font-medium text-slate-500 mb-1.5">/ 5.0 from {mockData.stats.reviews} reviews</span>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-700">On-time</span>
                  <span className="text-xs font-medium text-slate-500">{mockData.stats.onTime}%</span>
                </div>
                <div className="h-2 w-full bg-blue-50 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full w-[95%]" />
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">Client Reviews</h3>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-4">
                {displayReviews.map((review: { reviewerName?: string; rating: number; comment: string; initial?: string; name?: string }, i) => (
                  <div key={i} className={i > 0 ? "pt-4 border-t border-slate-50" : ""}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {review.reviewerName ? review.reviewerName.split(' ').map((n: string) => n[0]).join('') : 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{review.reviewerName || 'Anonymous User'}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-primary flex items-center gap-1">
                        <Star className="w-3 h-3 fill-brand-primary text-brand-primary" /> {review.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 ml-10">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Links */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Portfolio Links</h3>
              <p className="text-xs text-slate-500 mb-4">View selected work samples, demos, profiles, case studies.</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-50 text-brand-primary border border-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-blue-100">
                  <Github className="w-3 h-3" /> GitHub Profile
                </span>
                <span className="bg-blue-50 text-brand-primary border border-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-blue-100">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </span>
                <span className="bg-white text-brand-primary border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-blue-50">
                  <Video className="w-3 h-3" /> Demo Video
                </span>
                <span className="bg-white text-brand-primary border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-blue-50">
                  <FileText className="w-3 h-3" /> Case Study
                </span>
              </div>
            </div>

            {/* Work Preferences */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Work Preferences</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Preferred Projects</h4>
                  <p className="text-xs font-medium text-slate-700 mt-1">Chatbot, RAG, NLP, Automation</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Budget Preference</h4>
                  <p className="text-xs font-medium text-slate-700 mt-1">Fixed-price or hourly projects</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Response Time</h4>
                  <p className="text-xs font-medium text-slate-700 mt-1">Usually replies within 24 hours</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
