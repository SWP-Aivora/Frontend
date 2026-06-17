import { LoginForm } from '@/features/auth/components/LoginForm';
import { Link } from 'react-router-dom';

const ASSETS = {
  logoCircle: "/logo.png",
};

export const LoginPage = () => {
  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center lg:p-12 font-sans selection:bg-primary/10">
      {/* Background Ornaments */}
      <div className="absolute left-[-10%] top-0 w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[60%] h-[60%] bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -left-12 -top-12 size-64 border-[32px] border-primary/5 rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="container relative z-10 w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-stretch">
        
        {/* Left Panel: Branding & Workspace */}
        <div className="hidden lg:flex flex-col bg-gradient-to-br from-brand-blue-light/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-panel p-12 shadow-2xl relative overflow-hidden animate-slide-in-left">
          <div className="absolute -left-20 top-20 w-[400px] h-[400px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center mb-16 opacity-0 animate-fade-in [animation-delay:200ms] w-fit group">
            <div className="relative w-48 h-16 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
              <img 
                src={ASSETS.logoCircle} 
                alt="AIVORA" 
                className="w-full h-full object-contain scale-[1.8]" 
              />
            </div>
          </Link>

          {/* Badge */}
          <div className="inline-flex items-center bg-white/60 backdrop-blur-md border border-primary/10 rounded-full px-4 py-1.5 mb-8 w-fit opacity-0 animate-fade-in [animation-delay:400ms]">
            <span className="text-xs font-semibold text-primary">Secure access for AI workspaces</span>
          </div>

          {/* Content */}
          <div className="space-y-6 mb-12 opacity-0 animate-fade-in [animation-delay:600ms]">
            <h1 className="text-5xl font-black text-foreground leading-tight tracking-tight">
              Access your AIVORA <br />
              <span className="text-primary">workspace</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Manage AI projects, expert applications, messages, milestones, and platform activity from one secure account.
            </p>
          </div>

          {/* Tilted Dashboard Preview */}
          <div className="relative mt-auto h-[320px] flex items-center justify-center opacity-0 animate-slide-up [animation-delay:800ms]">
             <div className="absolute inset-0 bg-primary/5 rounded-xl -rotate-2 scale-105 blur-2xl" />
             <div className="relative bg-white border border-border/60 rounded-xl shadow-2xl w-[460px] p-6 overflow-hidden animate-float">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold">Role Redirects</span>
                  <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">POST /auth/login</span>
                </div>
                
                {/* Visual Elements */}
                <div className="h-2 w-full bg-slate-100 rounded-full mb-8 relative overflow-hidden">
                   <div className="absolute inset-y-0 left-0 w-3/4 bg-primary rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   {[
                     { label: 'Client Dashboard', color: 'bg-primary' },
                     { label: 'Admin Dashboard', color: 'bg-brand-success' },
                     { label: 'Expert Dashboard', color: 'bg-brand-accent' },
                   ].map((card, i) => (
                     <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className={`size-3 rounded-full ${card.color} animate-pulse`} />
                        <span className="text-xs font-semibold text-slate-700">{card.label}</span>
                     </div>
                   ))}
                </div>

                {/* Mini Bars Chart */}
                <div className="flex items-end gap-2 h-16 pt-4 border-t border-slate-100">
                   {[20, 45, 60, 85, 100, 35, 55].map((h, i) => (
                     <div 
                        key={i} 
                        className={`flex-1 rounded-t-sm transition-all duration-1000 ${i === 4 ? 'bg-primary shadow-[0_0_12px_rgba(37,99,235,0.3)]' : 'bg-primary/20'}`} 
                        style={{ height: `${h}%` }} 
                     />
                   ))}
                </div>
             </div>
          </div>

          {/* Workspace Tags */}
          <div className="grid grid-cols-3 gap-4 mt-12 opacity-0 animate-fade-in [animation-delay:1000ms]">
            {[
              { label: 'Client', color: 'bg-primary/10 text-primary', desc: 'Wallet & projects.' },
              { label: 'Expert', color: 'bg-brand-accent/10 text-brand-accent', desc: 'Jobs & earnings.' },
              { label: 'Admin', color: 'bg-brand-success/10 text-brand-success', desc: 'Users & reports.' },
            ].map((tag, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tag.color} mb-2 inline-block`}>
                  {tag.label}
                </span>
                <p className="text-xs text-muted-foreground leading-tight">{tag.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Form Card */}
        <div className="flex flex-col justify-center items-center py-12 lg:py-0">
          <div className="w-full max-w-[580px] bg-white lg:rounded-xl p-8 sm:p-12 shadow-2xl border border-slate-100 relative opacity-0 animate-slide-up [animation-delay:300ms]">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-bold text-primary tracking-widest uppercase">Login Page — AIVORA</p>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Welcome Back to AIVORA</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Log in to continue managing your AI projects, expert applications, messages, milestones, and platform activities.
                </p>
              </div>

              <div className="h-px w-full bg-slate-100" />
              
              <LoginForm />
              
              <div className="h-px w-full bg-slate-100" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 {[
                   { label: 'Client', role: 'Client Dashboard', color: 'bg-primary' },
                   { label: 'Expert', role: 'Expert Dashboard', color: 'bg-brand-accent' },
                   { label: 'Admin', role: 'Admin Dashboard', color: 'bg-brand-success' },
                 ].map((pill, i) => (
                   <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className={`size-2 rounded-full ${pill.color}`} />
                      <span className="text-xs font-bold text-slate-600 truncate">{pill.label} → {pill.role}</span>
                   </div>
                 ))}
              </div>

              <div className="flex justify-center pt-2">
                <p className="text-sm text-muted-foreground font-medium">
                  Do not have an account?{' '}
                  <Link to="/register" className="text-primary font-bold hover:underline transition-all underline-offset-4">
                    Create an Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-xs text-muted-foreground/60 font-medium lg:hidden animate-fade-in">
             Secure authentication protects your login information.
          </p>
        </div>
      </div>
    </div>
  );
};
