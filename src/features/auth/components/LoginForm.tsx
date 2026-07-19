import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { loginSchema } from '../schema';
import type { LoginFormValues } from '../types';
import { useAuthStore } from '../store';
import { authService } from '../services';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Role } from '@/shared/types/enums';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

const getLoginErrorMessage = (statusCode?: number, message?: string) => {
  if (statusCode === 401) return 'Invalid email or password.';

  const normalizedMessage = message?.trim();
  if (!normalizedMessage) return 'Login failed';

  if (/invalid|credential|password|email/i.test(normalizedMessage)) {
    return 'Invalid email or password.';
  }

  return normalizedMessage;
};

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const response = await authService.login(data);
      if (response.success && response.data) {
        setLoginError(null);
        const authData = response.data;
        // Pass the entire flat response as the user object since it contains user fields
        setAuth(authData, authData.accessToken, authData.refreshToken);
        
        toast.success('Login successful!');
        
        // Role-based navigation
        switch (authData.role) {
          case Role.CLIENT:
            navigate('/client');
            break;
          case Role.EXPERT:
            navigate('/expert');
            break;
          case Role.ADMIN:
            navigate('/admin');
            break;
          default:
            navigate('/');
        }
      } else {
        const message = getLoginErrorMessage(response.statusCode, response.message);
        setLoginError(message);
        toast.error(message);
      }
    } catch (error: unknown) {
      const message = (() => {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
          return getLoginErrorMessage(axiosError.response?.status, axiosError.response?.data?.message);
        }

        return 'An unexpected error occurred';
      })();
      setLoginError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              id="email"
              type="email" 
              placeholder="Enter your email address" 
              {...register('email', { onChange: () => setLoginError(null) })}
              className={`pl-14 h-12 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${errors.email ? 'border-destructive' : 'hover:border-slate-300'}`}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive font-medium ml-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              id="password"
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter your password" 
              {...register('password', { onChange: () => setLoginError(null) })}
              className={`login-password-input pl-14 pr-14 h-12 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${errors.password ? 'border-destructive' : 'hover:border-slate-300'}`}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive font-medium ml-1">{errors.password.message}</p>}
        </div>
      </div>

      {loginError && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {loginError}
        </div>
      )}

      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-12 rounded-full text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" 
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Log In'}
      </Button>
    </form>
  );
};
