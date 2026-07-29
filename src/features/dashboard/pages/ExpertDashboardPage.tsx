import { useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Briefcase, DollarSign, Clock, ChevronLeft, ChevronRight, Activity, Wallet, Target,
  FileText, MessageSquare, ListChecks, ShieldCheck, Sparkles
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { projectService } from '@/features/projects/services';
import { walletService } from '@/features/wallet/services';
import { proposalService } from '@/features/proposals/services';
import { servicesFeatureApi } from '@/features/services/services';
import { ServiceStatus } from '@/features/services/types';
import { JobInvitationsSection } from '@/features/jobs/components/JobInvitationsSection';
import { ProjectStatus } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth/store';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { AccountOverviewSection, type AccountOverviewCard } from '../components/AccountOverviewSection';
import {
  DASHBOARD_RECENT_PROJECTS_PAGE_SIZE,
  EXPERT_CREATE_SERVICE_PATH,
  EXPERT_FIND_WORK_PATH,
  EXPERT_PROFILE_PATH,
} from '../constants';

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

const getTotalCount = <T,>(response: PaginatedResponse<T> | undefined): number => (
  response?.metadata?.totalCount ?? response?.data?.length ?? 0
);

const getBaseCount = <T,>(response: BaseResponse<T[]> | undefined): number => (
  response?.data?.length ?? 0
);

const hasSuccessfulResponse = (response: { success?: boolean } | undefined): boolean => response?.success === true;

const getSafeDisplayName = (user: {
  id?: unknown;
  email?: unknown;
  fullName?: unknown;
  displayName?: unknown;
  firstName?: unknown;
  username?: unknown;
} | null | undefined) => {
  const email = typeof user?.email === 'string' ? user.email : '';
  const id = typeof user?.id === 'string' ? user.id : '';
  const emailName = email.split('@')[0]?.trim().toLowerCase();
  const invalidNames = new Set(['null', 'undefined', 'none', 'n/a', 'na']);
  const candidates = [user?.fullName, user?.displayName, user?.firstName, user?.username];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;

    const name = candidate.trim();
    const normalizedName = name.toLowerCase();

    if (
      name &&
      !invalidNames.has(normalizedName) &&
      !name.includes('@') &&
      normalizedName !== emailName &&
      name !== id
    ) {
      return name.split(/\s+/)[0] || 'there';
    }
  }

  return 'there';
};

export const ExpertDashboardPage = () => {
  const { user } = useAuthStore();
  const [recentProjectsPage, setRecentProjectsPage] = useState(0);

  const {
    data: projectsResponse,
    isLoading: isProjectsLoading,
    isSuccess: isProjectsSuccess,
  } = useQuery({
    queryKey: ['expertProjects'],
    queryFn: () => projectService.getProjects(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const {
    data: walletResponse,
    isLoading: isWalletLoading,
    isSuccess: isWalletSuccess,
  } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const {
    data: proposalsResponse,
    isLoading: isProposalsLoading,
    isSuccess: isProposalsSuccess,
  } = useQuery({
    queryKey: ['expertProposals', 'activity-count'],
    queryFn: proposalService.getMyProposals,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const {
    data: servicesResponse,
    isLoading: isServicesLoading,
    isSuccess: isServicesSuccess,
  } = useQuery({
    queryKey: ['expertServices', 'activity-count'],
    queryFn: servicesFeatureApi.getMyServices,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const projects = Array.isArray(projectsResponse?.data) ? projectsResponse.data : [];
  const wallet = walletResponse?.data;
  const walletBalance = getWalletBalance(wallet);
  const projectCount = getTotalCount(projectsResponse);
  const proposalCount = getTotalCount(proposalsResponse);
  const serviceCount = getBaseCount(servicesResponse);
  const publishedServiceCount = (servicesResponse?.data ?? [])
    .filter((service) => String(service.status).toUpperCase() === ServiceStatus.PUBLISHED)
    .length;
  
  const activeProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS);
  const totalRecentProjectPages = Math.max(1, Math.ceil(activeProjects.length / DASHBOARD_RECENT_PROJECTS_PAGE_SIZE));
  const currentRecentProjectPage = Math.min(recentProjectsPage, totalRecentProjectPages - 1);
  const visibleActiveProjects = activeProjects.slice(
    currentRecentProjectPage * DASHBOARD_RECENT_PROJECTS_PAGE_SIZE,
    currentRecentProjectPage * DASHBOARD_RECENT_PROJECTS_PAGE_SIZE + DASHBOARD_RECENT_PROJECTS_PAGE_SIZE
  );

  const isLoading = isProjectsLoading || isWalletLoading || isProposalsLoading || isServicesLoading;
  const activityQueriesSucceeded = isProjectsSuccess
    && isWalletSuccess
    && isProposalsSuccess
    && isServicesSuccess
    && hasSuccessfulResponse(projectsResponse)
    && hasSuccessfulResponse(walletResponse)
    && hasSuccessfulResponse(proposalsResponse)
    && hasSuccessfulResponse(servicesResponse);
  const isNewUser = activityQueriesSucceeded
    && projectCount === 0
    && proposalCount === 0
    && serviceCount === 0
    && walletBalance === 0;
  const displayName = getSafeDisplayName(user);
  const summaryCards: AccountOverviewCard[] = [
    {
      label: 'Available Balance',
      value: `${walletBalance.toLocaleString()} Aivora Coin`,
      description: 'Ready to withdraw',
      href: '/expert/wallet',
      action: 'Withdraw',
      icon: Wallet,
      iconClassName: 'text-primary',
      iconBgClassName: 'bg-blue-50',
    },
    {
      label: 'Active Projects',
      value: activeProjects.length.toString(),
      description: 'Currently in progress',
      href: '/expert/my-jobs',
      action: 'View all',
      icon: Activity,
      iconClassName: 'text-amber-600',
      iconBgClassName: 'bg-amber-50',
    },
    {
      label: 'Submitted Proposals',
      value: proposalCount.toString(),
      description: 'Sent to client job posts',
      href: '/expert/proposals',
      action: 'View proposals',
      icon: Briefcase,
      iconClassName: 'text-primary',
      iconBgClassName: 'bg-blue-50',
    },
    {
      label: 'Published Services',
      value: publishedServiceCount.toString(),
      description: 'Visible to clients',
      href: '/expert/services',
      action: 'View services',
      icon: Sparkles,
      iconClassName: 'text-teal-600',
      iconBgClassName: 'bg-teal-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isNewUser) {
    const pathCards = [
      {
        title: 'Find Work',
        description: 'Choose this path when you want to apply for posted AI projects. Browse client jobs and send proposals for work that fits your expertise.',
        steps: [
          'Browse open jobs',
          'Review client requirements',
          'Send a proposal',
          'Win work and start',
        ],
        note: 'A project is created after a client accepts your proposal.',
        cta: 'Find Your First Job',
        path: EXPERT_FIND_WORK_PATH,
        icon: Search,
        accentClassName: 'bg-primary',
        iconClassName: 'text-primary',
        buttonVariant: 'primary' as const,
        buttonClassName: 'h-11 px-6 shadow-sm shadow-primary/10',
      },
      {
        title: 'Create a Service',
        description: 'Choose this path when you want to package your AI expertise. Publish a service so clients can request your ready-made offer.',
        steps: [
          'Define your service',
          'Add packages and pricing',
          'Publish your offer',
          'Review client requests',
        ],
        note: 'A project is created after a client accepts your final offer.',
        cta: 'Create Your First Service',
        path: EXPERT_CREATE_SERVICE_PATH,
        icon: Sparkles,
        accentClassName: 'bg-teal-500',
        iconClassName: 'text-teal-600',
        buttonVariant: 'outline' as const,
        buttonClassName: 'h-11 border-teal-200 bg-white px-6 text-teal-700 shadow-none hover:bg-teal-50 focus-visible:ring-teal-200',
      },
    ];
    const projectWorkspaceFeatures = [
      {
        title: 'Milestones',
        description: 'Plan work stages, deadlines, and payment amounts.',
        icon: ListChecks,
      },
      {
        title: 'Messages',
        description: 'Discuss requirements and share project updates.',
        icon: MessageSquare,
      },
      {
        title: 'Submitted Deliverables',
        description: 'Submit work and respond to client review.',
        icon: FileText,
      },
      {
        title: 'Staged Milestone Payments',
        description: 'Receive 30% when work begins and the remaining payment after deliverable approval. A 10% platform commission applies.',
        icon: ShieldCheck,
      },
    ];

    return (
      <div className="space-y-7 animate-in fade-in duration-500">
        <section>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome to Aivora, {displayName}</h1>
          <p className="mt-2 text-base font-medium text-slate-500">
            Turn your AI expertise into client projects and packaged services.
          </p>

          <div className="mt-7">
            <AccountOverviewSection cards={summaryCards} />
          </div>

          <div className="mt-7">
            <JobInvitationsSection />
          </div>

          <h2 className="mt-7 text-lg font-bold text-slate-900">Choose how to get started</h2>

          <div className="mt-5 rounded-2xl bg-white/70 px-5 py-6 sm:px-6 lg:px-7">
            <div className="grid gap-y-7 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:gap-x-8">
              {pathCards.map((card, index) => {
                const CardIcon = card.icon;

                return (
                  <Fragment key={card.title}>
                    {index === 1 && (
                      <div className="hidden self-stretch py-1 lg:block">
                        <div className="h-full w-px bg-slate-200/80" aria-hidden="true" />
                      </div>
                    )}
                    <section
                      className={`flex flex-col ${index === 1 ? 'border-t border-slate-200 pt-7 lg:border-t-0 lg:pt-0' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-5 w-1 rounded-full ${card.accentClassName}`} aria-hidden="true" />
                        <CardIcon className={`size-5 shrink-0 ${card.iconClassName}`} />
                        <h2 className="text-xl font-bold text-slate-900">{card.title}</h2>
                      </div>

                      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 lg:min-h-[72px]">
                        {card.description}
                      </p>

                      <ul className="mt-5 flex-1 space-y-2.5">
                        {card.steps.map((step, index) => (
                          <li key={step} className="flex items-center gap-3 text-sm leading-6 text-slate-700">
                            <span className="w-6 shrink-0 text-xs font-bold tabular-nums text-slate-400">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>

                      <p className="mt-5 text-xs font-medium leading-5 text-slate-500">{card.note}</p>

                      <Button asChild variant={card.buttonVariant} className={`mt-5 w-full rounded-full sm:w-fit sm:self-start ${card.buttonClassName}`}>
                        <Link to={card.path}>{card.cta}</Link>
                      </Button>
                    </section>
                  </Fragment>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            <Target className="size-4 shrink-0 text-primary" />
            <span>Want clients to trust your profile?</span>
            <Link to={EXPERT_PROFILE_PATH} className="inline-flex items-center gap-1 font-black text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              Complete Profile <ChevronRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="rounded-2xl bg-white/70 px-5 py-6 sm:px-6 lg:px-7">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900">Manage your project in one workspace</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Once a project begins, track progress, communicate with your client, submit deliverables, and manage milestone payments in one place.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {projectWorkspaceFeatures.map((feature) => {
              const FeatureIcon = feature.icon;

              return (
                <div key={feature.title} className="flex items-start gap-3 rounded-lg bg-slate-50/75 p-3">
                  <FeatureIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{feature.title}</h3>
                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Find Work',
      description: 'Browse open jobs that match your skills.',
      href: EXPERT_FIND_WORK_PATH,
      icon: Search,
      iconClassName: 'text-primary',
      iconBgClassName: 'bg-blue-50',
    },
    {
      title: 'Create Service',
      description: 'Package expertise for client requests.',
      href: EXPERT_CREATE_SERVICE_PATH,
      icon: Sparkles,
      iconClassName: 'text-teal-600',
      iconBgClassName: 'bg-teal-50',
    },
    {
      title: 'My Proposals',
      description: 'Track submitted bids and outcomes.',
      href: '/expert/proposals',
      icon: Briefcase,
      iconClassName: 'text-primary',
      iconBgClassName: 'bg-blue-50',
    },
    {
      title: 'Withdraw Funds',
      description: 'Manage available earnings.',
      href: '/expert/wallet',
      icon: DollarSign,
      iconClassName: 'text-emerald-600',
      iconBgClassName: 'bg-emerald-50',
    },
    {
      title: 'Complete Profile',
      description: 'Keep profile and verified skills current.',
      href: EXPERT_PROFILE_PATH,
      icon: Target,
      iconClassName: 'text-primary',
      iconBgClassName: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-500">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome back, {displayName}</h1>
          <p className="mt-2 text-base font-medium text-slate-500">Here is what is happening with your projects today.</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-sm shadow-primary/10">
          <Link to={EXPERT_FIND_WORK_PATH} className="flex items-center gap-2">
            <Search className="size-4" />
            Find Work
          </Link>
        </Button>
      </section>

      <AccountOverviewSection cards={summaryCards} />

      <JobInvitationsSection />

      <div className="grid gap-7 xl:grid-cols-[minmax(0,65fr)_minmax(320px,35fr)]">
        <section className="rounded-2xl bg-white/70 px-5 py-6 sm:px-6 lg:px-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Your Active Jobs</h2>
            <Link to="/expert/my-jobs" className="text-sm font-black text-primary hover:underline">See all</Link>
          </div>
          
          <div className="mt-5 overflow-hidden rounded-lg bg-slate-50/75">
            {activeProjects.length > 0 ? (
              <div className="divide-y divide-slate-200/70">
                {visibleActiveProjects.map((project) => (
                  <div key={project.id} className="flex flex-col gap-4 p-4 transition-colors hover:bg-white/70 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                        <Activity className="size-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">{project.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="size-3" /> Started {new Date(project.startDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1 font-bold text-emerald-600"><DollarSign className="size-3" /> {project.totalBudget.toLocaleString()} Aivora Coin</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full rounded-full border-slate-200 bg-white sm:w-fit">
                      <Link to={`/expert/projects/${project.id}/workspace`}>
                        Enter Workspace
                      </Link>
                    </Button>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 bg-white/50 px-4 py-3">
                  <span className="text-xs font-bold text-slate-400">
                    Page {currentRecentProjectPage + 1} of {totalRecentProjectPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label="Previous active jobs page"
                      disabled={currentRecentProjectPage === 0}
                      onClick={() => setRecentProjectsPage((page) => Math.max(page - 1, 0))}
                      className="size-8 rounded-full border-slate-200 bg-white p-0 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label="Next active jobs page"
                      disabled={currentRecentProjectPage >= totalRecentProjectPages - 1}
                      onClick={() => setRecentProjectsPage((page) => Math.min(page + 1, totalRecentProjectPages - 1))}
                      className="size-8 rounded-full border-slate-200 bg-white p-0 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Briefcase className="mx-auto mb-3 size-9 text-slate-300" />
                <h3 className="text-base font-bold text-slate-900">No active jobs</h3>
                <p className="mx-auto mt-1 max-w-sm text-sm font-medium text-slate-500">You are not working on any projects right now.</p>
                <Button asChild size="sm" className="mt-4 rounded-full shadow-sm shadow-primary/10">
                  <Link to={EXPERT_FIND_WORK_PATH}>Find New Work</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white/70 px-5 py-6 sm:px-6 lg:px-7">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900">Discover and quick actions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Move between job discovery, services, proposals, earnings, and profile updates.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;

              return (
                <Link key={action.title} to={action.href} className="group flex min-h-[68px] items-center justify-between gap-3 rounded-lg bg-slate-50/75 px-3 py-2.5 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${action.iconBgClassName}`}>
                      <ActionIcon className={`size-4 ${action.iconClassName}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary">{action.title}</h3>
                      <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{action.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-slate-300 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
