import { useState } from 'react';
import { useAppStore, type ThemeMode } from '@/app/store';
import { 
  Settings, 
  ShieldCheck,
  Globe,
  Moon,
  Sun,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { toast } from 'sonner';
import { PolicyDialog } from '@/features/auth/components/PolicyDialog';

export const SettingsPage = () => {
  const { theme, setTheme } = useAppStore();
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(theme);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTheme(selectedTheme);
      setIsLoading(false);
      toast.success('System preferences updated');
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
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
          className="rounded-lg px-8 h-12 font-bold shadow-lg shadow-primary/20"
        >
          {isLoading ? 'Updating...' : 'Apply Changes'}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-6">
        <section className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
            <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Layout className="size-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Interface Appearance</h3>
              <p className="text-sm text-slate-500">Customize how AIVORA looks on your device.</p>
            </div>
          </div>

          <div className="space-y-3">
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
                      "p-3 rounded-lg border text-left transition-all group",
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
          </div>
        </section>

        <section className="space-y-5 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
            <div className="size-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Globe className="size-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Language & Region</h3>
              <p className="text-sm text-slate-500">Set your preferred language and regional formats.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Interface Language</label>
              <div className="w-full h-11 px-4 bg-slate-50/50 border border-slate-100 rounded-lg text-sm font-medium flex items-center text-slate-900">
                English
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Timezone</label>
              <div className="w-full h-11 px-4 bg-slate-50/50 border border-slate-100 rounded-lg text-sm font-medium flex items-center text-slate-900">
                Asia/Ho_Chi_Minh, Viet Nam (UTC+07:00)
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Currency Display</label>
              <div className="w-full h-11 px-4 bg-slate-50/50 border border-slate-100 rounded-lg text-sm font-medium flex items-center text-slate-900">
                Aivora Coin
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
            <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Terms & Privacy</h3>
              <p className="text-sm text-slate-500">Review the platform policies that govern your AIVORA account.</p>
            </div>
          </div>

          <div className="space-y-3 text-sm font-medium leading-6 text-slate-600">
            <p>
              Read the rules for using AIVORA, including accounts, projects, payments, disputes, and platform responsibilities in the{' '}
              <PolicyDialog type="terms">
                <button type="button" className="font-black text-primary hover:underline">
                  Terms of Service
                </button>
              </PolicyDialog>
              .
            </p>
            <p>
              Learn how AIVORA handles account, profile, project, wallet, message, and dispute information in the{' '}
              <PolicyDialog type="privacy">
                <button type="button" className="font-black text-primary hover:underline">
                  Privacy Policy
                </button>
              </PolicyDialog>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
