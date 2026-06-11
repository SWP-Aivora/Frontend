import { Menu, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { useNavigate, Link } from 'react-router-dom';
import { NotificationDropdown } from '@/features/notifications';
import { Role } from '@/shared/types/enums';

interface TopbarProps {
  onMenuClick: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  role: Role;
}

const ASSETS = {
  logoCircle: "/logo.png",
};

export const Topbar = ({ onMenuClick, onToggleSidebar, sidebarCollapsed, role }: TopbarProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user?.role) {
      navigate(`/${user.role.toLowerCase()}/profile`);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 shrink-0 relative z-30 shadow-sm">
      <div className="flex items-center gap-4 lg:gap-6 flex-1">
        {/* Sidebar Toggle (YouTube-style Hamburger) */}
        <button 
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition-all duration-300 group"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="size-7 stroke-[2.5px] group-hover:scale-110 transition-transform" />
        </button>

        {/* Mobile Menu Toggle (Left side for mobile visibility) */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-50 text-slate-500"
        >
          <Menu className="size-6" />
        </button>

        {/* Brand Header */}
        <Link to="/" className="flex items-center group shrink-0">
          <div className="relative w-32 h-12 overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <img 
              src={ASSETS.logoCircle} 
              alt="AIVORA" 
              className="w-full h-full object-contain scale-[1.8]" 
            />
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-5">
        {/* Notifications */}
        <NotificationDropdown role={role} />

        <div className="h-8 w-px bg-slate-100 mx-1" />

        <div className="flex items-center gap-2">
          {/* User Profile */}
          <div 
            onClick={handleProfileClick}
            className="flex items-center gap-3 pl-2 group cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none">{user?.fullName || 'User Name'}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">{user?.role || 'Role'}</p>
            </div>
            <div className="size-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden shadow-sm">
              {user?.fullName ? (
                <span className="text-sm font-black text-primary uppercase">{user.fullName.charAt(0)}</span>
              ) : (
                <User className="size-5 text-primary" />
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => logout()}
            className="p-2.5 rounded-xl hover:bg-destructive/5 text-slate-400 hover:text-destructive transition-all duration-300 group"
            title="Sign Out"
          >
            <LogOut className="size-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
