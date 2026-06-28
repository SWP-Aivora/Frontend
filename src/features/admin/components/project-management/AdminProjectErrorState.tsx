import { AlertCircle } from 'lucide-react';

interface AdminProjectErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
}

export const AdminProjectErrorState = ({
  title = 'Failed to load projects',
  message = 'Something went wrong while fetching projects.',
  onRetry,
}: AdminProjectErrorStateProps) => {
  return (
    <div className="bg-rose-50 border border-rose-100 rounded-lg p-10 text-center max-w-2xl mx-auto my-10">
      <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
      <h2 className="text-lg font-black text-rose-900 mb-2">{title}</h2>
      <p className="text-rose-600 font-medium">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};
