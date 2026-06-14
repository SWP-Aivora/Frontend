import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Users, Zap, Clock, Star, 
  CheckCircle, Twitter, Github, Linkedin 
} from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '@/features/auth/store';
import { UserMenu } from '../components/common';
import { authService } from '@/features/auth/services';
import { profileService } from '@/features/profiles/services';
import { categoryService, type Category } from '../services/categoryService';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, setUser } = useAuthStore();

  // Hydrate user data if authenticated but user details are missing
  useEffect(() => {
    const hydrateUser = async () => {
      if (isAuthenticated && !user?.fullName) {
        try {
          const response = await authService.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch {
          // Silent fail on landing page to avoid distracting errors
        }
      }
    };
    hydrateUser();
  }, [isAuthenticated, user?.fullName, setUser]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center group shrink-0">
            <div className="relative w-40 h-14 overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img 
                src="/logo.png" 
                alt="AIVORA" 
                className="w-full h-full object-contain scale-[1.8]" 
              />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#top" className="text-sm font-medium text-slate-900">Home</a>
            <a href="#explore-experts" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Explore Experts</a>
            <a href="#post-job" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Post a Job</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">About</a>
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
              <Button size="sm" asChild className="shadow-aivora">
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
    <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-[#F3F6FA]">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              AI expert marketplace
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Find the Right <br />
              <span className="text-primary">AI Expert</span> for <br />
              Your Business
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              AIVORA connects clients with qualified AI experts to build chatbots, RAG systems, automation workflows, NLP solutions, and custom AI-powered projects.
            </p>
            
            <div className="relative max-w-lg mb-10 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <Input 
                className="pl-12 pr-36 h-16 rounded-full border-slate-200 bg-white shadow-aivora focus:ring-primary/20 transition-all text-base"
                placeholder="Search for AI experts, services, or skills..."
              />
              <div className="absolute inset-y-2 right-2 flex items-center">
                <Button size="default" className="h-12 px-8 rounded-full shadow-lg">
                  Find Expert
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Users className="h-5 w-5 text-primary" />
                <span>1.2K+ experts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Zap className="h-5 w-5 text-primary" />
                <span>95% scoped faster</span>
              </div>
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Clock className="h-5 w-5 text-primary" />
                <span>24h matching</span>
              </div>
            </div>
          </div>
          
          <div className="relative lg:block animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="relative z-10 rotate-3 transition-transform hover:rotate-0 duration-700">
              <div className="bg-white rounded-xl p-4 shadow-aivora-large border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 rounded-xl aspect-[4/3] flex items-center justify-center border border-slate-100/50">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">AI Projects Need Qualified Experts.</h3>
                    <p className="text-slate-500 text-sm max-w-[240px] mx-auto">Make project briefs clear, searchable, and match-ready in minutes.</p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements to mimic the Figma design */}
              <div className="absolute -top-6 -right-6 bg-primary text-white p-6 rounded-xl shadow-xl max-w-[200px] hidden sm:block">
                <p className="text-sm font-bold mb-1">AI-Powered Features</p>
                <p className="text-xs text-blue-100 leading-relaxed">Make project briefs clear and match-ready in minutes.</p>
              </div>
              
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-xl shadow-xl border border-slate-100 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Matches</p>
                    <p className="text-lg font-bold text-slate-900">482 Expert Fits</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background glowing rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary/10 rounded-full -z-10 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-primary/5 rounded-full -z-10" />
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
    <div className={`max-w-3xl mb-12 ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <p className="text-primary text-sm font-bold tracking-wider uppercase mb-3">{badge}</p>
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
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
          setCategories(response.data.slice(0, 7));
        }
      } catch {
        // Silent fail to keep landing page clean
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-16 lg:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          badge="Popular AI Service Areas"
          title="Featured AI Categories"
          description="Browse AI service categories available on AIVORA and find the right expert faster."
        />
        
        <div className="relative">
          <div className="flex flex-nowrap gap-6 overflow-x-auto pb-8 custom-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
            {isLoading ? (
               // Loading skeletons
               Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="shrink-0 w-[260px] h-[160px] bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
               ))
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <div key={cat.id} className="shrink-0 w-[260px] p-6 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-aivora transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-bold text-xs mb-4">
                    {cat.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5 truncate" title={cat.name}>{cat.name}</h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 h-8">
                    {cat.description || 'Explore expert services in this category.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="w-full py-12 text-center text-slate-400 text-sm italic">
                No categories available yet.
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
    <section className="py-16 lg:py-20 bg-slate-50">
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
              className="group relative p-8 rounded-xl border bg-white text-slate-900 border-slate-100 shadow-sm transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-xl hover:shadow-primary/20 hover:scale-105 hover:z-20 cursor-default"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-12 bg-blue-50 text-primary transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">
                {step.number}
              </div>
              <h3 className="text-lg font-bold mb-3 transition-colors duration-300 group-hover:text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-blue-100">
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
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperts();
  }, []);

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          badge="Featured Experts"
          title="Trusted AI experts ready for project work"
          description="Meet selected AI experts from AIVORA who are ready to support real project work."
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[400px] rounded-[2rem] border border-slate-100 bg-slate-50 animate-pulse" />
            ))
          ) : experts.length > 0 ? (
            experts.map((expert) => (
              <div key={expert.userId} className="flex flex-col p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-aivora-large transition-all duration-500 hover:-translate-y-2 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0 shadow-sm border border-slate-200">
                      {expert.avatarUrl ? (
                        <img src={expert.avatarUrl} alt={expert.fullName} className="w-full h-full object-cover" />
                      ) : (
                        (expert.fullName || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-slate-900 truncate" title={expert.fullName}>{expert.fullName}</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter truncate opacity-70">{expert.title}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{expert.experienceYears}+ years</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Exp.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{expert.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Rating</p>
                  </div>
                </div>
                
                <p className="text-slate-500 text-xs mb-6 leading-relaxed line-clamp-3 flex-1 overflow-hidden">
                  {expert.bio}
                </p>
                
                <Link 
                  to={expert.userId ? `/experts/${expert.userId}` : '#'} 
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest text-center hover:bg-slate-50 transition-colors mt-auto shadow-sm"
                >
                  View Profile
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
              <Users className="size-12 text-slate-100" />
              <p className="text-slate-400 text-sm font-bold italic">No featured experts available yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Services: React.FC = () => {
  const services = [
    { title: 'Custom AI Chatbot', description: 'Customer support chatbot for websites, apps, and business platforms.', icon: 'CU', color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'RAG Knowledge System', description: 'AI assistant that retrieves answers from company documents and knowledge bases.', icon: 'RA', color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'AI Workflow Automation', description: 'Automate repetitive business tasks with smart AI integrations.', icon: 'AI', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'NLP Text Classifier', description: 'Classify, summarize, extract, and process text for internal operations.', icon: 'NL', color: 'text-sky-600', bg: 'bg-sky-50' },
  ];

  return (
    <section className="py-16 lg:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          badge="Featured AI Services"
          title="Popular project packages"
          description="Use AIVORA to search for concrete AI deliverables, compare expert fit, and move quickly from idea to scoped collaboration."
        />
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <div key={i} className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-aivora transition-all group">
              <div className={`w-10 h-10 ${service.bg} ${service.color} rounded-xl flex items-center justify-center font-bold text-xs mb-4 group-hover:scale-110 transition-transform`}>
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{service.description}</p>
              <Link to="/explore" className="text-xs font-bold text-primary hover:underline">Explore package →</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TrustUpdates: React.FC = () => {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-white to-blue-50 border border-slate-100 shadow-aivora-large relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Trust, verification, and protected project flow</h2>
              <ul className="space-y-5">
                {[
                  'Reviewed expert profiles before approval',
                  'Skills, ratings, and project history are visible',
                  'Structured milestones and payment protection',
                  'AI reduces unclear requirements before kickoff'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-700 font-medium">
                    <CheckCircle className="h-6 w-6 text-emerald-500 fill-emerald-50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-aivora-large flex flex-col">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Featured updates</h2>
            <div className="space-y-8 flex-1">
              {[
                { title: 'AIVORA Launches AI Job Assistant', desc: 'Turn rough ideas into structured job descriptions.' },
                { title: 'New Expert Verification Flow Released', desc: 'Profile review helps improve trust for clients.' },
                { title: 'Top AI Service Trends This Month', desc: 'Chatbots, RAG, and automation lead demand.' }
              ].map((update, i) => (
                <div key={i} className="flex gap-6 group cursor-pointer">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors mb-1">{update.title}</h4>
                    <p className="text-sm text-slate-500">{update.desc}</p>
                  </div>
                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</div>
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
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto p-12 md:p-16 rounded-[3rem] bg-gradient-to-r from-brand-blue-dark to-primary text-white relative overflow-hidden shadow-2xl shadow-primary/30">
        <div className="relative z-10 max-w-2xl">
          <p className="text-blue-200 text-sm font-bold tracking-widest uppercase mb-4">Start building with AI experts today</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">From idea to verified expert shortlist.</h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">Whether you need an AI solution or want to offer your expertise, AIVORA gives you a clear, trusted way to collaborate.</p>
          <div className="flex-wrap flex gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-blue-50 border-none px-10 rounded-full font-bold">
              Sign Up as Client
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-10 rounded-full font-bold">
              Explore Experts
            </Button>
          </div>
        </div>
        
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4" />
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-16 lg:pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">A</div>
              <span className="text-xl font-bold text-brand-blue-dark tracking-tight">AIVORA</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-xs">
              AI expert marketplace for chatbots, RAG systems, NLP, automation, and AI integration.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-all"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-all"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-all"><Github className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-slate-900 font-bold mb-6">Platform</h4>
            <ul className="space-y-4">
              {['Home', 'Explore Experts', 'Post a Job', 'Success Stories', 'Pricing'].map(item => (
                <li key={item}><Link to="#" className="text-slate-500 text-sm hover:text-primary transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-slate-900 font-bold mb-6">Expertise</h4>
            <ul className="space-y-4">
              {['Chatbot Dev', 'RAG Systems', 'NLP Solutions', 'AI Automation', 'AI Integration'].map(item => (
                <li key={item}><Link to="#" className="text-slate-500 text-sm hover:text-primary transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-slate-900 font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'How it Works', 'Help Center', 'Terms of Service', 'Privacy Policy'].map(item => (
                <li key={item}><Link to="#" className="text-slate-500 text-sm hover:text-primary transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© 2026 AIVORA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-slate-400 text-sm hover:text-primary transition-colors">English (US)</Link>
            <Link to="#" className="text-slate-400 text-sm hover:text-primary transition-colors">Currency: USD</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 lg:py-20 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative animate-in fade-in slide-in-from-left duration-1000">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-50 aspect-video flex items-center justify-center p-12">
               <div className="text-center">
                  <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                     <Users className="size-10" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">AIVORA Platform</p>
                  <p className="text-slate-500 font-medium mt-2 uppercase tracking-widest text-xs">The Future of AI Collaboration</p>
               </div>
            </div>
            {/* Decorative blobs */}
            <div className="absolute -top-10 -left-10 size-40 bg-blue-100/50 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -right-10 size-40 bg-primary/10 rounded-full blur-3xl -z-10" />
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
                { title: 'Escrow Protection', desc: 'Payments are held securely and only released when milestones are successfully delivered.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="size-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="size-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
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
    <div id="top" className="min-h-screen bg-white selection:bg-primary/10 selection:text-primary scroll-smooth">
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
