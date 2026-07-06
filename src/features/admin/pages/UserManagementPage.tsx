import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { AdminPageTitle } from '../components/AdminPageTitle';
import { MetricsSummaryCard } from '../components/MetricsSummaryCard';
import { parseAdminApiDate } from '../utils/date';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Users, 
  UserCheck, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

// Status and Role normalization helpers
const normalizeStatus = (status: string) => String(status ?? '').toUpperCase();
const normalizeRole = (role: string) => String(role ?? '').toUpperCase();

const isUserActive = (status: string) => normalizeStatus(status) === 'ACTIVE';
const isUserSuspended = (status: string) => normalizeStatus(status) === 'SUSPENDED';
const formatStatusLabel = (status: string) => {
  const normalized = normalizeStatus(status);
  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
};
const formatPercent = (value: number) => `${Math.round(value)}%`;
const formatDateTime = (value?: string | null) => {
  const date = parseAdminApiDate(value);
  return date ? date.toLocaleString() : 'Not provided';
};

interface UserDistributionSlice {
  label: string;
  count: number;
  percentage: number;
  colorClass: string;
  color: string;
}

interface UserDistributionChartProps {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalClients: number;
  totalExperts: number;
}

const polarToCartesian = (center: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  };
};

const createPieSlicePath = (center: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(center, radius, endAngle);
  const end = polarToCartesian(center, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${center} ${center}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
};

const UserDistributionChart = ({
  totalUsers,
  activeUsers,
  suspendedUsers,
  totalClients,
  totalExperts,
}: UserDistributionChartProps) => {
  const getPercentage = (count: number) => totalUsers > 0 ? (count / totalUsers) * 100 : 0;
  const totalAdmins = Math.max(0, totalUsers - totalClients - totalExperts);
  const center = 110;
  const radius = 88;
  const slices: UserDistributionSlice[] = [
    {
      label: 'Clients',
      count: totalClients,
      percentage: getPercentage(totalClients),
      colorClass: 'bg-blue-600',
      color: '#2563EB',
    },
    {
      label: 'Experts',
      count: totalExperts,
      percentage: getPercentage(totalExperts),
      colorClass: 'bg-teal-500',
      color: '#14B8A6',
    },
    {
      label: 'Admins',
      count: totalAdmins,
      percentage: getPercentage(totalAdmins),
      colorClass: 'bg-violet-600',
      color: '#7C3AED',
    },
  ];
  let accumulatedAngle = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full rounded-lg border border-slate-100 bg-slate-50/40 p-5 lg:p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] items-center gap-6">
            <div className="mx-auto w-full max-w-[300px] text-center">
              <h3 className="text-[16px] font-black text-slate-900">System User Distribution</h3>
              <p className="text-xs font-medium text-slate-400 mt-1 mb-5">Global users by account group</p>
              <svg viewBox="0 0 220 220" role="img" aria-label="User role distribution pie chart" className="w-full">
                {totalUsers === 0 && <circle cx={center} cy={center} r={radius} className="fill-slate-100" />}
                {slices.map((slice) => {
                  if (slice.count <= 0 || totalUsers <= 0) return null;

                  const sliceAngle = (slice.percentage / 100) * 360;
                  const startAngle = accumulatedAngle;
                  const endAngle = accumulatedAngle + sliceAngle;
                  const middleAngle = startAngle + sliceAngle / 2;
                  const labelPosition = polarToCartesian(center, radius * 0.58, middleAngle);
                  accumulatedAngle = endAngle;

                  return (
                    <g key={slice.label}>
                      {slice.percentage >= 99.99 ? (
                        <circle cx={center} cy={center} r={radius} fill={slice.color} />
                      ) : (
                        <path
                          d={createPieSlicePath(center, radius, startAngle, endAngle)}
                          fill={slice.color}
                          stroke="#ffffff"
                          strokeWidth="4"
                        />
                      )}
                      <text
                        x={labelPosition.x}
                        y={labelPosition.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-white text-[12px] font-black"
                      >
                        {slice.percentage >= 6 ? formatPercent(slice.percentage) : ''}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="mt-4 inline-flex items-baseline justify-center gap-2 rounded-full bg-white border border-slate-100 px-4 py-2 shadow-sm">
                <span className="text-lg font-black text-blue-600">{totalUsers.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-400">Total Users</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Legend</p>
              {slices.map((slice) => (
                <div key={slice.label} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn('size-3 rounded-full shrink-0', slice.colorClass)} />
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-700">{slice.label}</p>
                      <p className="text-xs font-semibold text-slate-400">{slice.count.toLocaleString()} users</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid h-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 content-stretch">
          <MetricsSummaryCard
            label="Total Users"
            value={totalUsers.toLocaleString()}
            secondaryInfo="System wide"
            icon={Users}
            variant="blue"
            className="p-3 min-h-[76px]"
          />
          <MetricsSummaryCard
            label="Active Users"
            value={activeUsers.toLocaleString()}
            secondaryInfo="Active (filtered)"
            icon={UserCheck}
            variant="green"
            className="p-3 min-h-[76px]"
          />
          <MetricsSummaryCard
            label="Suspended"
            value={suspendedUsers.toString()}
            secondaryInfo="Suspended (filtered)"
            icon={ShieldAlert}
            variant="red"
            className="p-3 min-h-[76px]"
          />
          <MetricsSummaryCard
            label="Clients"
            value={totalClients.toLocaleString()}
            secondaryInfo="Global count"
            icon={Users}
            variant="blue"
            className="p-3 min-h-[76px]"
          />
          <MetricsSummaryCard
            label="Experts"
            value={totalExperts.toLocaleString()}
            secondaryInfo="Global count"
            icon={Users}
            variant="blue"
            className="p-3 min-h-[76px]"
          />
      </div>
    </div>
  );
};

export const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  // Fetch a large dataset to perform client-side filtering/sorting/pagination as requested
  const { data: usersData, isLoading: isLoadingUsers, isError: isErrorUsers, error: errorUsers } = useAdminUsers({ 
    PageIndex: 1, 
    PageSize: 1000 // Fetch "full" dataset for FE-side logic
  });
  const { data: statsData, isLoading: isLoadingStats } = useAdminDashboard();

  const isLoading = isLoadingUsers || isLoadingStats;
  const isError = isErrorUsers;
  const error = errorUsers;

  // Process and sort users from the FULL dataset
  const filteredAndSortedUsers = useMemo(() => {
    if (!usersData?.users) return [];
    
    let filtered = [...usersData.users];

    // 1. Filter by Role
    if (roleFilter !== 'All') {
      filtered = filtered.filter(u => normalizeRole(u.role) === normalizeRole(roleFilter));
    }

    // 2. Filter by Status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(u => normalizeStatus(u.status) === normalizeStatus(statusFilter));
    }

    // 3. Search by name, email, role, or ID
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.fullName.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term) || 
        u.role.toLowerCase().includes(term) || 
        u.id.toLowerCase().includes(term)
      );
    }

    // 4. Sort: ACTIVE first, then newest user update/create date first
    return filtered.sort((a, b) => {
      const aActive = isUserActive(a.status) ? 1 : 0;
      const bActive = isUserActive(b.status) ? 1 : 0;
      
      if (aActive !== bActive) return bActive - aActive; // Active (1) before others (0)

      const aDate = parseAdminApiDate(a.updatedAt || a.createdAt)?.getTime() ?? 0;
      const bDate = parseAdminApiDate(b.updatedAt || b.createdAt)?.getTime() ?? 0;
      return bDate - aDate;
    });
  }, [usersData?.users, roleFilter, statusFilter, searchTerm]);

  // Derived metrics from the FULL FILTERED dataset
  const metrics = useMemo(() => {
    return filteredAndSortedUsers.reduce((acc, user) => {
      if (isUserActive(user.status)) acc.active++;
      if (isUserSuspended(user.status)) acc.suspended++;
      return acc;
    }, { active: 0, suspended: 0 });
  }, [filteredAndSortedUsers]);

  // Pagination Logic
  const PAGE_SIZE = 10;
  const totalFiltered = filteredAndSortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPageIndex - 1) * PAGE_SIZE;
    return filteredAndSortedUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedUsers, currentPageIndex]);

  // Reset page when filters change
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setCurrentPageIndex(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPageIndex(1);
  };

  // Map global stats from dashboard summary
  const globalStats = useMemo(() => {
    if (!statsData) return null;
    
    const clients = statsData.userOverview.find(u => normalizeRole(u.role) === 'CLIENTS' || normalizeRole(u.role) === 'CLIENT')?.count || 0;
    const experts = statsData.userOverview.find(u => normalizeRole(u.role) === 'EXPERTS' || normalizeRole(u.role) === 'EXPERT')?.count || 0;
    
    return {
      totalUsers: statsData.totalUsers,
      totalClients: clients,
      totalExperts: experts,
    };
  }, [statsData]);

  if (isLoading && !usersData) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-lg p-10 text-center max-w-2xl mx-auto my-10">
        <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-black text-rose-900 mb-2">Failed to load users</h2>
        <p className="text-rose-600 font-medium">{(error as Error)?.message || 'Something went wrong while fetching users.'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      <AdminPageTitle
        title="Manage Platform Users"
        description="Search, filter, suspend, activate, and audit clients, experts, and admins in one operational surface."
      />

      <UserDistributionChart
        totalUsers={globalStats?.totalUsers || 0}
        activeUsers={metrics.active}
        suspendedUsers={metrics.suspended}
        totalClients={globalStats?.totalClients || 0}
        totalExperts={globalStats?.totalExperts || 0}
      />

      <div className="space-y-4">
        {/* Main Table */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-lg shadow-sm flex flex-col overflow-hidden">
            {/* Table Header with Filters */}
            <div className="p-5 border-b border-slate-50 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-[16px] font-bold text-slate-900">All users</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Page {currentPageIndex} of {totalPages} • {totalFiltered.toLocaleString()} match results</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-3">
                {/* Search */}
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 w-full lg:flex-1 lg:min-w-0">
                  <Search className="size-4 text-slate-400 absolute left-4" />
                  <input 
                    type="text" 
                    placeholder="Search name, email, role, or ID..." 
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs ml-6 w-full text-slate-700 placeholder:text-slate-400 font-medium"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-end gap-2 w-full lg:w-auto lg:shrink-0">
                  <select 
                    value={roleFilter}
                    onChange={(e) => handleFilterChange(setRoleFilter, e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer w-full sm:w-auto lg:min-w-[128px]"
                  >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Client">Client</option>
                    <option value="Expert">Expert</option>
                  </select>

                  <select 
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer w-full sm:w-auto lg:min-w-[146px]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="DELETED">Deleted</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">User</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Verification</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "size-9 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-sm",
                            user.role === 'Admin' ? "bg-purple-500" :
                            user.role === 'Client' ? "bg-blue-500" : "bg-emerald-500"
                          )}>
                            {user.initials}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">{user.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                          user.role === 'Admin' ? "bg-purple-50 text-purple-600 border-purple-100" :
                          user.role === 'Client' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                          normalizeStatus(user.status) === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                          normalizeStatus(user.status) === 'SUSPENDED' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {formatStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                          user.verificationState === 'Verified' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          user.verificationState === 'Rejected' ? "bg-rose-50 text-rose-600 border-rose-100" :
                          user.verificationState === 'Internal' ? "bg-purple-50 text-purple-600 border-purple-100" :
                          user.verificationState === 'Review' ? "bg-orange-50 text-orange-600 border-orange-100" :
                          "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {user.verificationState}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-slate-600">
                        {formatDateTime(user.lastLoginAt)}
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Users className="size-8 opacity-20" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No users match your filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-center gap-6">
               <button 
                 onClick={() => setCurrentPageIndex(p => Math.max(1, p - 1))} 
                 className="size-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none active:scale-95" 
                 disabled={currentPageIndex === 1}
               >
                 <ChevronLeft className="size-5" />
               </button>
               <span className="text-xs font-black text-slate-500 tracking-[0.2em] uppercase">Page {currentPageIndex} of {totalPages}</span>
               <button 
                 onClick={() => setCurrentPageIndex(p => Math.min(totalPages, p + 1))} 
                 className="size-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none active:scale-95" 
                 disabled={currentPageIndex === totalPages}
               >
                 <ChevronRight className="size-5" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
