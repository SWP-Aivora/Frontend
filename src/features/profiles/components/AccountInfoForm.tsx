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
import { AvailabilityStatus, Role } from '@/shared/types/enums';
import { Building2, Code2, ShieldCheck, Mail, UserCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface AccountInfoFormProps {
  mode?: 'account' | 'expertise';
}

const getRouteRole = (pathname: string): Role | null => {
  if (pathname.startsWith('/client/')) return Role.CLIENT;
  if (pathname.startsWith('/expert/')) return Role.EXPERT;
  if (pathname.startsWith('/admin/')) return Role.ADMIN;
  return null;
};

const normalizeRole = (role: unknown): Role | null => {
  if (typeof role !== 'string') return null;

  const normalized = role.toUpperCase();
  return Object.values(Role).find((value) => value === normalized) || null;
};

export const AccountInfoForm = ({ mode = 'account' }: AccountInfoFormProps) => {
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isExpertProfileMissing, setIsExpertProfileMissing] = useState(false);
  const { user, setUser } = useAuthStore();
  const location = useLocation();
  const routeRole = getRouteRole(location.pathname);
  const activeProfileRole = routeRole || user?.role || null;

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
      availabilityStatus: AvailabilityStatus.AVAILABLE,
    }
  });

  // Load profile data on mount or when user ID changes
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) return;
      
      setIsInitialLoading(true);
      setLoadError(null);
      setIsExpertProfileMissing(false);
      try {
        // Fetch base user info
        const userRes = await profileService.getUserProfile();
        if (userRes.success && userRes.data) {
          const userData = userRes.data;
          const normalizedUserRole = normalizeRole(userData.role) || user?.role || Role.CLIENT;
          setUser({
            id: userData.id,
            email: userData.email,
            fullName: userData.fullName || user?.fullName || '',
            role: normalizedUserRole
          });
          
          resetUser({
            fullName: userData.fullName || '',
            phone: userData.phone || '',
            avatarUrl: userData.avatarUrl || '',
          });
        } else {
            throw new Error(userRes.message || 'Failed to load user profile');
        }

        // Fetch role-specific profile. A missing role profile is optional; base auth/user
        // data is enough to keep the Account tab editable.
        if (activeProfileRole === Role.CLIENT) {
          const clientRes = await profileService.getClientProfile();
          if (clientRes.success && clientRes.data) {
            resetClient({
              companyName: clientRes.data.companyName || '',
              industry: clientRes.data.industry || '',
              companySize: clientRes.data.companySize || '',
              website: clientRes.data.website || '',
              description: clientRes.data.description || '',
            });
          } else if (clientRes.success && clientRes.statusCode === 404) {
            resetClient({
              companyName: '',
              industry: '',
              companySize: '',
              website: '',
              description: '',
            });
          } else {
             throw new Error(clientRes.message || 'Failed to load client profile');
          }
        } else if (activeProfileRole === Role.EXPERT) {
          const expertRes = await profileService.getExpertProfile();
          if (expertRes.success && expertRes.data) {
            setIsExpertProfileMissing(false);
            resetExpert({
              title: expertRes.data.title || '',
              bio: expertRes.data.bio || '',
              hourlyRate: expertRes.data.hourlyRate || 0,
              experienceYears: expertRes.data.experienceYears || 0,
              availabilityStatus: expertRes.data.availabilityStatus ?? AvailabilityStatus.AVAILABLE,
            });
          } else if (expertRes.success && expertRes.statusCode === 404) {
            setIsExpertProfileMissing(true);
            resetExpert({
              title: '',
              bio: '',
              hourlyRate: 0,
              experienceYears: 0,
              availabilityStatus: AvailabilityStatus.AVAILABLE,
            });
          } else {
             throw new Error(expertRes.message || 'Failed to load expert profile');
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load profile data';
        setLoadError(message);
        toast.error(message);
        console.error('[AccountInfoForm] Load Error:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadProfileData();
    // Only re-run if basic user context changes (Login/Logout/Role Switch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileRole, user?.id, user?.role, resetUser, resetClient, resetExpert]);

  const onUserSubmit = async (data: UserUpdateFormValues) => {
    if (loadError || isInitialLoading || !user) return;
    setIsUserLoading(true);
    
    try {
      // Data is already trimmed and normalized by Zod schema transform/refinement if applicable,
      // but we ensure it matches backend requirements here.
      const response = await profileService.updateUser(data);
      
      if (response.success && response.data) {
        // Update store with new name for Topbar consistency
        setUser({ 
          ...user, 
          fullName: response.data.fullName || data.fullName || user.fullName 
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
    } catch (error) {
      toast.error('A network error occurred while updating identity');
      console.error('[AccountInfoForm] User update error:', error);
    } finally {
      setIsUserLoading(false);
    }
  };

  const onClientSubmit = async (data: ClientProfileFormValues) => {
    if (loadError || isInitialLoading) return;
    setIsProfileLoading(true);
    try {
      const response = await profileService.updateClientProfile(data);
      if (response.success) {
        toast.success('Company profile updated');
        resetClient({
          companyName: response.data?.companyName || data.companyName || '',
          industry: response.data?.industry || data.industry || '',
          companySize: response.data?.companySize || data.companySize || '',
          website: response.data?.website || data.website || '',
          description: response.data?.description || data.description || '',
        });
      }
      else toast.error(response.message || 'Failed to update profile');
    } catch (error) {
      toast.error('An error occurred while updating company profile');
      console.error('[AccountInfoForm] Client profile update error:', error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onExpertSubmit = async (data: ExpertProfileFormValues) => {
    if (loadError || isInitialLoading) return;
    if (isExpertProfileMissing) {
      toast.error('Expert profile update is not available yet.');
      return;
    }

    setIsProfileLoading(true);
    try {
      const response = await profileService.updateExpertProfile(data);
      if (response.success) {
        setIsExpertProfileMissing(false);
        toast.success('Expertise profile submitted for admin review');
      }
      else toast.error(response.message || 'Failed to update profile');
    } catch (error) {
      toast.error('An error occurred while updating expert profile');
      console.error('[AccountInfoForm] Expert profile update error:', error);
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
        <div className="bg-rose-50 border border-rose-100 rounded-lg p-10 text-center max-w-2xl mx-auto my-10">
          <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-black text-rose-900 mb-2">Failed to load profile</h2>
          <p className="text-rose-600 font-medium">{loadError}</p>
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              onClick={() => window.location.reload()}
              className="px-6 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors h-11"
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
      {mode === 'account' && <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm relative overflow-hidden">
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
      </div>}

      {/* IDENTITY SETTINGS */}
      {mode === 'account' && <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm relative overflow-hidden">
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
            <Button type="submit" disabled={isUserLoading || isInitialLoading || !!loadError} variant="outline" className="rounded-lg px-6 h-10 font-bold border-slate-200 hover:border-primary hover:text-primary transition-all text-xs">
              {isUserLoading ? 'Saving...' : 'Update Identity'}
            </Button>
          </div>
        </form>
      </div>}

      {/* ROLE SPECIFIC SETTINGS */}
      {mode === 'account' && activeProfileRole === Role.CLIENT && (
        <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm relative overflow-hidden">
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
              <Button type="submit" disabled={isProfileLoading || isUserLoading || !!loadError} className="rounded-lg px-8 h-11 font-bold shadow-lg shadow-blue-100 uppercase tracking-wider text-xs">
                {isProfileLoading ? 'Saving...' : 'Update Business Profile'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {mode === 'expertise' && activeProfileRole === Role.EXPERT && (
        <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Code2 className="size-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Expertise Profile Review</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">These fields are sent to admin verification for your expert profile.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleExpertSubmit(onExpertSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Professional Headline</label>
                <Input {...registerExpert('title')} placeholder="Senior AI Research Engineer" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={!!loadError} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Hourly Rate (Aivora Coin)</label>
                <Input type="number" {...registerExpert('hourlyRate')} placeholder="0.00" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={!!loadError} />
                {expertErrors.hourlyRate && <p className="text-[10px] text-destructive font-bold ml-1">{expertErrors.hourlyRate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Experience (Years)</label>
                <Input type="number" {...registerExpert('experienceYears')} placeholder="0" className="h-11 rounded-lg bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" disabled={!!loadError} />
                {expertErrors.experienceYears && <p className="text-[10px] text-destructive font-bold ml-1">{expertErrors.experienceYears.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Availability Status</label>
                <select
                  {...registerExpert('availabilityStatus')}
                  className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none font-medium"
                  disabled={!!loadError}
                >
                  <option value={AvailabilityStatus.UNAVAILABLE}>Unavailable</option>
                  <option value={AvailabilityStatus.AVAILABLE}>Available</option>
                  <option value={AvailabilityStatus.BUSY}>Busy</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Professional Background</label>
               <textarea 
                  {...registerExpert('bio')}
                  placeholder="Detail your experience with LLMs, Computer Vision, etc..."
                  className="w-full min-h-[120px] p-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  disabled={!!loadError}
               />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-50">
              <Button type="submit" disabled={isProfileLoading || !!loadError} className="rounded-lg px-8 h-11 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 uppercase tracking-wider text-xs">
                {isProfileLoading ? 'Submitting...' : 'Submit Profile for Review'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
