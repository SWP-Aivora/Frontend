import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Role } from '@/shared/types/enums';
import { cn } from '@/lib/utils';

const ASSETS = {
  bgBlueWashLeft: "https://www.figma.com/api/mcp/asset/4d3b9620-0684-4a2a-8b55-c0c33cbd1a02",
  bgBlueWashRight: "https://www.figma.com/api/mcp/asset/4d4eb8b4-c6c0-4e45-909c-c6ac9a166033",
  bgRing1: "https://www.figma.com/api/mcp/asset/5f40beac-ced7-41ae-9a3c-7cec2a18b70a",
  bgRing2: "https://www.figma.com/api/mcp/asset/246e4886-f689-4fbb-b40b-ee579ccc9944",
  logoCircle: "/logo.png",
  leftPanelGlow: "https://www.figma.com/api/mcp/asset/53e63aa3-a7f4-4ec6-b47f-c92f22773cc5",
};

export const RegisterPage = () => {
  const [step, setStep] = useState<'selection' | 'details'>('selection');
  const [selectedRole, setSelectedRole] = useState<typeof Role.CLIENT | typeof Role.EXPERT>(Role.CLIENT);

  const handleRoleSelect = (role: typeof Role.CLIENT | typeof Role.EXPERT) => {
    setSelectedRole(role);
    setStep('details');
  };

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

          {/* Benefit Cards (Dynamic based on step) */}
          <div className="grid grid-cols-2 gap-6 mt-auto opacity-0 animate-fade-in [animation-delay:1000ms]">
            {[
              { label: 'Hire Talent', color: 'bg-primary/10 text-primary', desc: 'Post projects and find the best AI experts worldwide.' },
              { label: 'Find Work', color: 'bg-brand-accent/10 text-brand-accent', desc: 'Apply for AI jobs and grow your professional portfolio.' },
            ].map((card, i) => (
              <div key={i} className="p-5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${card.color} mb-3 inline-block`}>
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

        {/* Right Panel: Interactive Card */}
        <div className="flex flex-col justify-center items-center py-12 lg:py-0">
          <div className="w-full max-w-[640px] bg-white lg:rounded-xl p-8 sm:p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
            
            {step === 'selection' ? (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">Step 1 of 2 — Role</span>
                  </div>
                  <h2 className="text-4xl font-black text-foreground tracking-tight">Join as a Client or AI Expert</h2>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    Select your role so we can personalize your experience and guide you to the right registration flow.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Client Card */}
                  <div 
                    onClick={() => handleRoleSelect(Role.CLIENT)}
                    className="group cursor-pointer p-8 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/10 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="size-16 rounded-full bg-slate-50 group-hover:bg-primary flex items-center justify-center font-bold text-xl transition-colors duration-300 group-hover:text-white">CL</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">I'm a Client</h3>
                      <p className="text-sm text-slate-500 mt-1">Hiring for AI projects</p>
                    </div>
                  </div>

                  {/* Expert Card */}
                  <div 
                    onClick={() => handleRoleSelect(Role.EXPERT)}
                    className="group cursor-pointer p-8 rounded-xl border-2 border-slate-100 hover:border-brand-accent hover:bg-brand-accent/5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-accent/10 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="size-16 rounded-full bg-slate-50 group-hover:bg-brand-accent flex items-center justify-center font-bold text-xl transition-colors duration-300 group-hover:text-white">AI</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">I'm an Expert</h3>
                      <p className="text-sm text-slate-500 mt-1">Offering AI expertise</p>
                    </div>
                  </div>
                </div>

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
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right fade-in duration-500">
                <div className="space-y-4">
                  <button 
                    onClick={() => setStep('selection')}
                    className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-3 transition-transform group-hover:-translate-x-1">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    BACK TO ROLE SELECTION
                  </button>
                  <h2 className="text-4xl font-black text-foreground tracking-tight">Complete your profile</h2>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    Registering as <span className={cn("font-bold uppercase", selectedRole === Role.CLIENT ? "text-primary" : "text-brand-accent")}>{selectedRole}</span>
                  </p>
                </div>

                <div className="h-px w-full bg-slate-100" />
                
                <RegisterForm selectedRole={selectedRole} />
                
                <div className="h-px w-full bg-slate-100" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
