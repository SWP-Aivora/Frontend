import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { registerSchema } from '../schema';
import type { RegisterFormValues } from '../types';
import { authService } from '../services';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Role } from '@/shared/types/enums';
import { cn } from '@/lib/utils';
import { PolicyDialog } from './PolicyDialog';
import { LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react';

interface RegisterFormProps {
  selectedRole: typeof Role.CLIENT | typeof Role.EXPERT;
}

export const RegisterForm = ({ selectedRole }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: selectedRole,
    }
  });

  // Keep the hidden role field in sync if it changes from parent
  useEffect(() => {
    setValue('role', selectedRole);
  }, [selectedRole, setValue]);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name Field */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="ml-1 text-sm font-bold text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <User className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              id="fullName"
              placeholder="Enter your full name" 
              {...register('fullName')}
              className={cn(
                "pl-14 h-12 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300",
                errors.fullName ? 'border-destructive' : 'hover:border-slate-300'
              )}
            />
          </div>
          {errors.fullName && <p className="text-xs text-destructive font-medium ml-1">{errors.fullName.message}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="ml-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-bold text-slate-700">
            <span>Email Address <span className="text-red-500">*</span></span>
            <span className="text-[10px] font-medium italic text-slate-400">Use a valid email</span>
          </label>
          <div className="relative group">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              id="email"
              type="email" 
              placeholder="name@example.com" 
              {...register('email')}
              className={cn(
                "pl-14 h-12 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300",
                errors.email ? 'border-destructive' : 'hover:border-slate-300'
              )}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive font-medium ml-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="ml-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-bold text-slate-700">
            <span>Password <span className="text-red-500">*</span></span>
            <span className="text-[10px] font-medium italic text-slate-400">At least 8 characters, including 1 uppercase letter, 1 lowercase letter, and 1 number</span>
          </label>
          <div className="relative group">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              id="password"
              type="password" 
              placeholder="••••••••" 
              {...register('password')}
              className={cn(
                "pl-14 h-12 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300",
                errors.password ? 'border-destructive' : 'hover:border-slate-300'
              )}
            />
          </div>
          {errors.password && <p className="text-xs text-destructive font-medium ml-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="ml-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-bold text-slate-700">
            <span>Confirm Password <span className="text-red-500">*</span></span>
            <span className="text-[10px] font-medium italic text-slate-400">At least 8 characters, including 1 uppercase letter, 1 lowercase letter, and 1 number</span>
          </label>
          <div className="relative group">
            <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              id="confirmPassword"
              type="password" 
              placeholder="••••••••" 
              {...register('confirmPassword')}
              className={cn(
                "pl-14 h-12 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300",
                errors.confirmPassword ? 'border-destructive' : 'hover:border-slate-300'
              )}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive font-medium ml-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      {/* Terms Row */}
      <div className="flex items-start gap-3 px-1 py-1.5 bg-slate-50/50 border border-slate-100 rounded-lg">
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
           <p className="text-[13px] font-bold text-slate-700">
             I agree to the <span className="text-red-500">*</span>{' '}
             <PolicyDialog type="terms">
               <button type="button" className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80">
                 Terms of Service
               </button>
             </PolicyDialog>
             {' '}and{' '}
             <PolicyDialog type="privacy">
               <button type="button" className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80">
                 Privacy Policy
               </button>
             </PolicyDialog>
             .
           </p>
           <p className="text-xs font-medium text-slate-400">Use the service responsibly and follow AIVORA platform policies.</p>
        </div>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className={cn(
          "w-full h-12 rounded-full text-base font-bold shadow-lg transition-all duration-300 mt-1",
          selectedRole === Role.CLIENT ? "shadow-primary/20" : "bg-brand-accent hover:bg-brand-accent/90 shadow-brand-accent/20"
        )} 
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};
