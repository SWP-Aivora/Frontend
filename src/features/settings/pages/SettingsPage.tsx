import { useState } from 'react';
import { useAppStore, type ThemeMode } from '@/app/store';
import { 
  Settings, 
  Bell, 
  Eye, 
  ShieldCheck,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Layout,
  Volume2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { toast } from 'sonner';

type TabId = 'appearance' | 'notifications' | 'language' | 'privacy';

export const SettingsPage = () => {
  const { theme, setTheme } = useAppStore();
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(theme);
  const [activeTab, setActiveTab] = useState<TabId>('appearance');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Layout },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'privacy', label: 'Privacy & System', icon: Eye },
  ] as const;

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTheme(selectedTheme);
      setIsLoading(false);
      toast.success('System preferences updated');
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="size-8 text-primary" /> System Settings
          </h1>
          <p className="text-slate-500 font-medium">Customize your AIVORA experience and interface behavior.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20"
        >
          {isLoading ? 'Updating...' : 'Apply Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 text-left",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-slate-500 hover:bg-white hover:text-primary border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md"
                )}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Layout className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Interface Appearance</h3>
                  <p className="text-sm text-slate-500">Customize how AIVORA looks on your device.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Theme Mode</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright' },
                      { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                    ].map((opt) => (
                      <button 
                        key={opt.id}
                        onClick={() => setSelectedTheme(opt.id as ThemeMode)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all group",
                          selectedTheme === opt.id ? "border-primary bg-primary/5 shadow-sm" : "border-slate-100 hover:border-slate-300"
                        )}
                      >
                        <opt.icon className={cn("size-5 mb-2 transition-colors", selectedTheme === opt.id ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                        <p className={cn("text-sm font-bold", selectedTheme === opt.id ? "text-primary" : "text-slate-900")}>{opt.label}</p>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                   <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="flex items-center gap-4">
                         <div className="size-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                            <Zap className="size-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">Reduced Motion</p>
                            <p className="text-xs text-slate-500">Minimize animations and transitions.</p>
                         </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" className="sr-only peer" />
                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                   </div>

                   <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="flex items-center gap-4">
                         <div className="size-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                            <Layout className="size-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">Compact Mode</p>
                            <p className="text-xs text-slate-500">Show more content with less whitespace.</p>
                         </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" className="sr-only peer" />
                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                <div className="size-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Bell className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">System Notifications</h3>
                  <p className="text-sm text-slate-500">Configure how and when you want to be notified.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'In-App Alerts', desc: 'Real-time toast notifications for system events.', icon: Bell },
                  { title: 'Email Notifications', desc: 'Project updates, proposal alerts, and system news.', icon: Globe },
                  { title: 'Message Alerts', desc: 'Instant notification for new chat messages.', icon: Smartphone },
                  { title: 'Sound Effects', desc: 'Play sounds for incoming alerts.', icon: Volume2 },
                  { title: 'Security & Auth', desc: 'Critical alerts about logins and security.', icon: ShieldCheck, mandatory: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="size-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                        <item.icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.mandatory || idx % 2 === 0} disabled={item.mandatory} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                <div className="size-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Globe className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Language & Region</h3>
                  <p className="text-sm text-slate-500">Set your preferred language and regional formats.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Interface Language</label>
                  <div className="w-full h-12 px-4 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-medium flex items-center text-slate-500">
                    English (US) - Unified Default
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Timezone</label>
                  <select className="w-full h-12 px-4 bg-slate-50/50 border border-slate-100 focus:bg-white rounded-xl text-sm font-medium appearance-none">
                    <option>(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                    <option>(GMT+00:00) UTC</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Currency Display</label>
                  <select className="w-full h-12 px-4 bg-slate-50/50 border border-slate-100 focus:bg-white rounded-xl text-sm font-medium appearance-none">
                    <option>USD ($)</option>
                    <option>VND (₫)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Eye className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Privacy & System</h3>
                  <p className="text-sm text-slate-500">Control system-level privacy and account visibility.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Search Engine Indexing</label>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Allow Indexing</p>
                      <p className="text-xs text-slate-500">Let search engines like Google index your public profile.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Auto-Save Feature</label>
                   <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div>
                         <p className="text-sm font-bold text-slate-900">Enable Auto-Save</p>
                         <p className="text-xs text-slate-500">Automatically save drafts as you type.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" defaultChecked className="sr-only peer" />
                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
