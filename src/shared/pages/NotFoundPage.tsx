import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
      >
        Return to Home
      </Link>
    </div>
  );
}
