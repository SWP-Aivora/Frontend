import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { NAV_ITEMS } from '../components/dashboard/NavItems';
import { Role } from '@/shared/types/enums';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store';
import { authService } from '@/features/auth/services';
import { useGlobalRealtimeSync } from '@/shared/hooks/useGlobalRealtimeSync';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  role: Role;
}

const needsFullNameHydration = (user: ReturnType<typeof useAuthStore.getState>['user']) => {
  if (!user?.fullName) return true;
  const emailName = user.email?.split('@')[0]?.trim().toLowerCase();
  return Boolean(emailName && user.fullName.trim().toLowerCase() === emailName);
};

export const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, setUser } = useAuthStore();
  const location = useLocation();
  const mainRef = useRef<HTMLElement | null>(null);
  const items = NAV_ITEMS[role] || [];

  // Global real-time sync: maintains SignalR connection and listens for backend events
  useGlobalRealtimeSync();

  const isMessagePage = location.pathname.endsWith('/messages');
  const isHydrating = useRef(false);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  // Hydrate user data on mount
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchUser = async () => {
      if (isAuthenticated && needsFullNameHydration(user) && !isHydrating.current) {
        isHydrating.current = true;
        try {
          const response = await authService.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Only show error if not aborted
            if (!controller.signal.aborted) {
              if (response.statusCode === 401 || response.statusCode === 403) {
                useAuthStore.getState().logout();
                toast.error('Session expired. Please log in again.');
                // Redirection will be handled by ProtectedRoute once isAuthenticated becomes false
              } else {
                toast.error(response.message || 'Failed to sync account data');
              }
            }
          }
        } catch (error: unknown) {
          if (!controller.signal.aborted) {
            const axiosError = error as { response?: { status?: number } };
            const status = axiosError?.response?.status;
            if (status === 401 || status === 403) {
              useAuthStore.getState().logout();
              toast.error('Session expired. Please log in again.');
            } else {
              toast.error('Session error: Unable to load profile data');
              console.error('Failed to fetch current user:', error);
            }
          }
        } finally {
          isHydrating.current = false;
        }
      }
    };
    
    fetchUser();
    
    return () => {
      controller.abort();
    };
  }, [isAuthenticated, user?.fullName, user, setUser]);

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Topbar spans full width */}
      <Topbar 
        role={role} 
        onMenuClick={() => setMobileMenuOpen(true)} 
        onToggleSidebar={() => setCollapsed(!collapsed)}
        sidebarCollapsed={collapsed}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex shrink-0 h-full overflow-visible z-40 relative">
          <Sidebar 
            items={items} 
            collapsed={collapsed} 
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              className="w-72 h-full bg-white animate-in slide-in-from-left duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar 
                items={items} 
                collapsed={false} 
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className={cn(
          "flex-1 overflow-y-auto min-w-0",
          !isMessagePage && "p-6 lg:p-10"
        )}
        ref={mainRef}>
          <div className={cn(
            "animate-in fade-in slide-in-from-bottom-4 duration-700",
            isMessagePage ? "h-full" : "max-w-screen-2xl mx-auto"
          )}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
