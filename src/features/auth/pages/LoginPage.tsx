import { LoginForm } from '@/features/auth/components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-hero flex-col justify-center px-20 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-[-10%] -left-[-10%] w-[500px] h-[500px] bg-brand-blue-light/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] -right-[-10%] w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-3xl opacity-40" />

        <div className="relative z-10">
          <div className="mb-12">
             <div className="text-2xl font-black text-brand-blue-dark tracking-tighter flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg shadow-aivora" />
                AIVORA
             </div>
          </div>
          <h1 className="text-6xl font-extrabold text-brand-blue-dark leading-[1.1] mb-8 max-w-lg">
            Find the Right <span className="text-primary">AI Expert</span> for Your Business
          </h1>
          <p className="text-xl text-muted-foreground max-w-md font-medium">
            AIVORA connects clients with qualified AI experts to build next-generation solutions.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 bg-white lg:rounded-l-[40px] shadow-2xl z-20">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground font-medium">Enter your credentials to access your account</p>
          </div>
          
          <LoginForm />
          
          <div className="pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-primary font-bold hover:underline transition-all">
                Sign up for free
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
