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

const ASSETS = {
  iconCircle: "https://www.figma.com/api/mcp/asset/fcaaabae-fe9a-4782-9a0c-33099504df26",
};

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name Field */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 size-7 pointer-events-none">
              <img src={ASSETS.iconCircle} alt="" className="size-full opacity-80 group-focus-within:opacity-100 transition-opacity" />
              <span className="absolute inset-0 flex items-center justify-center font-bold text-primary text-[10px]">FN</span>
            </div>
            <Input 
              id="fullName"
              placeholder="Enter your full name" 
              {...register('fullName')}
              className={cn(
                "pl-14 h-14 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300",
                errors.fullName ? 'border-destructive' : 'hover:border-slate-300'
              )}
            />
          </div>
          {errors.fullName && <p className="text-xs text-destructive font-medium ml-1">{errors.fullName.message}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 size-7 pointer-events-none">
              <img src={ASSETS.iconCircle} alt="" className="size-full opacity-80 group-focus-within:opacity-100 transition-opacity" />
              <span className="absolute inset-0 flex items-center justify-center font-bold text-primary text-[10px]">@</span>
            </div>
            <Input 
              id="email"
              type="email" 
              placeholder="name@example.com" 
              {...register('email')}
              className={cn(
                "pl-14 h-14 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300",
                errors.email ? 'border-destructive' : 'hover:border-slate-300'
              )}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive font-medium ml-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">Password</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 size-7 pointer-events-none">
              <img src={ASSETS.iconCircle} alt="" className="size-full opacity-80 group-focus-within:opacity-100 transition-opacity" />
              <span className="absolute inset-0 flex items-center justify-center font-bold text-primary text-[10px] tracking-tighter">**</span>
            </div>
            <Input 
              id="password"
              type="password" 
              placeholder="••••••••" 
              {...register('password')}
              className={cn(
                "pl-14 h-14 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300",
                errors.password ? 'border-destructive' : 'hover:border-slate-300'
              )}
            />
          </div>
          {errors.password && <p className="text-xs text-destructive font-medium ml-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 size-7 pointer-events-none">
              <img src={ASSETS.iconCircle} alt="" className="size-full opacity-80 group-focus-within:opacity-100 transition-opacity" />
              <span className="absolute inset-0 flex items-center justify-center font-bold text-primary text-[10px] tracking-tighter">**</span>
            </div>
            <Input 
              id="confirmPassword"
              type="password" 
              placeholder="••••••••" 
              {...register('confirmPassword')}
              className={cn(
                "pl-14 h-14 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300",
                errors.confirmPassword ? 'border-destructive' : 'hover:border-slate-300'
              )}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive font-medium ml-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-700 ml-1">I want to join as a:</label>
        <div className="grid grid-cols-2 gap-4">
          {/* Client Role Option */}
          <div 
            onClick={() => setValue('role', Role.CLIENT)}
            className={cn(
              "group cursor-pointer p-5 rounded-[24px] border-2 transition-all duration-300 flex flex-col items-center text-center space-y-3 relative overflow-hidden",
              selectedRole === Role.CLIENT 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
            )}
          >
            {selectedRole === Role.CLIENT && (
              <div className="absolute top-3 right-3 size-5 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="size-3 text-white">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className={cn(
              "size-12 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300",
              selectedRole === Role.CLIENT ? "bg-primary text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
            )}>
              CL
            </div>
            <div>
              <p className="font-bold text-slate-900">Client</p>
              <p className="text-[11px] font-medium text-slate-500 leading-tight">I want to hire AI experts</p>
            </div>
          </div>

          {/* Expert Role Option */}
          <div 
            onClick={() => setValue('role', Role.EXPERT)}
            className={cn(
              "group cursor-pointer p-5 rounded-[24px] border-2 transition-all duration-300 flex flex-col items-center text-center space-y-3 relative overflow-hidden",
              selectedRole === Role.EXPERT 
                ? "border-brand-accent bg-brand-accent/5 shadow-lg shadow-brand-accent/10" 
                : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
            )}
          >
            {selectedRole === Role.EXPERT && (
              <div className="absolute top-3 right-3 size-5 bg-brand-accent rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="size-3 text-white">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className={cn(
              "size-12 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300",
              selectedRole === Role.EXPERT ? "bg-brand-accent text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
            )}>
              EX
            </div>
            <div>
              <p className="font-bold text-slate-900">Expert</p>
              <p className="text-[11px] font-medium text-slate-500 leading-tight">I want to offer AI services</p>
            </div>
          </div>
        </div>
        {errors.role && <p className="text-xs text-destructive font-medium ml-1">{errors.role.message}</p>}
      </div>

      {/* Terms Row */}
      <div className="flex items-start gap-3 px-1 py-2 bg-slate-50/50 border border-slate-100 rounded-2xl">
        <label className="flex items-center gap-2 cursor-pointer group mt-1 ml-2">
          <div className="relative size-5 rounded-md border-2 border-slate-300 bg-white group-hover:border-primary transition-colors overflow-hidden shrink-0">
             <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" required />
             <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="size-3 text-white">
                  <path d="M5 13l4 4L19 7" />
                </svg>
             </div>
          </div>
        </label>
        <div className="space-y-0.5">
           <p className="text-[13px] font-bold text-slate-700">I agree to the Terms of Service and Privacy Policy.</p>
           <p className="text-[11px] font-medium text-slate-400">Use the service responsibly and follow AIVORA platform policies.</p>
        </div>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-14 rounded-full text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-2" 
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};
