import { Outlet, Link } from 'react-router-dom';

export function ExpertLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/expert" className="text-2xl font-bold text-primary">
              AIVORA
            </Link>
            <nav className="hidden md:flex gap-4">
              <Link to="/expert/jobs" className="text-sm font-medium hover:text-primary">Find Work</Link>
              <Link to="/expert/my-jobs" className="text-sm font-medium hover:text-primary">My Jobs</Link>
              <Link to="/expert/wallet" className="text-sm font-medium hover:text-primary">Wallet</Link>
              <Link to="/expert/messages" className="text-sm font-medium hover:text-primary">Messages</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center cursor-pointer">
              E
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
          © 2026 AIVORA. Expert Portal.
        </div>
      </footer>
    </div>
  );
}
