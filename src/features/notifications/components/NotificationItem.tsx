import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types';
import { NotificationType, NotificationStatus, NotificationPriority } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const getIconConfig = (type: string | NotificationType) => {
  switch (type) {
    case NotificationType.DELIVERABLE_SUBMITTED:
      return { bg: 'bg-primary', text: 'P' };
    case NotificationType.NEW_PROPOSAL_RECEIVED:
      return { bg: 'bg-blue-400', text: 'PR' };
    case NotificationType.PAYMENT_RELEASED:
      return { bg: 'bg-emerald-600', text: '$' };
    default:
      return { bg: 'bg-slate-400', text: '!' };
  }
};

const getStatusBadge = (status: string | NotificationStatus) => {
  switch (status) {
    case NotificationStatus.ACTION_REQUIRED:
      return <div className="bg-red-50 px-3 py-1 rounded-full"><span className="text-xs font-bold text-red-600 uppercase">Action Required</span></div>;
    case NotificationStatus.RESOLVED:
      return <div className="bg-emerald-50 px-3 py-1 rounded-full"><span className="text-xs font-bold text-emerald-600 uppercase">Resolved</span></div>;
    case NotificationStatus.UNREAD:
      return <div className="bg-blue-50 px-3 py-1 rounded-full"><span className="text-xs font-bold text-primary uppercase">Unread</span></div>;
    default:
      return <div className="bg-slate-50 px-3 py-1 rounded-full"><span className="text-xs font-bold text-slate-500 uppercase">Normal</span></div>;
  }
};

const getPriorityBadge = (priority: string | NotificationPriority) => {
  switch (priority) {
    case NotificationPriority.HIGH:
    case NotificationPriority.URGENT:
      return <div className="bg-orange-50 px-3 py-1 rounded-full"><span className="text-xs font-bold text-orange-500 uppercase">High</span></div>;
    default:
      return null;
  }
};

export const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const navigate = useNavigate();
  const iconConfig = getIconConfig(notification.type);
  const isUnread = notification.status === NotificationStatus.UNREAD || !notification.isRead;
  const viewUrl = notification.linkUrl?.trim();

  const handleView = () => {
    if (!viewUrl) return;

    if (/^https?:\/\//i.test(viewUrl)) {
      window.location.assign(viewUrl);
      return;
    }

    navigate(viewUrl.startsWith('/') ? viewUrl : `/${viewUrl}`);
  };

  // Function to format date safely
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      onClick={viewUrl ? handleView : undefined}
      className={`relative bg-white border border-slate-200 h-24 overflow-hidden rounded-xl shadow-sm flex items-center transition-colors ${viewUrl ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50'}`}
    >
      {/* Unread Stripe */}
      {isUnread && (
        <div className={`absolute left-0 top-0 bottom-0 w-[5px] ${notification.type === NotificationType.PAYMENT_RELEASED ? 'bg-emerald-600' : 'bg-primary'}`} />
      )}

      {/* Icon */}
      <div className={`ml-5 size-10 rounded-xl flex items-center justify-center ${iconConfig.bg}`}>
        <span className="text-white font-bold text-sm">{iconConfig.text}</span>
      </div>

      {/* Content */}
      <div className="ml-4 flex-1">
        <h4 className="text-[15px] font-semibold text-slate-900 leading-tight">
          {notification.title}
        </h4>
        <p className="text-xs text-slate-600 mt-1 truncate max-w-[400px]">
          {notification.message}
        </p>
        {notification.projectName && (
          <p className="text-xs font-medium text-primary mt-2">
            {notification.projectName}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex gap-2 mr-auto ml-4">
        {getPriorityBadge(notification.priority)}
        {getStatusBadge(notification.status)}
      </div>

      {/* Time & Actions */}
      <div className="flex flex-col items-end gap-2 pr-6">
        <span className="text-xs font-medium text-slate-500">
          {formatTime(notification.createdAt)}
        </span>
        
        <div className="flex items-center gap-2">
          {isUnread && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}
              className="px-4 py-1.5 border border-primary/20 rounded-full text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              Mark Read
            </button>
          )}
          {viewUrl && (
            <span
              className="px-4 py-1.5 bg-primary rounded-full text-xs font-semibold text-white shadow-sm transition-colors"
            >
              View
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
