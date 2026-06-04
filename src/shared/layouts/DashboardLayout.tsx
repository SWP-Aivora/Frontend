import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { NAV_ITEMS } from '../components/dashboard/NavItems';
import { Role } from '@/shared/types/enums';

interface DashboardLayoutProps {
  role: Role;
}

export const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = NAV_ITEMS[role] || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0 sticky top-0 h-screen">
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
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
