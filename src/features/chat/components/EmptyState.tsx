import { MessageSquare } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-center p-8">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">No conversation selected</h3>
      <p className="text-slate-500 max-w-md mx-auto">
        Choose a conversation from the list to start messaging. You can keep track of project details, shared files, and collaboration history here.
      </p>
    </div>
  );
};
