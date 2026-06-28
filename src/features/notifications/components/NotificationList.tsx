import type { Notification } from '../types';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
}

export const NotificationList = ({ 
  notifications, 
  isLoading, 
  onMarkAsRead, 
}: NotificationListProps) => {

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex-1 min-h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Notification History</h2>
          <p className="text-xs text-slate-500 mt-1">
            Bulk actions are available after selecting notifications.
          </p>
        </div>
      </div>

      <div className="h-px bg-slate-200 w-full mb-6" />

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          <p>No notifications found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};
