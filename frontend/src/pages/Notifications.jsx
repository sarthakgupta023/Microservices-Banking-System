import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

const fmtDate = (isoStr) => {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL | UNREAD

  useEffect(() => {
    if (user?.id) {
      notificationAPI
        .getByUser(user.id)
        .then((r) => {
          const list = Array.isArray(r) ? r : r?.data || [];
          setNotifications(list);
        })
        .catch((err) => {
          console.error('Failed to fetch notifications:', err);
          setNotifications([]);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Navbar />

      <div style={{ maxWidth: 850, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header & Filter Controls */}
        <div
          className="fade-in"
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
              Notifications 🔔
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 4 }}>
              Real-time Saga transaction alerts & account updates
            </p>
          </div>

          {/* Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              background: 'rgba(255,255,255,0.03)',
              padding: 4,
              borderRadius: 10,
              border: '1px solid rgba(201,168,76,0.15)',
            }}
          >
            {['ALL', 'UNREAD'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: filter === f ? '#c9a84c' : 'transparent',
                  color: filter === f ? '#0f1a08' : 'rgba(255,255,255,0.6)',
                }}
              >
                {f === 'ALL' ? 'All Alerts' : 'Unread'}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                margin: '0 auto',
                border: '2px solid rgba(201,168,76,0.2)',
                borderTop: '2px solid #c9a84c',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🔕</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              No {filter === 'UNREAD' ? 'unread' : ''} notifications found
            </p>
          </div>
        )}

        {/* Notification List */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((item) => {
              const isSuccess =
                item.status === 'SUCCESS' || item.status === 'COMPLETED';
              const isFailed =
                item.status === 'FAILED' || item.status === 'FAILED_AND_REFUNDED';

              return (
                <div
                  key={item.id}
                  className="glass-card fade-in"
                  style={{
                    padding: '18px 20px',
                    position: 'relative',
                    background: item.isRead
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(201,168,76,0.05)',
                    border: item.isRead
                      ? '1px solid rgba(201,168,76,0.12)'
                      : '1px solid rgba(201,168,76,0.35)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                  }}
                >
                  {/* Status Icon */}
                  <div style={{ fontSize: 24, marginTop: 2 }}>
                    {isSuccess ? '✅' : isFailed ? '❌' : 'ℹ️'}
                  </div>

                  {/* Body Content */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: isSuccess
                            ? '#7ec87e'
                            : isFailed
                            ? '#e07c7c'
                            : '#f0c96a',
                        }}
                      >
                        {item.title || 'Transaction Update'}
                      </span>
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: 11,
                        }}
                      >
                        {fmtDate(item.createdAt)}
                      </span>
                    </div>

                    <p
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 13,
                        lineHeight: 1.5,
                        margin: '6px 0',
                      }}
                    >
                      {item.message}
                    </p>

                    {item.referenceId && (
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: 11,
                          fontFamily: 'monospace',
                        }}
                      >
                        Ref: {item.referenceId}
                      </p>
                    )}
                  </div>

                  {/* Mark as read button if unread */}
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      title="Mark as read"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#c9a84c',
                        cursor: 'pointer',
                        fontSize: 12,
                        padding: '4px 8px',
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}