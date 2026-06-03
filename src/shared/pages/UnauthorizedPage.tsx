import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <ShieldAlert className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-4xl font-bold mb-2 text-destructive">403</h1>
      <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        You do not have permission to access this page. Please contact the administrator if you believe this is an error.
      </p>
      <Link 
        to="/" 
        className="px-6 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md font-medium"
      >
        Return to Home
      </Link>
    </div>
  );
}
