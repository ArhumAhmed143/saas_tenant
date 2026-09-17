import { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import api from '../../api';

export default function PlatformActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [scopeFilter, setScopeFilter] = useState('all'); // 'all', 'tenant', 'platform'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('All');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/platform/activities');
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

  const getActionBadge = (action) => {
    if (!action) return { icon: '🔵', color: '#4f46e5', bg: '#e0e7ff' };
    const lower = action.toLowerCase();
    if (lower.includes('created') || lower.includes('added')) {
      return { icon: '🟢', color: '#16a34a', bg: '#dcfce7' };
    }
    if (lower.includes('deleted') || lower.includes('removed')) {
      return { icon: '🔴', color: '#dc2626', bg: '#fee2e2' };
    }
    if (lower.includes('updated') || lower.includes('changed')) {
      return { icon: '🟡', color: '#d97706', bg: '#fef3c7' };
    }
    if (lower.includes('invited') || lower.includes('email')) {
      return { icon: '📨', color: '#0284c7', bg: '#e0f2fe' };
    }
    return { icon: '🔵', color: '#4f46e5', bg: '#e0e7ff' };
  };

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      // Scope filter
      if (scopeFilter === 'tenant' && !a.tenant_id) return false;
      if (scopeFilter === 'platform' && a.tenant_id) return false;

      // Search query
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        a.action?.toLowerCase().includes(searchLower) ||
        a.user_name?.toLowerCase().includes(searchLower) ||
        a.tenant_name?.toLowerCase().includes(searchLower);

      // Action type filter
      let matchesType = true;
      if (actionTypeFilter !== 'All') {
        const lowerAction = a.action?.toLowerCase() || '';
        if (actionTypeFilter === 'Created') matchesType = lowerAction.includes('created') || lowerAction.includes('added');
        else if (actionTypeFilter === 'Updated') matchesType = lowerAction.includes('updated') || lowerAction.includes('changed');
        else if (actionTypeFilter === 'Deleted') matchesType = lowerAction.includes('deleted') || lowerAction.includes('removed');
      }

      return matchesSearch && matchesType;
    });
  }, [activities, scopeFilter, searchQuery, actionTypeFilter]);

  const totalCount = activities.length;
  const tenantEventCount = activities.filter(a => a.tenant_id).length;
  const platformEventCount = activities.filter(a => !a.tenant_id).length;

  return (
    <div style={styles.appContainer}>
      <Sidebar />

      <div style={styles.mainWrapper}>
        <PageHeader
          title="📋 Platform Activity Logs"
          subtitle={`Audit log of all platform operations and tenant activities (${totalCount} total logged events)`}
          color="#dc2626"
          onRefresh={fetchActivities}
          loading={loading}
        />

        <div style={styles.contentContainer}>
          {/* STATS CARDS */}
          <div style={styles.statsGrid}>
            <StatsCard icon="📋" value={totalCount} label="Total Logged Events" color="#4f46e5" />
            <StatsCard icon="🏢" value={tenantEventCount} label="Tenant Activities" color="#0ea5e9" />
            <StatsCard icon="🌍" value={platformEventCount} label="Platform Scope Events" color="#7c3aed" />
            <StatsCard icon="⚡" value={filteredActivities.length} label="Filtered Events" color="#22c55e" />
          </div>

          {/* SCOPE & SEARCH FILTERS BAR */}
          <div style={styles.filterCard}>
            {/* SCOPE PILLS */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[
                { id: 'all', label: 'All Scope' },
                { id: 'tenant', label: '🏢 Tenant Scope' },
                { id: 'platform', label: '🌍 Platform Scope' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setScopeFilter(item.id)}
                  style={{
                    padding: '8px 16px',
                    background: scopeFilter === item.id ? '#dc2626' : '#ffffff',
                    color: scopeFilter === item.id ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: scopeFilter === item.id ? '#dc2626' : '#cbd5e1',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* SEARCH INPUT */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                placeholder="🔍 Search activity logs by action, user, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* TYPE FILTER SELECT */}
            <div style={{ width: 160 }}>
              <select
                value={actionTypeFilter}
                onChange={(e) => setActionTypeFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Action Types</option>
                <option value="Created">Created / Added</option>
                <option value="Updated">Updated / Changed</option>
                <option value="Deleted">Deleted / Removed</option>
              </select>
            </div>
          </div>

          {/* TIMELINE STYLE ACTIVITY FEED CARD */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📜 Activity Timeline</h3>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                Showing {filteredActivities.length} of {totalCount} events
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#94a3b8', margin: 0 }}>⏳ Loading activity timeline...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#dc2626', fontWeight: 600, margin: '0 0 12px 0' }}>❌ {error}</p>
                <button
                  onClick={fetchActivities}
                  style={styles.retryBtn}
                >
                  🔄 Retry
                </button>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
                <p style={{ color: '#0f172a', fontWeight: 600, margin: '0 0 4px 0' }}>
                  No activities match your filters
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  Activities are automatically recorded when users perform platform operations.
                </p>
              </div>
            ) : (
              <div style={styles.timelineList}>
                {filteredActivities.map((a, i) => {
                  const badge = getActionBadge(a.action);
                  return (
                    <div
                      key={a.id || i}
                      style={{
                        ...styles.timelineItem,
                        borderBottom: i === filteredActivities.length - 1 ? 'none' : '1px solid #f1f5f9',
                      }}
                    >
                      {/* USER AVATAR */}
                      <div style={styles.timelineAvatar}>
                        {a.user_name ? a.user_name.charAt(0).toUpperCase() : 'A'}
                      </div>

                      {/* ITEM CONTENT */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.timelineActionRow}>
                          <span style={styles.actionIcon}>{badge.icon}</span>
                          <span style={styles.actionText}>{a.action}</span>
                        </div>
                        <div style={styles.timelineMeta}>
                          {a.user_name && (
                            <span>by <strong style={{ color: '#0f172a' }}>{a.user_name}</strong> • </span>
                          )}
                          <span>{getRelativeTime(a.created_at)}</span>
                        </div>
                      </div>

                      {/* TENANT BADGE */}
                      <span
                        style={{
                          background: a.tenant_id ? '#e0e7ff' : '#fee2e2',
                          color: a.tenant_id ? '#4f46e5' : '#dc2626',
                          padding: '4px 12px',
                          borderRadius: 12,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {a.tenant_name ? `🏢 ${a.tenant_name}` : '🌍 Platform'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  mainWrapper: {
    marginLeft: 240,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  contentContainer: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  filterCard: {
    background: '#ffffff',
    padding: '16px 20px',
    borderRadius: 14,
    border: '1px solid #e2e8f0',
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  filterSelect: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    background: '#ffffff',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  card: {
    background: '#ffffff',
    padding: 24,
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  retryBtn: {
    padding: '8px 20px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
  },
  timelineItem: {
    padding: '14px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  timelineAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #dc2626, #f43f5e)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  timelineActionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: '0.85rem',
  },
  actionText: {
    fontSize: '0.92rem',
    fontWeight: 600,
    color: '#0f172a',
  },
  timelineMeta: {
    fontSize: '0.78rem',
    color: '#64748b',
    marginTop: 2,
  },
};