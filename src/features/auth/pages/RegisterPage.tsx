import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Link } from 'react-router-dom';

export const RegisterPage = () => {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Left Panel - Branding/Introduction */}
      <div className="hidden lg:flex w-5/12 bg-gradient-hero flex-col justify-center px-16 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-[-10%] -left-[-10%] w-[600px] h-[600px] bg-brand-blue-light/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] -right-[-10%] w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-3xl opacity-40" />

        <div className="relative z-10">
          <div className="mb-10">
             <Link to="/" className="text-2xl font-black text-brand-blue-dark tracking-tighter flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg shadow-aivora" />
                AIVORA
             </Link>
          </div>
          
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            Secure AI marketplace registration
          </div>

          <h1 className="text-5xl font-extrabold text-brand-blue-dark leading-tight mb-6 max-w-lg">
            Start your AI journey with <span className="text-primary">AIVORA</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md font-medium mb-10">
            Whether you need an AI solution or want to offer your expertise, AIVORA helps you connect, collaborate, and complete projects with confidence.
          </p>

          <div className="grid grid-cols-1 gap-4 max-w-md">
            <div className="bg-white/80 backdrop-blur-sm border border-border p-5 rounded-2xl shadow-sm">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-3">
                Client
              </div>
              <p className="text-sm text-slate-600">
                Post projects, find experts, and manage milestones with our secure platform.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border border-border p-5 rounded-2xl shadow-sm">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold mb-3">
                Expert
              </div>
              <p className="text-sm text-slate-600">
                Offer AI services, apply for high-quality work, and grow your professional reputation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 bg-white lg:rounded-l-[40px] shadow-2xl z-20">
        <div className="w-full max-w-xl space-y-8">
          <div className="space-y-3">
            <p className="text-primary font-bold text-sm tracking-wider uppercase">Register Page - Aivora</p>
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Create Your AIVORA Account</h2>
            <p className="text-muted-foreground font-medium text-lg">
              Join AIVORA to connect with AI experts, post projects, or offer professional services.
            </p>
          </div>
          
          <div className="h-px bg-border w-full my-8" />
          
          <RegisterForm />
          
          <div className="pt-6 border-t border-border mt-8">
            <p className="text-center text-sm text-muted-foreground font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
