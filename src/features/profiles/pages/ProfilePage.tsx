import { AccountInfoForm } from '../components/AccountInfoForm';
import { useAuthStore } from '@/features/auth/store';
import { User, Shield, Bell, Settings, CreditCard, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const ASSETS = {
  heroGlow: "https://www.figma.com/api/mcp/asset/07fcdf20-e40b-4098-b7e5-350569312fbe",
};

type TabId = 'account' | 'security' | 'notifications' | 'billing' | 'activity';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Wallet', icon: CreditCard },
    { id: 'activity', label: 'Activity Log', icon: Activity },
  ] as const;

  return (
    <div className="space-y-10">
      {/* Hero Overview */}
      <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-20 -top-20 size-80 pointer-events-none opacity-40">
           <img src={ASSETS.heroGlow} alt="" className="size-full" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="size-32 rounded-[40px] bg-gradient-to-br from-primary to-brand-blue-dark flex items-center justify-center shadow-xl shadow-primary/20 relative z-10 overflow-hidden">
               {user?.fullName ? (
                 <span className="text-4xl font-black text-white uppercase">{user.fullName.charAt(0)}</span>
               ) : (
                 <User className="size-16 text-white" />
               )}
            </div>
            <div className="absolute -inset-2 bg-primary/10 rounded-[44px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <button className="absolute -bottom-2 -right-2 bg-white size-10 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-primary transition-colors z-20">
              <Settings className="size-5" />
            </button>
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left space-y-3">
             <div className="inline-flex items-center px-3 py-1 bg-primary/5 rounded-full border border-primary/10 mb-2">
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Member since 2026</span>
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">
               Howdy, <span className="text-primary">{user?.fullName?.split(' ')[0] || 'User'}</span>!
             </h1>
             <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
               Update your profile, security, and preferences to get the most out of AIVORA. 
               Your account is currently <span className="text-brand-success font-bold">Active</span>.
             </p>
          </div>

          {/* Completion Badge */}
          <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 text-center min-w-[180px]">
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Profile Status</p>
             <p className="text-4xl font-black text-primary mb-2">86%</p>
             <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[86%] shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
             </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-100 rounded-3xl p-2 shadow-sm flex flex-wrap gap-2 sticky top-24 z-20 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 whitespace-nowrap",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'account' && <AccountInfoForm />}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
             <Shield className="size-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-slate-900 mb-2">Security Settings</h3>
             <p className="text-slate-500 font-medium mb-8">Password management and 2FA coming soon.</p>
             <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Last Change</p>
                   <p className="text-sm font-bold text-slate-700">20 days ago</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sessions</p>
                   <p className="text-sm font-bold text-slate-700">2 active</p>
                </div>
             </div>
          </div>
        )}
        {['notifications', 'billing', 'activity'].includes(activeTab) && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-20 text-center">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Section: {activeTab}</p>
             <p className="text-slate-500 font-medium mt-2 italic text-sm">Design and logic for this section are under construction.</p>
          </div>
        )}
      </div>
    </div>
  );
};
