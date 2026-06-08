import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { NAV_ITEMS } from '../components/dashboard/NavItems';
import { Role } from '@/shared/types/enums';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  role: Role;
}

export const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const items = NAV_ITEMS[role] || [];

  const isMessagePage = location.pathname.endsWith('/messages');

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Topbar spans full width */}
      <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex shrink-0 h-full overflow-visible z-40 relative">
          <Sidebar 
            items={items} 
            collapsed={collapsed} 
            setCollapsed={setCollapsed} 
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              className="w-72 h-full bg-white animate-in slide-in-from-left duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar 
                items={items} 
                collapsed={false} 
                setCollapsed={() => setMobileMenuOpen(false)} 
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className={cn(
          "flex-1 overflow-y-auto min-w-0",
          !isMessagePage && "p-6 lg:p-10"
        )}>
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
