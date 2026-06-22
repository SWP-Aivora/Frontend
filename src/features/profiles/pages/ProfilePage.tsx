import { AccountInfoForm } from '../components/AccountInfoForm';
import { useAuthStore } from '@/features/auth/store';
import { User, Shield, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const ASSETS = {
  heroGlow: "https://www.figma.com/api/mcp/asset/07fcdf20-e40b-4098-b7e5-350569312fbe",
};

type TabId = 'account' | 'security';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Hero Overview - Compact Version */}
      <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -left-20 -top-20 size-64 pointer-events-none opacity-30">
           <img src={ASSETS.heroGlow} alt="" className="size-full" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="size-24 rounded-xl bg-gradient-to-br from-primary to-brand-blue-dark flex items-center justify-center shadow-lg shadow-primary/20 relative z-10 overflow-hidden">
               {user?.fullName ? (
                 <span className="text-3xl font-black text-white uppercase">{user.fullName.charAt(0)}</span>
               ) : user?.email ? (
                 <span className="text-3xl font-black text-white uppercase">{user.email.charAt(0)}</span>
               ) : (
                 <User className="size-12 text-white" />
               )}
            </div>
            <div className="absolute -inset-2 bg-primary/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <button className="absolute -bottom-1 -right-1 bg-white size-8 rounded-lg shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-primary transition-colors z-20">
              <Settings className="size-4" />
            </button>
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left space-y-2">
             <div className="inline-flex items-center px-2.5 py-0.5 bg-primary/5 rounded-full border border-primary/10">
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Active Member</span>
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">
               Welcome, <span className="text-primary">{(user?.fullName || user?.email || 'User').split(' ')[0]}</span>!
             </h1>
             <p className="text-base text-slate-500 font-medium max-w-xl leading-snug">
               Manage your account details and security preferences. 
               Your status is <span className="text-emerald-600 font-bold">Verified</span>.
             </p>
          </div>

          {/* Completion Status */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 text-center min-w-[150px]">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profile Strength</p>
             <p className="text-3xl font-black text-primary mb-1">86%</p>
             <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[86%] shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
             </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm flex flex-wrap gap-1.5 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 whitespace-nowrap",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'account' && <AccountInfoForm />}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl p-10 border border-slate-100 shadow-sm text-center">
             <Shield className="size-12 text-slate-200 mx-auto mb-4" />
             <h3 className="text-xl font-black text-slate-900 mb-1">Security Settings</h3>
             <p className="text-slate-500 text-sm font-medium mb-6">Password management and 2FA coming soon.</p>
             <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Last Update</p>
                   <p className="text-xs font-bold text-slate-700">20 days ago</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Sessions</p>
                   <p className="text-xs font-bold text-slate-700">2 active</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
