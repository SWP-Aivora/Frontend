import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { 
  userUpdateSchema, 
  clientProfileSchema, 
  expertProfileSchema, 
  type UserUpdateFormValues,
  type ClientProfileFormValues,
  type ExpertProfileFormValues
} from '../schema';
import { profileService } from '../services';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { Building2, Code2 } from 'lucide-react';

export const AccountInfoForm = () => {
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const { user, setAuth, accessToken } = useAuthStore();

  // Base User Form (Shared)
  const { register: registerUser, handleSubmit: handleUserSubmit, formState: { errors: userErrors } } = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: '',
      avatarUrl: '',
    }
  });

  // Client Profile Form
  const { register: registerClient, handleSubmit: handleClientSubmit, formState: { errors: clientErrors } } = useForm<ClientProfileFormValues>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      companySize: '',
      website: '',
      description: '',
    }
  });

  // Expert Profile Form
  const { register: registerExpert, handleSubmit: handleExpertSubmit, formState: { errors: expertErrors } } = useForm<ExpertProfileFormValues>({
    resolver: zodResolver(expertProfileSchema),
    defaultValues: {
      title: '',
      bio: '',
      hourlyRate: 0,
      experienceYears: 0,
      availabilityStatus: 1,
    }
  });

  const onUserSubmit = async (data: UserUpdateFormValues) => {
    setIsUserLoading(true);
    try {
      const response = await profileService.updateUser(data);
      if (response.success && accessToken) {
        // Cập nhật lại Auth Store nếu đổi Tên
        setAuth({ ...user!, fullName: data.fullName || user!.fullName }, accessToken);
        toast.success('Basic information updated');
      } else {
        toast.error(response.message || 'Failed to update basic info');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsUserLoading(false);
    }
  };

  const onClientSubmit = async (data: ClientProfileFormValues) => {
    setIsProfileLoading(true);
    try {
      const response = await profileService.updateClientProfile(data);
      if (response.success) toast.success('Company profile updated');
      else toast.error(response.message || 'Failed to update profile');
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onExpertSubmit = async (data: ExpertProfileFormValues) => {
    setIsProfileLoading(true);
    try {
      const response = await profileService.updateExpertProfile(data);
      if (response.success) toast.success('Expert profile updated');
      else toast.error(response.message || 'Failed to update profile');
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsProfileLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* BASE USER SETTINGS */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Basic Information</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage your identity across the platform.</p>
          </div>
        </div>

        <form onSubmit={handleUserSubmit(onUserSubmit)} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Full Name</label>
              <Input {...registerUser('fullName')} placeholder="e.g., An Nguyen" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
              {userErrors.fullName && <p className="text-[10px] text-destructive font-bold ml-1">{userErrors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Phone Number</label>
              <Input {...registerUser('phone')} placeholder="+84 912 345 678" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isUserLoading} variant="outline" className="rounded-full px-8 h-10 font-bold border-slate-200">
              {isUserLoading ? 'Saving...' : 'Save Basic Info'}
            </Button>
          </div>
        </form>
      </div>

      {/* ROLE SPECIFIC SETTINGS */}
      {user?.role === Role.CLIENT && (
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
               <Building2 className="size-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Company Profile</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Information visible to experts when you post a job.</p>
            </div>
          </div>

          <form onSubmit={handleClientSubmit(onClientSubmit)} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Company Name</label>
                <Input {...registerClient('companyName')} placeholder="e.g., Tech Solutions JSC" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Website URL</label>
                <Input {...registerClient('website')} placeholder="https://example.com" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
                {clientErrors.website && <p className="text-[10px] text-destructive font-bold ml-1">{clientErrors.website.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Industry</label>
                <Input {...registerClient('industry')} placeholder="e.g., Fintech, Healthcare" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Company Size</label>
                <select 
                  {...registerClient('companySize')}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none"
                >
                  <option value="">Select size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="200+">200+ employees</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Company Description</label>
               <textarea 
                  {...registerClient('description')}
                  placeholder="Tell experts a little about your business goals..."
                  className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
               />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" disabled={isProfileLoading} className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20">
                {isProfileLoading ? 'Saving Profile...' : 'Save Company Profile'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {user?.role === Role.EXPERT && (
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="size-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
               <Code2 className="size-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Professional Profile</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">This is how clients see you on the marketplace.</p>
            </div>
          </div>

          <form onSubmit={handleExpertSubmit(onExpertSubmit)} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Professional Title</label>
                <Input {...registerExpert('title')} placeholder="e.g., Senior Computer Vision Engineer" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Hourly Rate ($)</label>
                <Input type="number" {...registerExpert('hourlyRate')} placeholder="0.00" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
                {expertErrors.hourlyRate && <p className="text-[10px] text-destructive font-bold ml-1">{expertErrors.hourlyRate.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Years of Experience</label>
                <Input type="number" {...registerExpert('experienceYears')} placeholder="0" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
                {expertErrors.experienceYears && <p className="text-[10px] text-destructive font-bold ml-1">{expertErrors.experienceYears.message}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Professional Bio</label>
               <textarea 
                  {...registerExpert('bio')}
                  placeholder="Highlight your top AI skills and past project successes..."
                  className="w-full min-h-[120px] p-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20 text-sm"
               />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" disabled={isProfileLoading} className="rounded-full px-8 h-12 font-bold bg-brand-accent hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20">
                {isProfileLoading ? 'Saving Profile...' : 'Save Professional Profile'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
