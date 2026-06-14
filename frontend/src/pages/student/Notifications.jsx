import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  Bell, CheckCircle, TrendingUp, XCircle,
  Briefcase, Clock, Check
} from 'lucide-react';
import api from '../../utils/api';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading      ] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) { console.error(err); }
  };

  const getIcon = (type) => {
    const icons = {
      success:  <CheckCircle size={18} style={{ color: '#10B981' }} />,
      info:     <TrendingUp  size={18} style={{ color: '#3B82F6' }} />,
      warning:  <XCircle     size={18} style={{ color: '#F59E0B' }} />,
      default:  <Bell        size={18} style={{ color: '#94A3B8' }} />,
    };
    return icons[type] || icons.default;
  };

  const getBg = (type) => {
    const bgs = {
      success: 'rgba(16,185,129,0.1)',
      info:    'rgba(59,130,246,0.1)',
      warning: 'rgba(245,158,11,0.1)',
      default: 'rgba(148,163,184,0.1)',
    };
    return bgs[type] || bgs.default;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4 fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Notifications
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={Check} onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto mb-4 opacity-20"
                  style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              No notifications yet
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Apply for jobs to start receiving updates
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className="rounded-xl p-4 transition-all"
              style={{
                background:  notif.isRead ? 'var(--color-bg-card)' : 'rgba(59,130,246,0.06)',
                border:      `1px solid ${notif.isRead ? 'var(--color-border)' : 'rgba(59,130,246,0.2)'}`,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: getBg(notif.type) }}>
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed"
                     style={{ color: 'var(--color-text-primary)', fontWeight: notif.isRead ? 400 : 500 }}>
                    {notif.message}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(notif.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Unread dot + mark read */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notif.isRead && (
                    <>
                      <div className="w-2 h-2 rounded-full" style={{ background: '#3B82F6' }} />
                      <button
                        onClick={() => markOneRead(notif.id)}
                        className="text-xs hover:underline"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Mark read
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}