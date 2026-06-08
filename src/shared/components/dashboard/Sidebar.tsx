import { Link, useLocation } from 'react-router-dom';
import type { NavItem } from './NavItems';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ items, collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "bg-white border-r border-slate-100 flex flex-col transition-all duration-300 relative z-40 shadow-sm overflow-visible h-full",
        collapsed ? "w-0 border-r-0" : "w-72"
      )}
    >
      {/* Collapse Toggle - Always visible on the edge */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-6 size-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:shadow-xl hover:text-primary transition-all z-50",
          collapsed 
            ? "left-6 -translate-x-1/2" 
            : "right-0 translate-x-1/2"
        )}
      >
        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>

      {/* Internal Content - Hidden when collapsed to avoid horizontal scroll/clipping */}
      <div className={cn(
        "flex-1 flex flex-col transition-opacity duration-200 overflow-hidden shrink-0",
        collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      style={{ width: collapsed ? 0 : '18rem' }}
      >
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {items.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative",
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
