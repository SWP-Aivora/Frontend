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
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { Building2, Code2, ShieldCheck, Mail, UserCircle2, Loader2, AlertCircle } from 'lucide-react';

export const AccountInfoForm = () => {
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user, setUser } = useAuthStore();

  // Base User Form (Shared)
  const { register: registerUser, handleSubmit: handleUserSubmit, reset: resetUser, formState: { errors: userErrors } } = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: '',
      avatarUrl: '',
    }
  });

  // Client Profile Form
  const { register: registerClient, handleSubmit: handleClientSubmit, reset: resetClient, formState: { errors: clientErrors } } = useForm<ClientProfileFormValues>({
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
  const { register: registerExpert, handleSubmit: handleExpertSubmit, reset: resetExpert, formState: { errors: expertErrors } } = useForm<ExpertProfileFormValues>({
    resolver: zodResolver(expertProfileSchema),
    defaultValues: {
      title: '',
      bio: '',
      hourlyRate: 0,
      experienceYears: 0,
      availabilityStatus: 1,
    }
  });

  // Load profile data on mount or when user ID changes
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) return;
      
      setIsInitialLoading(true);
      setLoadError(null);
      try {
        // Fetch base user info
        const userRes = await profileService.getUserProfile();
        if (userRes.success && userRes.data) {
          const userData = userRes.data;
          setUser({
            id: userData.id,
            email: userData.email,
            fullName: userData.fullName || user?.fullName || userData.email.split('@')[0],
            role: userData.role
          });
          
          resetUser({
            fullName: userData.fullName || '',
            phone: userData.phone || '',
            avatarUrl: userData.avatarUrl || '',
          });
        } else {
            throw new Error(userRes.message || 'Failed to load user profile');
        }

        // Fetch role-specific profile
        if (user?.role === Role.CLIENT) {
          const clientRes = await profileService.getClientProfile();
          if (clientRes.success && clientRes.data) {
            resetClient({
              companyName: clientRes.data.companyName || '',
              industry: clientRes.data.industry || '',
              companySize: clientRes.data.companySize || '',
              website: clientRes.data.website || '',
              description: clientRes.data.description || '',
            });
          } else {
             throw new Error(clientRes.message || 'Failed to load client profile');
          }
        } else if (user?.role === Role.EXPERT) {
          const expertRes = await profileService.getExpertProfile();
          if (expertRes.success && expertRes.data) {
            resetExpert({
              title: expertRes.data.title || '',
              bio: expertRes.data.bio || '',
              hourlyRate: expertRes.data.hourlyRate || 0,
              experienceYears: expertRes.data.experienceYears || 0,
              availabilityStatus: expertRes.data.availabilityStatus || 1,
            });
          } else {
             throw new Error(expertRes.message || 'Failed to load expert profile');
          }
        }
      } catch (error) {
        setLoadError((error as Error).message || 'Failed to load profile data');
        toast.error('Failed to load profile data');
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadProfileData();
    // Only re-run if basic user context changes (Login/Logout/Role Switch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, resetUser, resetClient, resetExpert]);

  const onUserSubmit = async (data: UserUpdateFormValues) => {
    if (loadError || isInitialLoading) return;
    setIsUserLoading(true);
    
    try {
      // Data is already trimmed and normalized by Zod schema transform/refinement if applicable,
      // but we ensure it matches backend requirements here.
      const response = await profileService.updateUser(data);
      
      if (response.success && response.data) {
        // Update store with new name for Topbar consistency
        setUser({ 
          ...user!, 
          fullName: response.data.fullName || data.fullName || user!.fullName 
        });
        
        toast.success('Identity information updated');
        
        // Update form state with the normalized response from backend
        resetUser({
          fullName: response.data.fullName || '',
          phone: response.data.phone || '',
          avatarUrl: response.data.avatarUrl || '',
        });
      } else {
        toast.error(response.message || 'Failed to update identity');
      }
    } catch {
      toast.error('A network error occurred while updating identity');
    } finally {
      setIsUserLoading(false);
    }
  };

  const onClientSubmit = async (data: ClientProfileFormValues) => {
    if (loadError || isInitialLoading) return;
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
    if (loadError || isInitialLoading) return;
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

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="size-10 text-primary animate-spin" />
        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Securing your data...</p>
      </div>
    );
  }

  if (loadError) {
      return (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-10 text-center max-w-2xl mx-auto my-10">
          <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-black text-rose-900 mb-2">Failed to load profile</h2>
          <p className="text-rose-600 font-medium">{loadError}</p>
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              onClick={() => window.location.reload()}
              className="px-6 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors h-11"
            >
              Retry Loading
            </Button>
          </div>
        </div>
      );
  }

  return (
    <div className="space-y-8">
      {/* ACCOUNT INFORMATION (READ-ONLY) */}
      <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
             <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Account Information</h3>
            <p className="text-xs text-slate-500 font-medium">System-level account details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="size-3" /> Email Address
            </span>
            <p className="text-sm font-bold text-slate-700">{user?.email || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <UserCircle2 className="size-3" /> Access Level
            </span>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">
               {user?.role === Role.ADMIN ? 'Administrator' : user?.role === Role.EXPERT ? 'Expert Provider' : 'Client Partner'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="size-3" /> Organization ID
            </span>
            <p className="text-sm font-mono font-bold text-slate-400">
               {user?.id ? `ORG-${user.id.slice(0, 8).toUpperCase()}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* IDENTITY SETTINGS */}
      <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Personal Identity</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">How you are identified by other users.</p>
          </div>
        </div>

        <form onSubmit={handleUserSubmit(onUserSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Full Name</label>
              <Input {...registerUser('fullName')} placeholder="An Nguyen" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={!!loadError} />
              {userErrors.fullName && <p className="text-[10px] text-destructive font-bold ml-1">{userErrors.fullName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Contact Phone</label>
              <Input {...registerUser('phone')} placeholder="+84 912 345 678" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={!!loadError} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isUserLoading || isInitialLoading || !!loadError} variant="outline" className="rounded-xl px-6 h-10 font-bold border-slate-200 hover:border-primary hover:text-primary transition-all text-xs">
              {isUserLoading ? 'Saving...' : 'Update Identity'}
            </Button>
          </div>
        </form>
      </div>

      {/* ROLE SPECIFIC SETTINGS */}
      {user?.role === Role.CLIENT && (
        <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
               <Building2 className="size-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Business Profile</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Corporate details for project collaboration.</p>
            </div>
          </div>

          <form onSubmit={handleClientSubmit(onClientSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Company Legal Name</label>
                <Input {...registerClient('companyName')} placeholder="Tech Solutions JSC" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={isUserLoading || !!loadError} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Corporate Website</label>
                <Input {...registerClient('website')} placeholder="https://example.com" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={isUserLoading || !!loadError} />
                {clientErrors.website && <p className="text-[10px] text-destructive font-bold ml-1">{clientErrors.website.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Industry Domain</label>
                <Input {...registerClient('industry')} placeholder="Fintech, SaaS" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={isUserLoading || !!loadError} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Company Size</label>
                <select 
                  {...registerClient('companySize')}
                  className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none font-medium"
                  disabled={isUserLoading || !!loadError}
                >
                  <option value="">Select size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="200+">200+ employees</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Organization Overview</label>
               <textarea 
                  {...registerClient('description')}
                  placeholder="Describe your organization's goals..."
                  className="w-full min-h-[100px] p-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  disabled={isUserLoading || !!loadError}
               />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-50">
              <Button type="submit" disabled={isProfileLoading || isUserLoading || !!loadError} className="rounded-xl px-8 h-11 font-bold shadow-lg shadow-blue-100 uppercase tracking-wider text-xs">
                {isProfileLoading ? 'Saving...' : 'Update Business Profile'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {user?.role === Role.EXPERT && (
        <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-10 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent">
               <Code2 className="size-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Expert Credentials</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Professional visibility for client matching.</p>
            </div>
          </div>

          <form onSubmit={handleExpertSubmit(onExpertSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Professional Headline</label>
                <Input {...registerExpert('title')} placeholder="Senior AI Research Engineer" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={isInitialLoading || !!loadError} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Hourly Rate ($)</label>
                <Input type="number" {...registerExpert('hourlyRate')} placeholder="0.00" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={!!loadError} />
                {expertErrors.hourlyRate && <p className="text-[10px] text-destructive font-bold ml-1">{expertErrors.hourlyRate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Experience (Years)</label>
                <Input type="number" {...registerExpert('experienceYears')} placeholder="0" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={isInitialLoading || !!loadError} />
                {expertErrors.experienceYears && <p className="text-[10px] text-destructive font-bold ml-1">{expertErrors.experienceYears.message}</p>}
              </div>
            </div>
            
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Professional Background</label>
               <textarea 
                  {...registerExpert('bio')}
                  placeholder="Detail your experience with LLMs, Computer Vision, etc..."
                  className="w-full min-h-[120px] p-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20 text-sm font-medium"
                  disabled={isInitialLoading || !!loadError}
               />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-50">
              <Button type="submit" disabled={isProfileLoading || isInitialLoading || !!loadError} className="rounded-xl px-8 h-11 font-bold bg-brand-accent hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20 uppercase tracking-wider text-xs">
                {isProfileLoading ? 'Saving...' : 'Update Expert Credentials'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
