import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Link } from 'react-router-dom';

const ASSETS = {
  bgBlueWashLeft: "https://www.figma.com/api/mcp/asset/4d3b9620-0684-4a2a-8b55-c0c33cbd1a02",
  bgBlueWashRight: "https://www.figma.com/api/mcp/asset/4d4eb8b4-c6c0-4e45-909c-c6ac9a166033",
  bgRing1: "https://www.figma.com/api/mcp/asset/5f40beac-ced7-41ae-9a3c-7cec2a18b70a",
  bgRing2: "https://www.figma.com/api/mcp/asset/246e4886-f689-4fbb-b40b-ee579ccc9944",
  logoCircle: "https://www.figma.com/api/mcp/asset/7d5ca9a5-19fa-4c3f-816b-14a9c0a0f910",
  leftPanelGlow: "https://www.figma.com/api/mcp/asset/53e63aa3-a7f4-4ec6-b47f-c92f22773cc5",
};

export const RegisterPage = () => {
  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center lg:p-12 font-sans selection:bg-primary/10">
      {/* Background Ornaments */}
      <img src={ASSETS.bgBlueWashLeft} alt="" className="absolute left-[-10%] top-0 w-[60%] opacity-40 pointer-events-none" />
      <img src={ASSETS.bgBlueWashRight} alt="" className="absolute right-[-10%] bottom-[-10%] w-[60%] opacity-40 pointer-events-none" />
      <img src={ASSETS.bgRing1} alt="" className="absolute -left-12 -top-12 w-64 opacity-20 pointer-events-none" />
      <img src={ASSETS.bgRing2} alt="" className="absolute -left-20 -top-20 w-80 opacity-10 pointer-events-none" />

      {/* Main Container */}
      <div className="container relative z-10 w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-stretch">
        
        {/* Left Panel: Branding & Benefit Cards */}
        <div className="hidden lg:flex flex-col bg-gradient-to-br from-brand-blue-light/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-panel p-12 shadow-2xl relative overflow-hidden animate-slide-in-left">
          <img src={ASSETS.leftPanelGlow} alt="" className="absolute -left-20 top-20 w-[400px] opacity-30 pointer-events-none" />
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-16 opacity-0 animate-fade-in [animation-delay:200ms]">
            <div className="relative size-10">
              <img src={ASSETS.logoCircle} alt="AIVORA" className="size-full" />
              <span className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-blue-dark">AIVORA</span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center bg-white/60 backdrop-blur-md border border-primary/10 rounded-full px-4 py-1.5 mb-8 w-fit opacity-0 animate-fade-in [animation-delay:400ms]">
            <span className="text-xs font-semibold text-primary">Secure AI marketplace registration</span>
          </div>

          {/* Content */}
          <div className="space-y-6 mb-12 opacity-0 animate-fade-in [animation-delay:600ms]">
            <h1 className="text-5xl font-black text-foreground leading-tight tracking-tight">
              Start your AI journey <br />
              with <span className="text-primary">AIVORA</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed font-medium">
              Whether you need an AI solution or want to offer your expertise, AIVORA helps you connect, collaborate, and complete projects with confidence.
            </p>
          </div>

          {/* Tilted Account Preview */}
          <div className="relative mt-auto h-[320px] flex items-center justify-center opacity-0 animate-slide-up [animation-delay:800ms]">
             <div className="absolute inset-0 bg-primary/5 rounded-3xl -rotate-2 scale-105 blur-2xl" />
             <div className="relative bg-white border border-border/60 rounded-[24px] shadow-2xl w-[460px] p-8 overflow-hidden animate-float">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold">Account Setup</span>
                  <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">POST /auth/register</span>
                </div>
                
                {/* Visual Elements */}
                <div className="h-2 w-full bg-slate-100 rounded-full mb-8 relative overflow-hidden">
                   <div className="absolute inset-y-0 left-0 w-2/3 bg-primary rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   {[
                     { label: 'Full name', active: true },
                     { label: 'Email address', active: true },
                     { label: 'Password', active: false },
                     { label: 'Role: CLIENT', active: true, primary: true },
                   ].map((field, i) => (
                     <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${field.active ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 opacity-60'}`}>
                        <div className={`size-2 rounded-full ${field.primary ? 'bg-primary' : 'bg-slate-300'}`} />
                        <span className={`text-[11px] font-bold ${field.primary ? 'text-primary' : 'text-slate-500'}`}>{field.label}</span>
                     </div>
                   ))}
                </div>

                <div className="w-40 h-10 bg-primary rounded-full flex items-center justify-center">
                   <span className="text-[13px] font-bold text-white">Create Account</span>
                </div>
             </div>
          </div>

          {/* Benefit Cards */}
          <div className="grid grid-cols-2 gap-6 mt-12 opacity-0 animate-fade-in [animation-delay:1000ms]">
            {[
              { label: 'Client', color: 'bg-primary/10 text-primary', desc: 'Post projects, find experts, and manage milestones.' },
              { label: 'Expert', color: 'bg-brand-accent/10 text-brand-accent', desc: 'Offer AI services, apply for work, and grow reputation.' },
            ].map((card, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${card.color} mb-3 inline-block`}>
                  {card.label}
                </span>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
          
          <p className="mt-8 text-[13px] text-muted-foreground font-medium opacity-0 animate-fade-in [animation-delay:1200ms]">
             Secure authentication helps keep your account information protected.
          </p>
        </div>

        {/* Right Panel: Form Card */}
        <div className="flex flex-col justify-center items-center py-12 lg:py-0">
          <div className="w-full max-w-[640px] bg-white lg:rounded-[32px] p-8 sm:p-12 shadow-2xl border border-slate-100 relative opacity-0 animate-slide-up [animation-delay:300ms]">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-bold text-primary tracking-widest uppercase">Register Page — AIVORA</p>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Create Your AIVORA Account</h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Join AIVORA to connect with AI experts, post AI projects, or offer professional AI services to clients.
                </p>
              </div>

              <div className="h-px w-full bg-slate-100" />
              
              <RegisterForm />
              
              <div className="h-px w-full bg-slate-100" />

              <div className="flex justify-center">
                <p className="text-sm text-muted-foreground font-medium">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-bold hover:underline transition-all underline-offset-4">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
