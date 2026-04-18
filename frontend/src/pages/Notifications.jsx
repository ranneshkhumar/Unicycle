import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  request_received: { icon: '📬', bg: '#E8F5E9', color: '#2E7D32', label: 'New Request' },
  request_accepted: { icon: '✅', bg: '#DCFCE7', color: '#15803D', label: 'Accepted' },
  request_rejected: { icon: '❌', bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
  item_returned: { icon: '📦', bg: '#FEF3C7', color: '#D97706', label: 'Returned' },
  review_received: { icon: '⭐', bg: '#FEF9C3', color: '#CA8A04', label: 'New Review' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    try { await API.put('/notifications/read-all'); fetchNotifications(); toast.success('All marked as read'); }
    catch {}
  };

  const markRead = async (id) => {
    try { await API.put(`/notifications/${id}/read`); fetchNotifications(); }
    catch {}
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>
              Notifications
              {unread > 0 && <span style={s.badge}>{unread} new</span>}
            </h1>
            <p style={s.subtitle}>Stay updated with your campus activity</p>
          </div>
          {unread > 0 && (
            <button style={s.markAllBtn} onClick={markAllRead}>Mark all as read</button>
          )}
        </div>

        {loading ? (
          <div style={s.loading}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyEmoji}>🔕</div>
            <h3 style={s.emptyTitle}>All caught up!</h3>
            <p style={s.emptyText}>No notifications yet. Start browsing to get notified!</p>
          </div>
        ) : (
          <div style={s.list}>
            {notifications.map(n => {
              const config = TYPE_CONFIG[n.type] || { icon: '🔔', bg: '#F1F8F4', color: '#2E7D32', label: 'Notification' };
              return (
                <div key={n._id}
                  style={{ ...s.item, ...(n.isRead ? {} : s.itemUnread) }}
                  onClick={() => !n.isRead && markRead(n._id)}>
                  <div style={{ ...s.iconBox, background: config.bg }}>
                    <span style={s.icon}>{config.icon}</span>
                  </div>
                  <div style={s.itemContent}>
                    <div style={s.itemTop}>
                      <span style={{ ...s.typeLabel, color: config.color }}>{config.label}</span>
                      <span style={s.time}>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={s.message}>{n.message}</p>
                  </div>
                  {!n.isRead && <div style={s.dot} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F1F8F4' },
  container: { maxWidth: 700, margin: '0 auto', padding: '36px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontSize: 30, fontWeight: 800, color: '#1B1B1B', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Poppins, sans-serif' },
  badge: { fontSize: 12, background: '#2E7D32', color: '#fff', padding: '3px 10px', borderRadius: 20, fontWeight: 600 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  markAllBtn: { padding: '9px 18px', background: '#fff', border: '1.5px solid #A5D6A7', borderRadius: 8, color: '#2E7D32', fontWeight: 600, cursor: 'pointer', fontSize: 13, boxShadow: '0 1px 3px rgba(46,125,50,0.08)' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  item: { background: '#fff', border: '1px solid #E2EFE6', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(46,125,50,0.06)' },
  itemUnread: { background: '#F6FBF7', borderColor: '#A5D6A7', borderLeft: '3px solid #2E7D32' },
  iconBox: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon: { fontSize: 20 },
  itemContent: { flex: 1 },
  itemTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  typeLabel: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  time: { fontSize: 11, color: '#9CA3AF' },
  message: { fontSize: 14, color: '#374151', lineHeight: 1.5 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#2E7D32', flexShrink: 0 },
  empty: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 16, border: '1px solid #E2EFE6' },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: '#1B1B1B', marginBottom: 8 },
  emptyText: { color: '#6B7280', fontSize: 14 },
  loading: { textAlign: 'center', padding: 40, color: '#6B7280' },
};