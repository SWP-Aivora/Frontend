import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, Settings, LogOut } from 'lucide-react';

export function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/10 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Link to="/admin" className="text-xl font-bold text-primary">
            AIVORA Admin
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
            <Users className="w-4 h-4" />
            Manage Users
          </Link>
          <Link to="/admin/disputes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
            <AlertTriangle className="w-4 h-4" />
            Disputes
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-destructive/10 text-destructive w-full">
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="h-16 border-b bg-background flex items-center px-4 md:hidden">
          <Link to="/admin" className="text-xl font-bold text-primary">
            AIVORA Admin
          </Link>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
