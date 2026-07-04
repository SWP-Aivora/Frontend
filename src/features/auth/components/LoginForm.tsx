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
import { LockKeyhole, Mail } from 'lucide-react';

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
              {...register('email')}
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
              type="password" 
              placeholder="Enter your password" 
              {...register('password')}
              className={`pl-14 h-12 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${errors.password ? 'border-destructive' : 'hover:border-slate-300'}`}
            />
          </div>
          {errors.password && <p className="text-xs text-destructive font-medium ml-1">{errors.password.message}</p>}
        </div>
      </div>

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
