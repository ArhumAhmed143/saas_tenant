import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';

export default function Activity() {
  const { activities, users } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getActionMeta = (action) => {
    if (!action) return { label: 'Action', color: '#4f46e5', icon: '🔵' };
    const lower = action.toLowerCase();
    if (lower.includes('created') || lower.includes('added')) {
      return { label: 'Created', color: '#22c55e', icon: '🟢' };
    } else if (lower.includes('deleted') || lower.includes('removed')) {
      return { label: 'Deleted', color: '#ef4444', icon: '🔴' };
    } else if (lower.includes('updated') || lower.includes('changed') || lower.includes('status')) {
      return { label: 'Updated', color: '#f59e0b', icon: '🟡' };
    } else {
      return { label: 'Action', color: '#4f46e5', icon: '🔵' };
    }
  };

  const getEntityType = (action) => {
    if (!action) return 'General';
    if (action.includes('Project')) return 'Project';
    if (action.includes('Task')) return 'Task';
    if (action.includes('Sprint')) return 'Sprint';
    if (action.includes('Comment')) return 'Comment';
    if (action.includes('Department') || action.includes('Team') || action.includes('Member')) return 'Organization';
    if (action.includes('Invited')) return 'User';
    return 'General';
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const now = new Date();
      const past = new Date(timestamp);
      if (isNaN(past.getTime())) return 'Just now';
      
      const diffMs = now - past;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin} min ago`;
      if (diffHour < 24) return `${diffHour} hours ago`;
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 7) return `${diffDay} days ago`;
      return timestamp.split('T')[0] || 'Just now';
    } catch (error) {
      return 'Just now';
    }
  };

  const filteredActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    return activities.filter(act => {
      if (!act) return false;
      const matchesSearch = act.action?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesUser = filterUser === 'all' || act.user_id === parseInt(filterUser);
      const entityType = getEntityType(act.action);
      const matchesType = filterType === 'all' || entityType === filterType;
      return matchesSearch && matchesUser && matchesType;
    });
  }, [activities, searchTerm, filterUser, filterType]);

  const entityTypes = ['all', 'Project', 'Task', 'Sprint', 'Comment', 'Organization', 'User', 'General'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>📋 Activity Log</h2>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {filteredActivities.length} events
          </span>
        </div>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Track all actions performed across your organization</p>

        {/* Filters */}
        <div style={{ 
          background: 'white', 
          padding: '16px 20px', 
          borderRadius: 16, 
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
          alignItems: 'center'
        }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <input 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="🔍 Search activities..."
              style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} 
            />
          </div>

          <div style={{ flex: 1, minWidth: 150 }}>
            <select 
              value={filterUser} 
              onChange={(e) => setFilterUser(e.target.value)}
              style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem' }}
            >
              <option value="all">All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 150 }}>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem' }}
            >
              {entityTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || filterUser !== 'all' || filterType !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setFilterUser('all'); setFilterType('all'); }}
              style={{ padding: '6px 14px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Activity List */}
        {!activities || activities.length === 0 ? (
          <div style={{ background: 'white', padding: 60, borderRadius: 16, textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>📋</span>
            No activities yet. Start using the app to generate activity logs!
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ background: 'white', padding: 60, borderRadius: 16, textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>🔍</span>
            No activities found matching your filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredActivities.map((act) => {
              if (!act) return null;
              const meta = getActionMeta(act.action);
              const entity = getEntityType(act.action);
              const user = users.find(u => u.id === (act.user_id || act.userId));
              const relativeTime = getRelativeTime(act.created_at || act.createdAt);
              const fullDate = act.created_at || act.createdAt || 'Unknown';
              
              return (
                <div key={act.id || Math.random()} style={{
                  background: 'white',
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: user ? '#4f46e5' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 600, fontSize: '0.9rem', flexShrink: 0,
                  }}>
                    {user ? user.name.charAt(0) : '?'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{act.action || 'Unknown action'}</strong>
                      <span style={{ background: meta.color, color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: '0.6rem', fontWeight: 600 }}>
                        {meta.icon} {meta.label}
                      </span>
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 10px', borderRadius: 12, fontSize: '0.6rem', fontWeight: 600 }}>
                        {entity}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
                      by <strong style={{ color: '#64748b' }}>{getUserName(act.user_id || act.userId)}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'right' }}>
                    {relativeTime}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 16, textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
          Showing {filteredActivities.length} of {activities?.length || 0} total activities
        </div>

      </main>
    </div>
  );
}