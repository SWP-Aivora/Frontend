import { Link, useLocation } from 'react-router-dom';
import type { NavItem } from './NavItems';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ASSETS = {
  logoCircle: "https://www.figma.com/api/mcp/asset/7d5ca9a5-19fa-4c3f-816b-14a9c0a0f910",
};

export const Sidebar = ({ items, collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "bg-white border-r border-slate-100 flex flex-col transition-all duration-300 relative z-40 shadow-sm",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 size-6 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:text-primary transition-all z-50"
      >
        {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
      </button>

      {/* Brand Header */}
      <div className={cn("p-6 flex items-center gap-3 overflow-hidden", collapsed ? "justify-center" : "justify-start")}>
         <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative size-10 shrink-0">
              <img src={ASSETS.logoCircle} alt="AIVORA" className="size-full" />
              <span className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg">A</span>
            </div>
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight text-brand-blue-dark animate-in fade-in duration-500">AIVORA</span>
            )}
         </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
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
              {!collapsed && (
                <span className="font-bold text-sm truncate animate-in fade-in duration-300">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
};
