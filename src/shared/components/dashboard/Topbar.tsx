import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserMenu } from '../common';
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

export const Topbar = ({ onMenuClick, onToggleSidebar, sidebarCollapsed }: TopbarProps) => {
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
        <UserMenu />
      </div>
    </header>
  );
};
