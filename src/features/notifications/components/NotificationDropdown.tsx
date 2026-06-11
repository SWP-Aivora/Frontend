import { useState, useRef, useEffect } from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotifications, useUnreadCount } from '../hooks/useNotifications';
import { NotificationStatus } from '../types';
import { cn } from '@/lib/utils';

interface NotificationDropdownProps {
  role: string;
}

export const NotificationDropdown = ({ role }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: notificationsData, isLoading } = useNotifications({
    PageSize: 10, // Fetch a few to filter unread
    PageIndex: 1,
  });

  const { data: unreadResponse } = useUnreadCount();
  const unreadData = unreadResponse?.data;
  const unreadCount = typeof unreadData === 'number' ? unreadData : unreadData?.count || 0;

  // Filter unread notifications on frontend as API doesn't support unread filter yet
  const unreadNotifications = (notificationsData?.data || [])
    .filter(n => !n.isRead && n.status !== NotificationStatus.READ)
    .slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewDetail = () => {
    setIsOpen(false);
    if (role) {
      navigate(`/${role.toLowerCase()}/notifications`);
    }
  };

  const notificationPath = role ? `/${role.toLowerCase()}/notifications` : '#';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-xl transition-all duration-300",
          isOpen ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-slate-500 hover:text-primary"
        )}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 size-2 bg-destructive border-2 border-white rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Unread Notifications</h3>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} New
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-slate-400 font-medium">No unread notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {unreadNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => {
                      // Optionally mark as read here or just navigate
                      handleViewDetail();
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="size-2 mt-1.5 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{notification.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link 
            to={notificationPath}
            onClick={() => setIsOpen(false)}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-primary text-xs font-bold flex items-center justify-center gap-2 transition-colors border-t border-slate-100"
          >
            View detail <ArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </div>
  );
};
