import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Briefcase, DollarSign, Clock, ChevronRight, Activity, Wallet, Star
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { projectService } from '@/features/projects/services';
import { walletService } from '@/features/wallet/services';
import { ProjectStatus } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth/store';

export const ClientDashboardPage = () => {
  const { user } = useAuthStore();

  const { data: projectsResponse, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['clientProjects'],
    queryFn: () => projectService.getProjects(),
  });

  const { data: walletResponse, isLoading: isWalletLoading } = useQuery({
    queryKey: ['walletMe'],
    queryFn: () => walletService.getWallet(),
  });

  const projects = projectsResponse?.data || [];
  const wallet = walletResponse?.data;
  
  const activeProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS || p.status === ProjectStatus.PENDING_FUNDING);
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, {user?.fullName?.split(' ')[0] || 'Client'}</h1>
          <p className="text-slate-500 font-medium mt-1">Here is what's happening with your projects today.</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
          <Link to="/client/post-job" className="flex items-center gap-2">
            <Plus className="size-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-primary rounded-3xl p-6 shadow-lg shadow-primary/20 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 size-24 bg-white/10 rounded-full blur-xl" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-blue-100 font-bold text-sm uppercase tracking-wider mb-1">Wallet Balance</p>
              <h3 className="text-4xl font-black">${(wallet?.balance || 0).toLocaleString()}</h3>
            </div>
            <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Wallet className="size-6 text-white" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center relative z-10">
            <span className="text-sm font-medium text-blue-50">Manage your funds</span>
            <Link to="/client/wallet" className="text-sm font-bold text-white flex items-center gap-1 hover:underline">
              Top up <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Active Projects</p>
              <h3 className="text-4xl font-black text-slate-900">{activeProjects.length}</h3>
            </div>
            <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Activity className="size-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Currently running</span>
            <Link to="/client/projects" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              View all <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Completed</p>
              <h3 className="text-4xl font-black text-slate-900">{completedProjects.length}</h3>
            </div>
            <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="size-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Successfully delivered</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Recent Projects</h2>
            <Link to="/client/projects" className="text-sm font-bold text-primary hover:underline">See all</Link>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            {activeProjects.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {activeProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                    <div className="flex items-start gap-4">
                      <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Briefcase className="size-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{project.title}</h4>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="size-3" /> {new Date(project.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1 text-emerald-600 font-bold"><DollarSign className="size-3" /> {project.totalBudget.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-full border-slate-200">
                      <Link to={project.status === ProjectStatus.PENDING_FUNDING ? `/client/projects/${project.id}/proposals` : `/client/projects/${project.id}/workspace`}>
                        {project.status === ProjectStatus.PENDING_FUNDING ? 'View Proposals' : 'Workspace'}
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Briefcase className="size-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No active projects</h3>
                <p className="text-sm text-slate-500 mb-4">You don't have any running projects yet.</p>
                <Button asChild size="sm" className="rounded-full shadow-md shadow-primary/20">
                  <Link to="/client/post-job">Post a Job</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Explore Experts / Quick Links */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900">Explore</h2>
          
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
            <div className="absolute -right-4 -bottom-4 size-32 bg-white/5 rounded-full blur-2xl" />
            <Search className="size-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-black mb-2 relative z-10">Find Top AI Experts</h3>
            <p className="text-sm text-slate-300 mb-6 relative z-10">Browse our vetted marketplace of specialized AI and automation experts.</p>
            <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-50 rounded-full font-bold relative z-10">
              <Link to="/client/experts">Search Directory</Link>
            </Button>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/client/wallet" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="size-4 text-emerald-600" />
                  </div>
                  <span className="font-bold text-sm text-slate-700 group-hover:text-primary">Deposit Funds</span>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-primary" />
              </Link>
              <Link to="/client/profile" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Star className="size-4 text-primary" />
                  </div>
                  <span className="font-bold text-sm text-slate-700 group-hover:text-primary">Update Profile</span>
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
