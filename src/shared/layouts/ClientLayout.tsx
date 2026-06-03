import { Outlet, Link } from 'react-router-dom';

export function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/client" className="text-2xl font-bold text-primary">
              AIVORA
            </Link>
            <nav className="hidden md:flex gap-4">
              <Link to="/client/talents" className="text-sm font-medium hover:text-primary">Find Experts</Link>
              <Link to="/client/projects" className="text-sm font-medium hover:text-primary">My Projects</Link>
              <Link to="/client/messages" className="text-sm font-medium hover:text-primary">Messages</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">
              Post a Job
            </button>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center cursor-pointer">
              C
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2026 AIVORA. Client Portal.
        </div>
      </footer>
    </div>
  );
}
