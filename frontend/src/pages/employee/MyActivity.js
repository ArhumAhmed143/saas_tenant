import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';

export default function MyActivity() {
  const { currentUser, activities, fetchActivities, isLoading } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await fetchActivities();
      setLoading(false);
    };
    load();
  }, [fetchActivities]);

  // Filter to current user's activities only
  const myActivities = activities.filter(
    a => a.user_id === currentUser?.id || a.userId === currentUser?.id
  );

  const getActionIcon = (action) => {
    if (!action) return '🔵';
    const lower = action.toLowerCase();
    if (lower.includes('created') || lower.includes('added')) return '🟢';
    if (lower.includes('deleted') || lower.includes('removed')) return '🔴';
    if (lower.includes('updated') || lower.includes('changed') || lower.includes('status')) return '🟡';
    return '🔵';
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const now = new Date();
      const past = new Date(timestamp);
      const diffMs = now - past;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin} min ago`;
      if (diffHour < 24) return `${diffHour} hours ago`;
      if (diffDay === 1) return 'Yesterday';
      return `${diffDay} days ago`;
    } catch (e) { return 'Just now'; }
  };

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main className="main-content" style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#22c55e' }}>
            📋 My Activity
          </h1>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {myActivities.length} events
          </span>
        </div>
        <p style={{ color: '#64748b', marginBottom: 24 }}>
          All your recent actions on the platform
        </p>

        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          {loading || isLoading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>⏳ Loading your activity...</p>
          ) : myActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
              <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: 8 }}>
                No activity yet
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Your actions (creating tasks, updating status) will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {myActivities.map((a, i) => (
                <div key={a.id || i} style={{
                  padding: '16px 0',
                  borderBottom: i === myActivities.length - 1 ? 'none' : '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#22c55e', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 600, flexShrink: 0,
                  }}>
                    {currentUser?.name?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#0f172a', fontWeight: 500, fontSize: '0.95rem' }}>
                      {getActionIcon(a.action)} {a.action}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                      {getRelativeTime(a.created_at || a.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}