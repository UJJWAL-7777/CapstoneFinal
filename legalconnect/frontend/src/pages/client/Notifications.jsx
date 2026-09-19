import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications.js';
import Button from '../../components/ui/Button.jsx';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Notifications</h1>
          <p className="text-ink-soft mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" /></div>
      ) : notifications.length === 0 ? (
        <div className="panel p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm text-ink-muted mt-1">No notifications yet.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-line">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={`flex gap-4 p-4 cursor-pointer hover:bg-paper/70 transition-colors ${!n.isRead ? 'bg-chamber-50/60' : ''}`}
            >
              <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${!n.isRead ? 'bg-chamber-500' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.isRead ? 'text-ink' : 'text-ink-soft'}`}>{n.title}</p>
                  <p className="text-xs text-ink-muted shrink-0">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
                </div>
                <p className="text-sm text-ink-muted mt-0.5">{n.message}</p>
                {n.link && (
                  <Link to={n.link} className="mt-1 text-xs text-chamber-600 hover:underline inline-block">View →</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
