import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ClientServicesModulePageProps {
  children: React.ReactNode;
}

const tabs = [
  { label: 'Browse Services', href: '/client/services', end: true },
  { label: 'My Requests', href: '/client/services/requests', end: false },
];

export const ClientServicesModulePage = ({ children }: ClientServicesModulePageProps) => {
  const location = useLocation();
  const isRequestsPage = location.pathname.startsWith('/client/services/requests');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          {isRequestsPage ? 'My Service Requests' : 'Services'}
        </h1>
        <p className="mt-1 font-medium text-slate-500">
          {isRequestsPage
            ? 'Track the services you have requested from experts.'
            : 'Browse packaged expert services when catalog listing becomes available.'}
        </p>
        <div className="mt-6 overflow-x-auto border-b border-slate-200">
          <nav className="flex min-w-max gap-8" aria-label="Services sections">
            {tabs.map(tab => (
              <NavLink
                key={tab.href}
                to={tab.href}
                end={tab.end}
                className={({ isActive }) => cn(
                  'relative flex h-11 items-center whitespace-nowrap px-1 text-sm font-semibold transition-colors',
                  isActive
                    ? 'text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
};
