import { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import api from '../../api';

export default function PlatformActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/platform/activities');
      console.log('✅ Activities loaded:', res.data.length);
      setActivities(res.data);
    } catch (err) {
      console.error('❌ Activities error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

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

  const getActionIcon = (action) => {
    if (!action) return '🔵';
    const lower = action.toLowerCase();
    if (lower.includes('created') || lower.includes('added')) return '🟢';
    if (lower.includes('deleted') || lower.includes('removed')) return '🔴';
    if (lower.includes('updated') || lower.includes('changed')) return '🟡';
    if (lower.includes('invited')) return '📨';
    return '🔵';
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => filter === 'platform' ? !a.tenant_id : a.tenant_id);

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main className="main-content" style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>📋 Platform Activity</h1>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{filteredActivities.length} events</span>
        </div>
        <p style={{ color: '#64748b', marginBottom: 24 }}>All activities across the platform</p>

        {/* Filters + Refresh */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
          {['all', 'tenant', 'platform'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                background: filter === f ? '#4f46e5' : 'white',
                color: filter === f ? 'white' : '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {f === 'all' ? 'All Activities' : f === 'tenant' ? '🏢 Tenant' : '🌍 Platform'}
            </button>
          ))}
          <button
            onClick={fetchActivities}
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              background: 'white',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            🔄 Refresh
          </button>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: '#94a3b8' }}>⏳ Loading activities...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: '#dc2626', fontWeight: 600 }}>❌ {error}</p>
              <button 
                onClick={fetchActivities}
                style={{
                  marginTop: 12,
                  padding: '8px 20px',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🔄 Try Again
              </button>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
              <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: 8 }}>
                {filter === 'all' ? 'No activities yet' : `No ${filter} activities`}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Activities are generated when users create, update, or delete items.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredActivities.map((a, i) => (
                <div key={a.id || i} style={{
                  padding: 16,
                  borderBottom: i === filteredActivities.length - 1 ? 'none' : '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: a.tenant_id ? '#4f46e5' : '#dc2626',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 600, flexShrink: 0,
                  }}>
                    {a.user_name ? a.user_name.charAt(0) : '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#0f172a', fontWeight: 500, fontSize: '0.95rem' }}>
                      {getActionIcon(a.action)} {a.action}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
                      {a.user_name && <span>by <strong>{a.user_name}</strong> • </span>}
                      {a.tenant_name ? `🏢 ${a.tenant_name}` : '🌍 Platform'} • {getRelativeTime(a.created_at)}
                    </div>
                  </div>
                  <span style={{
                    background: a.tenant_id ? '#e0e7ff' : '#fee2e2',
                    color: a.tenant_id ? '#4f46e5' : '#dc2626',
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    {a.tenant_name || 'Platform'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}