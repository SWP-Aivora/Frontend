import { Bell, Menu, Search, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { useNavigate, Link } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
}

const ASSETS = {
  logoCircle: "https://www.figma.com/api/mcp/asset/7d5ca9a5-19fa-4c3f-816b-14a9c0a0f910",
};

export const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user?.role) {
      navigate(`/${user.role.toLowerCase()}/profile`);
    }
  };

  const handleNotificationsClick = () => {
    // Navigate to role-specific dashboard for now as notification page is not implemented
    if (user?.role) {
      navigate(`/${user.role.toLowerCase()}`);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 shrink-0 relative z-30 shadow-sm">
      <div className="flex items-center gap-4 lg:gap-8 flex-1">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-50 text-slate-500"
        >
          <Menu className="size-6" />
        </button>

        {/* Brand Header (Moved from Sidebar) */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative size-10 shrink-0">
            <img src={ASSETS.logoCircle} alt="AIVORA" className="size-full" />
            <span className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-blue-dark hidden sm:block">AIVORA</span>
        </Link>

        {/* Global Search */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 w-full max-w-md group focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300">
           <Search className="size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
           <input 
              type="text" 
              placeholder="Search projects, experts, or messages..." 
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-3 w-full text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
           />
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Notifications */}
        <button 
          onClick={handleNotificationsClick}
          className="relative p-2.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-primary transition-all duration-300"
        >
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 bg-destructive border-2 border-white rounded-full" />
        </button>

        <div className="h-8 w-px bg-slate-100 mx-1" />

        <div className="flex items-center gap-2">
          {/* User Profile */}
          <div 
            onClick={handleProfileClick}
            className="flex items-center gap-3 pl-2 group cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none">{user?.fullName || 'User Name'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{user?.role || 'Role'}</p>
            </div>
            <div className="size-11 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden shadow-sm">
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
