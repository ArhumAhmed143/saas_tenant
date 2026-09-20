import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api';

export default function NotificationBell() {
  const { currentUser } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState([]);
  const dropdownRef = useRef(null);

  const storageKey = currentUser?.id ? `readNotifications_${currentUser.id}` : null;

  // Load saved readIds on mount or when user changes
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setReadIds(JSON.parse(saved));
        } catch (e) {
          console.error('Error parsing read notifications from localStorage:', e);
          setReadIds([]);
        }
      } else {
        setReadIds([]);
      }
    } else {
      setReadIds([]);
    }
  }, [storageKey]);

  // Save readIds to localStorage when readIds changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(readIds));
    }
  }, [readIds, storageKey]);

  // Fetch notifications and set up interval
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    const uniqueIds = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(uniqueIds);
  };

  const resetNotifications = () => {
    setReadIds([]);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  const markSingleRead = (id) => {
    if (!readIds.includes(id)) {
      setReadIds(prev => [...prev, id]);
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    return `${diffDay}d ago`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'white',
          border: '1px solid #cbd5e1',
          cursor: 'pointer',
          fontSize: '1.1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        title="Notifications"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#94a3b8';
          e.currentTarget.style.background = '#f8fafc';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.background = 'white';
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            padding: '0 5px',
            borderRadius: 9,
            background: '#dc2626',
            color: 'white',
            fontSize: '0.68rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notification-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 500,
            background: 'white',
            borderRadius: 14,
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
          }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 700 }}>
              🔔 Notifications
            </h4>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4f46e5',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mark all read
                </button>
              )}
              {readIds.length > 0 && (
                <button
                  onClick={resetNotifications}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {loading ? (
              <p style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                ⏳ Loading...
              </p>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🔔</div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  No notifications yet — You're all caught up!
                </p>
              </div>
            ) : (
              notifications.map(n => {
                const isUnread = !readIds.includes(n.id);
                return (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      gap: 12,
                      background: isUnread ? '#f0f9ff' : 'white',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => markSingleRead(n.id)}
                  >
                    <div style={{
                      width: 34, height: 34,
                      borderRadius: '50%',
                      background: n.color || '#4f46e5',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      flexShrink: 0,
                    }}>
                      {n.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        {n.title}
                        {isUnread && (
                          <span style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#dc2626',
                          }}></span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.78rem',
                        color: '#64748b',
                        wordBreak: 'break-word',
                        lineHeight: 1.4,
                      }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
                        {getRelativeTime(n.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid #e2e8f0',
              textAlign: 'center',
              background: '#f8fafc',
            }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Showing {notifications.length} notification{notifications.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}