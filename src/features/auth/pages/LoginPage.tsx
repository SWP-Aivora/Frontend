import { LoginForm } from '@/features/auth/components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-hero flex-col justify-center px-12 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-brand-blue-dark leading-tight mb-6">
            Find the Right AI Expert for Your Business
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            AIVORA connects clients with qualified AI experts to build next-generation solutions.
          </p>
        </div>
        {/* Background elements would go here as per Figma */}
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-primary font-semibold hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
