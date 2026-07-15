import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Zap, Clock, Star, 
  CheckCircle, Github 
} from 'lucide-react';
import { Button } from '../components/ui';
import { useAuthStore } from '@/features/auth/store';
import { UserMenu } from '../components/common';
import { authService } from '@/features/auth/services';
import { profileService } from '@/features/profiles/services';
import { categoryService, type Category } from '../services/categoryService';
import { useAppStore } from '@/app/store';
import { PolicyDialog } from '@/features/auth/components/PolicyDialog';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, setUser } = useAuthStore();
  const theme = useAppStore((state) => state.theme);
  const logoSrc = theme === 'dark' ? '/logo_dark.png' : '/logo.png';

  // Hydrate user data if authenticated but user details are missing
  useEffect(() => {
    const hydrateUser = async () => {
      if (isAuthenticated && !user?.fullName) {
        try {
          const response = await authService.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          } else if (response.statusCode === 401 || response.statusCode === 403) {
            // Clear stale session
            useAuthStore.getState().logout();
          }
        } catch (error) {
          console.error('Failed to hydrate user:', error);
        }
      }
    };
    hydrateUser();
  }, [isAuthenticated, user?.fullName, setUser]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center group shrink-0">
            <div className="relative w-40 h-14 overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img 
                src={logoSrc} 
                alt="AIVORA" 
                className="w-full h-full object-contain scale-[1.8]" 
              />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-5">
            <a href="#top" className="text-[15px] font-medium text-slate-900">Home</a>
            <a href="#explore-experts" className="text-[15px] font-medium text-slate-600 hover:text-brand-blue-dark transition-colors">Explore Experts</a>
            <a href="#post-job" className="text-[15px] font-medium text-slate-600 hover:text-brand-blue-dark transition-colors">Post a Job</a>
            <a href="#about" className="text-[15px] font-medium text-slate-600 hover:text-brand-blue-dark transition-colors">About</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="shadow-aivora bg-brand-blue-dark hover:bg-brand-blue-dark/90">
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const Hero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-14 lg:pt-16 lg:pb-20 overflow-hidden bg-gradient-to-b from-white via-[#f6f9fd] to-white">
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(22,76,150,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(22,76,150,0.06)_1px,transparent_1px)] [background-size:48px_48px] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-blue-light border border-blue-100 text-brand-blue-dark text-[15px] font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              AI expert marketplace
            </div>
            
            <h1 className="text-5xl sm:text-[52px] lg:text-[60px] font-bold text-slate-900 leading-[1.08] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Find the Right <br />
              <span className="text-brand-blue-dark">AI Expert</span> for <br />
              Your Business
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              AIVORA connects clients with qualified AI experts to build chatbots, RAG systems, automation workflows, NLP solutions, and custom AI-powered projects.
            </p>
            
            <div className="flex flex-wrap items-center gap-5 text-lg animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Users className="h-5 w-5 text-brand-blue-dark" />
                <span>1.2K+ experts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Zap className="h-5 w-5 text-brand-blue-dark" />
                <span>95% scoped faster</span>
              </div>
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Clock className="h-5 w-5 text-brand-blue-dark" />
                <span>24h matching</span>
              </div>
            </div>
          </div>
          
          <div className="relative lg:block animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="relative z-10 transition-transform hover:-translate-y-1 duration-500">
              <div className="bg-white rounded-xl p-3 shadow-aivora-large border border-slate-100 overflow-hidden">
                <div className="bg-brand-blue-dark rounded-lg aspect-[4/3] flex items-center justify-center border border-blue-900/10 text-white overflow-hidden relative">
                  <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
                  <div className="relative w-full max-w-sm p-6">
                    <div className="rounded-lg bg-white/10 border border-white/15 p-5 backdrop-blur-sm shadow-2xl">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <p className="text-[13px] font-bold text-blue-100 uppercase tracking-widest">Match Readiness</p>
                          <p className="text-4xl font-black mt-1">94%</p>
                        </div>
                        <div className="size-12 rounded-lg bg-white/10 flex items-center justify-center">
                          <Zap className="h-6 w-6 text-blue-100" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        {['Project brief clarified', 'Expert pool ranked', 'Milestones prepared'].map((item) => (
                          <div key={item} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2">
                            <span className="text-[15px] font-semibold text-blue-50">{item}</span>
                            <CheckCircle className="size-4 text-emerald-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white text-brand-blue-dark p-5 rounded-lg shadow-xl max-w-[200px] hidden sm:block border border-blue-100">
                <p className="text-[15px] font-bold mb-1">AI-Powered Features</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Make project briefs clear and match-ready in minutes.</p>
              </div>
              
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-lg shadow-xl border border-slate-100 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[13px] text-slate-500">Total Matches</p>
                    <p className="text-lg font-bold text-slate-900">482 Expert Fits</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute inset-8 rounded-xl bg-brand-blue-dark/5 -z-10 translate-x-8 translate-y-8" />
          </div>
        </div>
      </div>
    </section>
  );
};

const SectionHeader: React.FC<{
  badge: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}> = ({ badge, title, description, align = 'left' }) => {
  return (
    <div className={`max-w-3xl mb-10 ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <p className="text-brand-blue-dark text-[15px] font-bold tracking-wider uppercase mb-3">{badge}</p>
      <h2 className="text-3xl md:text-[34px] font-bold text-slate-900 mb-4 leading-tight">{title}</h2>
      <p className="text-lg text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
};

const Categories: React.FC = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.success && response.data) {
          setCategories(response.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-14 lg:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          badge="Popular AI Service Areas"
          title="Featured AI Categories"
          description="Browse AI service categories available on AIVORA and find the right expert faster."
        />
        
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {isLoading ? (
               // Loading skeletons
               Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="aspect-square bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
               ))
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <div key={cat.id} className="aspect-square p-6 rounded-lg border border-slate-100 bg-white shadow-sm hover:shadow-aivora hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="w-10 h-10 bg-brand-blue-light text-brand-blue-dark rounded-lg flex items-center justify-center font-bold text-[13px] mb-4">
                    {cat.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5 truncate" title={cat.name}>{cat.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 h-10">
                    {cat.description || 'Explore expert services in this category.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="w-full py-12 text-center text-slate-400 text-[15px] font-medium">
                Unable to load categories. Please try again later.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Process: React.FC = () => {
  const steps = [
    { title: 'Describe Your AI Project', description: 'Enter the idea, expected outcome, budget, and timeline.', number: '01' },
    { title: 'Get AI Assistance', description: 'AIVORA clarifies requirements and generates a better project description.', number: '02' },
    { title: 'Find Suitable Experts', description: 'Qualified experts are recommended based on project needs.', number: '03' },
    { title: 'Start Collaboration', description: 'Discuss details, agree on milestones, and begin the work.', number: '04' },
    { title: 'Complete, Pay, Review', description: 'Release payment and leave feedback after delivery.', number: '05' },
  ];

  return (
    <section className="py-14 lg:py-16 bg-[#f6f9fd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <SectionHeader 
            badge="How AIVORA Works"
            title="A simple path to trusted AI work"
            description="Describe the project, get AI assistance, match with experts, collaborate, then complete with payment and review."
          />
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="group relative p-8 rounded-lg border bg-white text-slate-900 border-slate-100 shadow-sm transition-all duration-300 hover:bg-brand-blue-dark hover:text-white hover:border-brand-blue-dark hover:shadow-xl hover:shadow-blue-900/20 hover:-translate-y-1 hover:z-20 cursor-default"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[15px] mb-12 bg-brand-blue-light text-brand-blue-dark transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">
                {step.number}
              </div>
              <h3 className="text-lg font-bold mb-3 transition-colors duration-300 group-hover:text-white">
                {step.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-blue-100">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

type FeaturedExpert = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  title: string;
  bio: string;
  experienceYears: number;
  rating: number;
  role: string;
};

const Experts: React.FC = () => {
  const [experts, setExperts] = React.useState<FeaturedExpert[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await profileService.getFeaturedExperts(4);
        if (response.success && response.data) {
          const rawItems = response.data;
          
          // Map and normalize fields
          const normalized: FeaturedExpert[] = rawItems.map((item): FeaturedExpert => ({
            userId: item.userId || '',
            fullName: item.fullName || 'Anonymous Expert',
            avatarUrl: item.avatarUrl || null,
            title: item.title || 'AI Expert',
            bio: item.bio || 'Highly skilled AI professional specialized in delivering impactful technology solutions.',
            experienceYears: item.experienceYears ?? 0,
            rating: item.rating ?? 0,
            role: 'EXPERT'
          }));

          // Filter by Expert role just in case
          const expertOnly = normalized.filter(u => 
            u.role.toUpperCase() === 'EXPERT'
          );

          setExperts(expertOnly.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch featured experts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperts();
  }, []);

  return (
    <section className="py-14 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          badge="Featured Experts"
          title="Trusted AI experts ready for project work"
          description="Meet selected AI experts from AIVORA who are ready to support real project work."
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[400px] rounded-lg border border-slate-100 bg-slate-50 animate-pulse" />
            ))
          ) : experts.length > 0 ? (
            experts.map((expert) => (
              <Link to={`/experts/${expert.userId}`} className="block">
                <div key={expert.userId} className="flex flex-col p-6 rounded-lg border border-slate-100 bg-white shadow-sm hover:shadow-aivora-large hover:border-blue-100 transition-all duration-500 hover:-translate-y-1 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-lg bg-brand-blue-dark flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0 shadow-sm border border-blue-900/10">
                      {expert.avatarUrl ? (
                        <img src={expert.avatarUrl} alt={expert.fullName} className="w-full h-full object-cover" />
                      ) : (
                        (expert.fullName || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-slate-900 truncate" title={expert.fullName}>{expert.fullName}</h3>
                      <p className="text-slate-500 text-[11px] font-black uppercase tracking-tighter truncate opacity-70">{expert.title}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[13px] font-bold text-slate-900">{expert.experienceYears}+ years</p>
                    <p className="text-[11px] text-slate-400 uppercase font-black">Exp.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-[13px] font-bold text-slate-900">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{expert.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 uppercase font-black">Rating</p>
                  </div>
                </div>
                
                <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-3 flex-1 overflow-hidden">
                  {expert.bio}
                </p>
              </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
              <Users className="size-12 text-slate-100" />
              <p className="text-slate-400 text-[15px] font-medium">Unable to load featured experts. Please try again later.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Services: React.FC = () => {
  const services = [
    { title: 'Custom AI Chatbot', description: 'Customer support chatbot for websites, apps, and business platforms.', icon: 'CU', color: 'text-brand-blue-dark', bg: 'bg-brand-blue-light' },
    { title: 'RAG Knowledge System', description: 'AI assistant that retrieves answers from company documents and knowledge bases.', icon: 'RA', color: 'text-brand-blue-dark', bg: 'bg-brand-blue-light' },
    { title: 'AI Workflow Automation', description: 'Automate repetitive business tasks with smart AI integrations.', icon: 'AI', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'NLP Text Classifier', description: 'Classify, summarize, extract, and process text for internal operations.', icon: 'NL', color: 'text-sky-600', bg: 'bg-sky-50' },
  ];

  return (
    <section className="py-14 lg:py-16 bg-[#f6f9fd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          badge="Featured AI Services"
          title="Popular project packages"
          description="Use AIVORA to search for concrete AI deliverables, compare expert fit, and move quickly from idea to scoped collaboration."
        />
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <div key={i} className="p-6 rounded-lg bg-white border border-slate-100 shadow-sm hover:shadow-aivora hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 group">
              <div className={`w-10 h-10 ${service.bg} ${service.color} rounded-lg flex items-center justify-center font-bold text-[13px] mb-4 group-hover:scale-110 transition-transform`}>
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TrustUpdates: React.FC = () => {
  return (
    <section className="py-14 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-10 rounded-xl bg-white border border-slate-100 shadow-aivora-large flex flex-col">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-[34px] font-bold text-slate-900 mb-8 leading-tight">Trust, verification, and protected project flow</h2>
              <ul className="space-y-5">
                {[
                  'Reviewed expert profiles before approval',
                  'Skills, ratings, and project history are visible',
                  'Structured milestones and payment protection',
                  'AI reduces unclear requirements before kickoff'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg text-slate-700 font-medium">
                    <CheckCircle className="h-6 w-6 text-emerald-500 fill-emerald-50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="p-10 rounded-xl bg-white border border-slate-100 shadow-aivora-large flex flex-col">
            <h2 className="text-3xl md:text-[34px] font-bold text-slate-900 mb-8 leading-tight">Featured updates</h2>
            <div className="space-y-8 flex-1">
              {[
                { title: 'AIVORA Launches AI Job Assistant', desc: 'Turn rough ideas into structured job descriptions.' },
                { title: 'New Expert Verification Flow Released', desc: 'Profile review helps improve trust for clients.' },
                { title: 'Top AI Service Trends This Month', desc: 'Chatbots, RAG, and automation lead demand.' }
              ].map((update, i) => (
                <div key={i} className="flex gap-6 group cursor-pointer">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-blue-dark transition-colors mb-1">{update.title}</h4>
                    <p className="text-[15px] text-slate-500">{update.desc}</p>
                  </div>
                  <div className="text-brand-blue-dark opacity-0 group-hover:opacity-100 transition-opacity">-&gt;</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FooterCTA: React.FC = () => {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto p-12 md:p-16 rounded-2xl bg-brand-blue-dark text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-blue-200 text-[15px] font-bold tracking-widest uppercase mb-4">Start building with AI experts today</p>
          <h2 className="text-4xl md:text-[42px] font-bold mb-6 leading-tight">From idea to verified expert shortlist.</h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 leading-relaxed">Whether you need an AI solution or want to offer your expertise, AIVORA gives you a clear, trusted way to collaborate.</p>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-14 lg:pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-brand-blue-dark flex items-center justify-center text-white font-bold">A</div>
              <span className="text-xl font-bold text-brand-blue-dark tracking-tight">AIVORA</span>
            </div>
            <p className="text-slate-500 text-[15px] leading-relaxed mb-8 max-w-xs">
              AI expert marketplace for chatbots, RAG systems, NLP, automation, and AI integration.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/SWP-Aivora"
                target="_blank"
                rel="noreferrer"
                aria-label="AIVORA GitHub"
                className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-blue-dark hover:bg-brand-blue-light transition-all"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg text-slate-900 font-bold mb-6">
              <a href="#top" className="hover:text-brand-blue-dark transition-colors">Platform</a>
            </h4>
            <ul className="space-y-4">
              <li><a href="#top" className="text-slate-500 text-[15px] hover:text-brand-blue-dark transition-colors">Home</a></li>
              <li><a href="#explore-experts" className="text-slate-500 text-[15px] hover:text-brand-blue-dark transition-colors">Explore Experts</a></li>
              <li><a href="#post-job" className="text-slate-500 text-[15px] hover:text-brand-blue-dark transition-colors">Post a Job</a></li>
              <li><a href="#about" className="text-slate-500 text-[15px] hover:text-brand-blue-dark transition-colors">About</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-slate-900 font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              <li>
                <PolicyDialog type="terms">
                  <button type="button" className="text-left text-slate-500 text-[15px] hover:text-brand-blue-dark transition-colors">
                    Terms of Service
                  </button>
                </PolicyDialog>
              </li>
              <li>
                <PolicyDialog type="privacy">
                  <button type="button" className="text-left text-slate-500 text-[15px] hover:text-brand-blue-dark transition-colors">
                    Privacy Policy
                  </button>
                </PolicyDialog>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-[15px]">© 2026 AIVORA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-slate-400 text-[15px] hover:text-brand-blue-dark transition-colors">English (US)</Link>
            <Link to="#" className="text-slate-400 text-[15px] hover:text-brand-blue-dark transition-colors">Currency: Aivora Coin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-14 lg:py-16 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative animate-in fade-in slide-in-from-left duration-1000">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-50 aspect-video flex items-center justify-center p-12">
               <div className="text-center">
                  <div className="size-20 bg-brand-blue-light rounded-lg flex items-center justify-center mx-auto mb-6 text-brand-blue-dark">
                     <Users className="size-10" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">AIVORA Platform</p>
                  <p className="text-slate-500 font-medium mt-2 uppercase tracking-widest text-[13px]">The Future of AI Collaboration</p>
               </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-blue-dark/70" />
          </div>

          <div>
            <SectionHeader 
              badge="Our Identity"
              title="The AI Expert Marketplace for Business Solutions"
              description="AIVORA is built to bridge the gap between complex business needs and qualified AI technical expertise. We provide the tools, protection, and matching logic to ensure projects succeed."
            />
            
            <div className="space-y-6">
              {[
                { title: 'Trusted Network', desc: 'Every expert on AIVORA undergoes a verification process to ensure technical capability.' },
                { title: 'Scoped Success', desc: 'Our AI-assisted job builder helps turn vague ideas into structured, executable project descriptions.' },
                { title: 'Staged Milestone Payments', desc: 'Payments are split into two installments - 30% upfront when work begins, 70% after delivery approval.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="size-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="size-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-[15px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * AIVORA Landing Page
 * 
 * Public-facing entry point for the platform.
 */
export const LandingPage: React.FC = () => {
  return (
    <div id="top" className="landing-page min-h-screen bg-white selection:bg-primary/10 selection:text-primary scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        
        <div id="explore-experts">
           <Categories />
           <Experts />
           <Services />
        </div>

        <div id="post-job">
           <Process />
        </div>

        <div id="about">
           <AboutSection />
           <TrustUpdates />
        </div>

        <FooterCTA />
      </main>
      <Footer />
    </div>
  );
};
