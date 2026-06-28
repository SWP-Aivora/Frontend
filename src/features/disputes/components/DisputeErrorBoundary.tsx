import * as React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { ErrorBoundary } from '@/shared/components/common/ErrorBoundary';
import { Button } from '@/shared/components/ui';

interface DisputeErrorBoundaryProps {
  children: React.ReactNode;
}

export const DisputeErrorBoundary: React.FC<DisputeErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-rose-50/30 rounded-xl border-2 border-dashed border-rose-100 animate-in fade-in duration-500">
          <div className="size-16 bg-white rounded-xl shadow-xl shadow-rose-100 flex items-center justify-center mb-6">
            <AlertCircle className="size-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-500 max-w-md mb-8 font-medium">
            We encountered an unexpected error while loading the dispute resolution center.
            This might be a temporary UI issue.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-lg px-8 h-12 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 flex items-center gap-2 font-bold"
          >
            <RefreshCcw className="size-4" />
            Retry Connection
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};
