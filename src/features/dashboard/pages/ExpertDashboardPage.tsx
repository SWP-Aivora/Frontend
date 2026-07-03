import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Search, Briefcase, DollarSign, Clock, ChevronRight, Activity, Wallet, Target
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { projectService } from '@/features/projects/services';
import { walletService } from '@/features/wallet/services';
import { ProjectStatus } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth/store';

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

const getWalletBalance = (wallet: unknown): number => {
  if (!wallet || typeof wallet !== 'object') return 0;

  const record = wallet as Record<string, unknown>;
  const balance = [
    record.balance,
    record.Balance,
    record.availableBalance,
    record.AvailableBalance,
    record.walletBalance,
    record.WalletBalance,
    record.amount,
    record.Amount,
    record.coins,
    record.Coins,
    record.coin,
    record.Coin,
    record.xu,
    record.Xu,
  ].map(toNumber).find((value): value is number => value !== null);

  if (balance !== undefined) return balance;

  if (record.wallet && typeof record.wallet === 'object') {
    return getWalletBalance(record.wallet);
  }

  if (record.Wallet && typeof record.Wallet === 'object') {
    return getWalletBalance(record.Wallet);
  }

  return 0;
};

export const ExpertDashboardPage = () => {
  const { user } = useAuthStore();

  const { data: projectsResponse, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['expertProjects'],
    queryFn: () => projectService.getProjects(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const { data: walletResponse, isLoading: isWalletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const projects = Array.isArray(projectsResponse?.data) ? projectsResponse.data : [];
  const wallet = walletResponse?.data;
  const walletBalance = getWalletBalance(wallet);
  
  const activeProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS);
  const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED);

  const isLoading = isProjectsLoading || isWalletLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, {user?.fullName?.split(' ')[0] || 'Expert'}</h1>
          <p className="text-slate-500 font-medium mt-1">Here is your daily overview and recommended jobs.</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
          <Link to="/expert/jobs" className="flex items-center gap-2">
            <Search className="size-4" />
            Find Work
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-blue-dark rounded-2xl p-6 shadow-lg shadow-blue-900/20 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 size-24 bg-white/10 rounded-full blur-xl" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-blue-100 font-bold text-sm uppercase tracking-wider mb-1">Available Balance</p>
              <h3 className="text-4xl font-black">{walletBalance.toLocaleString()} Aivora Coin</h3>
            </div>
            <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Wallet className="size-6 text-white" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center relative z-10">
            <span className="text-sm font-medium text-blue-50">Ready to withdraw</span>
            <Link to="/expert/wallet" className="text-sm font-bold text-white flex items-center gap-1 hover:underline">
              Withdraw <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Active Contracts</p>
              <h3 className="text-4xl font-black text-slate-900">{activeProjects.length}</h3>
            </div>
            <div className="size-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Activity className="size-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Currently in progress</span>
            <Link to="/expert/my-jobs" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              View all <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Completed Jobs</p>
              <h3 className="text-4xl font-black text-slate-900">{completedProjects.length}</h3>
            </div>
            <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Target className="size-6 text-primary" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Successfully delivered</span>
            <Link to="/expert/profile" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              View profile <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Your Active Jobs</h2>
            <Link to="/expert/my-jobs" className="text-sm font-bold text-primary hover:underline">See all</Link>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            {activeProjects.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {activeProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                    <div className="flex items-start gap-4">
                      <div className="size-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Activity className="size-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{project.title}</h4>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="size-3" /> Started {new Date(project.startDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1 text-emerald-600 font-bold"><DollarSign className="size-3" /> {project.totalBudget.toLocaleString()} Aivora Coin</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-full border-slate-200">
                      <Link to={`/expert/projects/${project.id}/workspace`}>
                        Enter Workspace
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Briefcase className="size-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No active jobs</h3>
                <p className="text-sm text-slate-500 mb-4">You are not working on any projects right now.</p>
                <Button asChild size="sm" className="rounded-full shadow-md shadow-primary/20">
                  <Link to="/expert/jobs">Find New Work</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recommended For You */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900">Get Noticed</h2>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative overflow-hidden">
            <h3 className="font-bold text-slate-900 mb-2">Update Your Profile</h3>
            <p className="text-sm text-slate-500 mb-4">Experts with a complete profile and verified skills get hired 3x faster.</p>
            <Button asChild variant="outline" className="w-full rounded-full border-slate-200">
              <Link to="/expert/profile">Complete Profile</Link>
            </Button>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/expert/proposals" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Briefcase className="size-4 text-primary" />
                  </div>
                  <span className="font-bold text-sm text-slate-700 group-hover:text-primary">My Proposals</span>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-primary" />
              </Link>
              <Link to="/expert/wallet" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="size-4 text-emerald-600" />
                  </div>
                  <span className="font-bold text-sm text-slate-700 group-hover:text-primary">Withdraw Funds</span>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
