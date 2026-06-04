import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { profileSchema, type ProfileFormValues } from '../schema';
import { profileService } from '../services';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';

export const AccountInfoForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: '',
      location: '',
      language: 'English',
      timezone: 'Asia/Ho_Chi_Minh',
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const response = await profileService.updateProfile(data);
      if (response.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900">Account Information</h3>
          <p className="text-sm text-slate-500 font-medium">Update basic identity and contact details.</p>
        </div>
        <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{user?.role}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Full Name</label>
            <Input {...register('fullName')} placeholder="An Nguyen" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
            {errors.fullName && <p className="text-[10px] text-destructive font-bold ml-1">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Address</label>
            <Input {...register('email')} type="email" placeholder="annguyen@example.com" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
            {errors.email && <p className="text-[10px] text-destructive font-bold ml-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Phone Number</label>
            <Input {...register('phone')} placeholder="+84 912 345 678" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Location</label>
            <Input {...register('location')} placeholder="Ho Chi Minh City" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Language</label>
            <Input {...register('language')} placeholder="English" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Time Zone</label>
            <Input {...register('timezone')} placeholder="Asia/Ho_Chi_Minh" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
