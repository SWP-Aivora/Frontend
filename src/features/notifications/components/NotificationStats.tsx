import { Bell, Activity, CreditCard, FolderOpen } from 'lucide-react';

export const NotificationStats = ({ unreadCount }: { unreadCount: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard 
        icon={<Bell className="size-5 text-primary" />} 
        value="--" 
        label="All Notifications" 
        subtext="History" 
      />
      <StatCard 
        icon={<Bell className="size-5 text-blue-500" />} 
        value={unreadCount.toString()} 
        label="Unread" 
        subtext="Needs attention" 
      />
      <StatCard 
        icon={<Activity className="size-5 text-orange-500" />} 
        value="--" 
        label="Action Required" 
        subtext="Review before closing" 
      />
      <StatCard 
        icon={<FolderOpen className="size-5 text-emerald-500" />} 
        value="--" 
        label="Project Updates" 
        subtext="Milestones and files" 
      />
      <StatCard 
        icon={<CreditCard className="size-5 text-indigo-500" />} 
        value="--" 
        label="Payment Updates" 
        subtext="Escrow and releases" 
      />
    </div>
  );
};

const StatCard = ({ icon, value, label, subtext }: { icon: React.ReactNode, value: string, label: string, subtext: string }) => (
  <div className="bg-white border border-slate-200 rounded-[18px] p-4 shadow-sm flex flex-col justify-center h-24 relative overflow-hidden">
    <div className="absolute right-4 top-4 bg-slate-50 p-2 rounded-xl">
      {icon}
    </div>
    <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
    <p className="text-[11px] font-semibold text-slate-600 mt-2">{label}</p>
    <p className="text-[10px] font-medium text-slate-400 mt-1">{subtext}</p>
  </div>
);
