import { useState } from 'react';
import { useNotifications, useUnreadCount } from '../hooks/useNotifications';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { NotificationList } from '../components/NotificationList';
import { NotificationFilters } from '../components/NotificationFilters';
import { NotificationStats } from '../components/NotificationStats';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui';

export const NotificationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch data
  const { 
    data: notificationsData, 
    isLoading, 
    error: listError,
    refetch: refetchNotifications 
  } = useNotifications({
    PageSize: 20,
    PageIndex: 1,
    SearchTerm: searchTerm,
  });
  
  const { 
    data: unreadResponse, 
    error: unreadError,
    refetch: refetchUnread 
  } = useUnreadCount();
  
  const unreadCount = unreadResponse?.data || 0;

  // Mutations
  const { 
    markAsRead, 
    markAllAsRead, 
    isMarkingAllAsRead 
  } = useNotificationActions();

  const handleRetry = () => {
    refetchNotifications();
    refetchUnread();
  };

  const notifications = notificationsData?.data || [];
  const hasError = !!listError || !!unreadError;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-8">
      {/* Hero Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 relative overflow-hidden shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="absolute top-0 left-0 w-[300px] h-full bg-blue-50/80 -z-10" />
        
        <div className="flex items-center gap-6 z-10">
          <div className="size-14 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <div>
            <div className="bg-blue-50 border border-primary/20 px-3 py-1 rounded-full w-fit mb-2">
              <span className="text-xs font-bold text-primary uppercase">SHARED CENTER</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Manage All Notifications</h1>
            <p className="text-[13px] text-slate-500 mt-2 max-w-md">
              Review important updates from proposals, projects, milestones, payments, disputes, reviews, messages, and account activity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 z-10">
          <div className="bg-primary text-white rounded-xl p-4 text-center min-w-[120px] shadow-sm">
            <p className="text-3xl font-bold">{unreadCount}</p>
            <p className="text-xs font-semibold mt-1">Unread alerts</p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead || hasError}
              className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm hover:bg-primary/90 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingAllAsRead ? 'Marking...' : 'Mark All Read'}
            </button>
            <button className="bg-white border border-slate-200 text-primary px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-slate-50 transition-colors w-full">
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <NotificationStats unreadCount={unreadCount} totalCount={notificationsData?.metadata?.totalCount || 0} />

      {/* Filters */}
      <NotificationFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Content Area */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main List */}
        <div className="flex-1">
          {hasError ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center">
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
              notifications={notifications}
              isLoading={isLoading}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
          )}
        </div>

        {/* Right Rail (High Priority Alert Info) */}
        <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-4">
          <div className="bg-red-50 rounded-xl p-5 border border-red-100">
            <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full w-fit mb-3">
              <span className="text-xs font-bold uppercase">3 ACTIVE</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">High priority updates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review deliverables, dispute evidence, and frozen payment alerts before they age out.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-slate-300" />
              <span className="text-xs font-semibold text-slate-900">Deliverable review</span>
            </div>
            <span className="text-xs font-medium text-slate-500">Due today</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-red-400" />
              <span className="text-xs font-semibold text-slate-900">Dispute evidence</span>
            </div>
            <span className="text-xs font-medium text-slate-500">1 case open</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-orange-400" />
              <span className="text-xs font-semibold text-slate-900">Withdrawal processing</span>
            </div>
            <span className="text-xs font-medium text-slate-500">2 requests</span>
          </div>

          <button className="bg-blue-50 border border-blue-100 text-primary rounded-full py-2.5 px-4 text-xs font-semibold flex items-center justify-between hover:bg-blue-100 transition-colors mt-2">
            <span>Customize notification preferences</span>
            <span>&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

