import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useUnreadCount } from '../hooks/useNotifications';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { NotificationList } from '../components/NotificationList';
import { NotificationFilters, type ReadStatusFilter } from '../components/NotificationFilters';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { NotificationStatus, type Notification } from '../types';
import { useAuthStore } from '@/features/auth/store';
import { resolveNotificationPath } from '../utils/notificationRoutes';

const isDisputeNotification = (notification: Notification) => {
  const searchableFields = [
    notification.type,
    notification.title,
    notification.message,
    notification.linkUrl,
  ];

  return searchableFields.some((field) => field?.toLowerCase().includes('dispute'));
};

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReadStatusFilter>('all');
  
  // Fetch data
  const { 
    data: notificationsData, 
    isLoading, 
    error: listError,
    refetch: refetchNotifications 
  } = useNotifications({
    PageSize: 20,
    PageIndex: 1,
  });
  
  const { 
    data: unreadResponse, 
    error: unreadError,
    refetch: refetchUnread 
  } = useUnreadCount();
  
  const unreadCount = unreadResponse?.data || 0;

  // Mutations
  const { markAsRead, markAllAsRead, isMarkingAllAsRead } = useNotificationActions();

  const handleRetry = () => {
    refetchNotifications();
    refetchUnread();
  };

  const notifications = notificationsData?.data || [];
  const totalCount = notificationsData?.metadata?.totalCount || notifications.length;
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredNotifications = notifications.filter((notification) => {
    const title = notification.title?.toLowerCase() ?? '';
    const message = notification.message?.toLowerCase() ?? '';
    const matchesSearch = !normalizedSearchTerm || title.includes(normalizedSearchTerm) || message.includes(normalizedSearchTerm);
    const isRead = notification.isRead || notification.status === NotificationStatus.READ;
    if (!matchesSearch) return false;
    if (statusFilter === 'read') return isRead;
    if (statusFilter === 'unread') return !isRead;
    return true;
  });
  const disputeNotifications = notifications.filter(isDisputeNotification);
  const hasError = !!listError || !!unreadError;

  const handlePriorityClick = (linkUrl?: string | null) => {
    const targetUrl = linkUrl ? resolveNotificationPath(linkUrl, role) : null;
    if (!targetUrl) return;

    if (/^https?:\/\//i.test(targetUrl)) {
      window.location.assign(targetUrl);
      return;
    }

    navigate(targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-8">
      <div className="rounded-lg border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900">
          Manage All Notifications
        </h1>
        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
          Review important updates from proposals, projects, milestones, payments, disputes, reviews, messages, and account activity.
        </p>
      </div>

      {/* Filters */}
      <NotificationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={totalCount}
        unreadCount={unreadCount}
      />

      {/* Content Area */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main List */}
        <div className="flex-1">
          {hasError ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center flex flex-col items-center">
              <div className="size-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="size-8 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load notifications</h2>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                There was a problem connecting to the notification service. Please try again.
              </p>
              <Button onClick={handleRetry} className="rounded-full px-8 gap-2">
                <RefreshCw className="size-4" />
                Retry Loading
              </Button>
            </div>
          ) : (
            <NotificationList 
              notifications={filteredNotifications}
              isLoading={isLoading}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              isMarkingAllAsRead={isMarkingAllAsRead}
            />
          )}
        </div>

        {/* Right Rail (Priority Updates) */}
        <div className="w-full xl:w-[320px] shrink-0">
          <div className="bg-red-50 rounded-lg p-5 border border-red-100">
            <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full w-fit mb-3">
              <span className="text-xs font-bold uppercase">{disputeNotifications.length} ACTIVE</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Priority updates</h3>

            {disputeNotifications.length === 0 ? (
              <div className="rounded-lg bg-white/70 border border-red-100 p-4 mt-4">
                <p className="text-sm font-semibold text-slate-900">No priority updates</p>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  You have no dispute notifications right now.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                {disputeNotifications.map((notification) => {
                  const hasLink = !!notification.linkUrl?.trim();
                  const isUnread = notification.isRead || notification.status === NotificationStatus.READ ? false : true;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handlePriorityClick(notification.linkUrl)}
                      disabled={!hasLink}
                      className="bg-white border border-red-100 rounded-lg p-4 text-left transition-colors enabled:hover:bg-red-50 disabled:cursor-default"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {notification.title || 'Dispute notification'}
                        </span>
                        <span className={`shrink-0 text-[10px] font-bold uppercase ${isUnread ? 'text-red-600' : 'text-slate-400'}`}>
                          {isUnread ? 'Unread' : 'Read'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mt-2">
                        {notification.message || 'Review this dispute update.'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
