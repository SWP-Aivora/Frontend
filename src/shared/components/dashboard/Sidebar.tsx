import { Link, useLocation } from 'react-router-dom';
import type { NavItem } from './NavItems';
import { cn } from '@/lib/utils';

interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
}

export const Sidebar = ({ items, collapsed }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "bg-white border-r border-slate-100 flex flex-col transition-all duration-300 relative z-40 shadow-sm overflow-visible h-full",
        collapsed ? "w-0 border-r-0" : "w-64"
      )}
    >
      {/* Internal Content - Hidden when collapsed */}
      <div className={cn(
        "flex-1 flex flex-col transition-opacity duration-200 overflow-hidden shrink-0",
        collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      style={{ width: collapsed ? 0 : '16rem' }}
      >
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {items.map((item) => {
            // Dashboard items usually match exactly to avoid being active for all sub-routes
            const isDashboard = item.label.toLowerCase().includes('dashboard') || item.href.split('/').length === 2;
            const isActive = isDashboard 
              ? location.pathname === item.href 
              : location.pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <Icon className={cn("size-5 shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                <span className="font-bold text-sm truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
