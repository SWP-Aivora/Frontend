import { User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { useNavigate } from 'react-router-dom';
import { NotificationDropdown } from '@/features/notifications';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  className?: string;
  showNotifications?: boolean;
}

/**
 * Shared User Menu component for authenticated users
 * Used in Topbar and Landing Page Navbar
 */
export const UserMenu = ({ className, showNotifications = true }: UserMenuProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user?.role) {
      navigate(`/${user.role.toLowerCase()}/profile`);
    }
  };

  const handleDashboardClick = () => {
    if (user?.role) {
      navigate(`/${user.role.toLowerCase()}`);
    }
  };

  if (!user) return null;

  return (
    <div className={cn("flex items-center gap-2 lg:gap-5", className)}>
      {/* Notifications */}
      {showNotifications && <NotificationDropdown role={user.role} />}

      {showNotifications && <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />}

      <div className="flex items-center gap-2">
        {/* User Profile */}
        <div 
          onClick={handleProfileClick}
          className="flex items-center gap-3 pl-2 group cursor-pointer"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none group-hover:text-primary transition-colors">{user.fullName || user.email || 'User'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{user.role}</p>
          </div>
          <div className="size-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center group-hover:scale-105 group-hover:border-primary/20 transition-all duration-300 overflow-hidden shadow-sm">
            {user.fullName ? (
              <span className="text-sm font-black text-primary uppercase">{user.fullName.charAt(0)}</span>
            ) : user.email ? (
              <span className="text-sm font-black text-primary uppercase">{user.email.charAt(0)}</span>
            ) : (
              <User className="size-5 text-primary" />
            )}
          </div>
        </div>

        {/* Dashboard Shortcut (Optional, added for Landing Page convenience) */}
        <button 
          onClick={handleDashboardClick}
          className="hidden md:flex px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-600 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
        >
          Dashboard
        </button>

        {/* Logout Button */}
        <button 
          onClick={() => logout()}
          className="p-2 rounded-lg hover:bg-destructive/5 text-slate-400 hover:text-destructive transition-all duration-300 group"
          title="Sign Out"
        >
          <LogOut className="size-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};
