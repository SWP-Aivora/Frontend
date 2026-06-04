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

const ASSETS = {
  iconCircle: "https://www.figma.com/api/mcp/asset/fcaaabae-fe9a-4782-9a0c-33099504df26",
};

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
        className={cn(
          "w-full h-14 rounded-full text-base font-bold shadow-lg transition-all duration-300 mt-2",
          selectedRole === Role.CLIENT ? "shadow-primary/20" : "bg-brand-accent hover:bg-brand-accent/90 shadow-brand-accent/20"
        )} 
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};
