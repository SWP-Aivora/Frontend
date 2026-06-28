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

const ASSETS = {
  iconCircle: "https://www.figma.com/api/mcp/asset/b5419652-1b98-4868-81dd-4af0923d3db0",
};

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      if (response.success && response.data) {
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
        toast.error(response.message || 'Login failed');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message: string } } };
        toast.error(axiosError.response?.data?.message || 'An error occurred during login');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      <div className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 size-7 pointer-events-none">
              <img src={ASSETS.iconCircle} alt="" className="size-full opacity-80 group-focus-within:opacity-100 transition-opacity" />
              <span className="absolute inset-0 flex items-center justify-center font-bold text-primary text-xs">@</span>
            </div>
            <Input 
              id="email"
              type="email" 
              placeholder="Enter your email address" 
              {...register('email')}
              className={`pl-14 h-14 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${errors.email ? 'border-destructive' : 'hover:border-slate-300'}`}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive font-medium ml-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">Password</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 size-7 pointer-events-none">
              <img src={ASSETS.iconCircle} alt="" className="size-full opacity-80 group-focus-within:opacity-100 transition-opacity" />
              <span className="absolute inset-0 flex items-center justify-center font-bold text-primary text-xs tracking-tighter">**</span>
            </div>
            <Input 
              id="password"
              type="password" 
              placeholder="Enter your password" 
              {...register('password')}
              className={`pl-14 h-14 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${errors.password ? 'border-destructive' : 'hover:border-slate-300'}`}
            />
          </div>
          {errors.password && <p className="text-xs text-destructive font-medium ml-1">{errors.password.message}</p>}
        </div>
      </div>

      {/* Remember & Forgot Row */}
      <div className="flex items-center justify-between px-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative size-5 rounded-md border-2 border-slate-300 bg-white group-hover:border-primary transition-colors overflow-hidden">
             <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" />
             <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="size-3 text-white">
                  <path d="M5 13l4 4L19 7" />
                </svg>
             </div>
          </div>
          <span className="text-sm font-medium text-slate-600">Remember me</span>
        </label>
        <a href="#" className="text-sm font-bold text-primary hover:underline underline-offset-4">
          Forgot your password?
        </a>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-14 rounded-full text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" 
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Log In'}
      </Button>
    </form>
  );
};

