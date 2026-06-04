import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { registerSchema } from '../schema';
import type { RegisterFormValues } from '../types';
import { authService } from '../services';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Role } from '@/shared/types/enums';
import { cn } from '@/lib/utils';

export const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: Role.CLIENT,
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      if (response.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message: string } } };
        toast.error(axiosError.response?.data?.message || 'An error occurred during registration');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">Full Name</label>
          <Input 
            id="fullName"
            placeholder="Enter your full name" 
            {...register('fullName')}
            className={cn(
              "bg-slate-50 border-slate-200 focus:ring-primary h-12 rounded-xl",
              errors.fullName ? 'border-destructive' : ''
            )}
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
          <Input 
            id="email"
            type="email" 
            placeholder="name@example.com" 
            {...register('email')}
            className={cn(
              "bg-slate-50 border-slate-200 focus:ring-primary h-12 rounded-xl",
              errors.email ? 'border-destructive' : ''
            )}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
          <Input 
            id="password"
            type="password" 
            placeholder="••••••••" 
            {...register('password')}
            className={cn(
              "bg-slate-50 border-slate-200 focus:ring-primary h-12 rounded-xl",
              errors.password ? 'border-destructive' : ''
            )}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm Password</label>
          <Input 
            id="confirmPassword"
            type="password" 
            placeholder="••••••••" 
            {...register('confirmPassword')}
            className={cn(
              "bg-slate-50 border-slate-200 focus:ring-primary h-12 rounded-xl",
              errors.confirmPassword ? 'border-destructive' : ''
            )}
          />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">I want to join as a:</label>
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => setValue('role', Role.CLIENT)}
            className={cn(
              "cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center text-center space-y-2",
              selectedRole === Role.CLIENT 
                ? "border-primary bg-primary/5 shadow-md" 
                : "border-slate-100 bg-white hover:border-slate-200"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
              selectedRole === Role.CLIENT ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
            )}>
              CL
            </div>
            <div>
              <p className="font-bold text-slate-900">Client</p>
              <p className="text-xs text-slate-500">I want to hire AI experts</p>
            </div>
          </div>

          <div 
            onClick={() => setValue('role', Role.EXPERT)}
            className={cn(
              "cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center text-center space-y-2",
              selectedRole === Role.EXPERT 
                ? "border-purple-600 bg-purple-50 shadow-md" 
                : "border-slate-100 bg-white hover:border-slate-200"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
              selectedRole === Role.EXPERT ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-500"
            )}>
              EX
            </div>
            <div>
              <p className="font-bold text-slate-900">Expert</p>
              <p className="text-xs text-slate-500">I want to offer AI services</p>
            </div>
          </div>
        </div>
        {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full h-14 rounded-full text-base font-bold shadow-aivora" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};
