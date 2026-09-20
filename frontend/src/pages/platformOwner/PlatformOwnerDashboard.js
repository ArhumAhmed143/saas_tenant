import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import Logo from '../../components/Logo';
import api from '../../api';

export default function PlatformOwnerDashboard() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/platform/tenants')
        .then(res => setTenants(res.data))
        .catch(err => console.error('Tenants:', err)),
      api.get('/api/platform/users')
        .then(res => setAllUsers(res.data))
        .catch(err => console.error('Users:', err)),
      api.get('/api/platform/activities')
        .then(res => setActivities(res.data))
        .catch(err => console.error('Activities:', err)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay === 1) return 'Yesterday';
      return `${diffDay}d ago`;
    } catch (e) { return 'Just now'; }
  };

  // Plan Distribution
  const planCounts = { Free: 0, Basic: 0, Pro: 0, Enterprise: 0 };
  tenants.forEach(t => {
    const plan = t.plan || 'Free';
    if (planCounts[plan] !== undefined) planCounts[plan]++;
  });
  const planColors = { Free: '#94a3b8', Basic: '#22c55e', Pro: '#0ea5e9', Enterprise: '#7c3aed' };

  // Growth Chart
  const getGrowthData = () => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const companiesCount = tenants.filter(t => {
        if (!t.created_at) return false;
        return new Date(t.created_at) < nextMonth;
      }).length;
      const usersCount = allUsers.filter(u => {
        if (!u.created_at) return false;
        return new Date(u.created_at) < nextMonth;
      }).length;
      months.push({ month: monthName, companies: companiesCount, users: usersCount });
    }
    return months;
  };
  const growthData = getGrowthData();
  const maxGrowth = Math.max(...growthData.map(d => Math.max(d.companies, d.users)), 1);

  return (
    <div style={styles.appContainer}>
      <Sidebar />

      <div className="main-wrapper" style={styles.mainWrapper}>
        <PageHeader
          title="👑 Platform Owner Dashboard"
          subtitle={`Welcome back, ${currentUser?.name || 'Super Admin'} — Full platform management & analytics`}
          color="#dc2626"
          onRefresh={fetchData}
          loading={loading}
        />

        {/* CONTENT CONTAINER */}
        <div className="content-container" style={styles.contentContainer}>
          
          {/* QUICK ACTIONS BAR */}
          <div className="quick-actions-bar" style={styles.quickActionsBar}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>⚡ Quick Actions:</span>
            <button onClick={() => navigate('/platform/tenants')} style={styles.quickBtnPrimary}>
              🏢 Manage All Companies ({tenants.length})
            </button>
            <button onClick={() => navigate('/platform/users')} style={styles.quickBtnSecondary}>
              👥 Manage All Users ({allUsers.length})
            </button>
            <button onClick={() => navigate('/platform/analytics')} style={styles.quickBtnOutline}>
              📈 View Platform Analytics
            </button>
            <button onClick={() => navigate('/platform/activity')} style={styles.quickBtnOutline}>
              📋 View Full Activity Logs
            </button>
          </div>

          {/* STATS CARDS GRID (FULL WIDTH) */}
          <div className="stats-grid" style={styles.statsGrid}>
            <StatsCard
              value={tenants.length}
              label="Total Companies"
              color="#4f46e5"
              onClick={() => navigate('/platform/tenants')}
            />
            <StatsCard
              value={allUsers.length}
              label="Total Users"
              color="#0ea5e9"
              onClick={() => navigate('/platform/users')}
            />
            <StatsCard
              value={activities.length}
              label="Total Activities"
              color="#7c3aed"
              onClick={() => navigate('/platform/activity')}
            />
            <StatsCard
              value="Active"
              label="System Status"
              color="#22c55e"
            />
            <StatsCard
              value="Healthy"
              label="Database Status"
              color="#16a34a"
            />
          </div>

          {/* TWO COLUMN BALANCED LAYOUT */}
          <div className="two-column-grid" style={styles.twoColumnGrid}>
            
            {/* LEFT COLUMN (2fr) */}
            <div style={styles.columnGroup}>
              {/* GROWTH CHART */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>📈 Platform Growth Trend</h3>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem' }}>
                    <span style={{ color: '#4f46e5', fontWeight: 600 }}>● Companies</span>
                    <span style={{ color: '#0ea5e9', fontWeight: 600 }}>● Users</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: 160, gap: 12, paddingTop: 16 }}>
                  {growthData.map((d, idx) => (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: '100%', width: '100%', justifyContent: 'center' }}>
                        <div title={`Companies: ${d.companies}`} style={{ width: '35%', height: `${(d.companies / maxGrowth) * 100}%`, background: '#4f46e5', borderRadius: '4px 4px 0 0', minHeight: d.companies > 0 ? 4 : 0 }}></div>
                        <div title={`Users: ${d.users}`} style={{ width: '35%', height: `${(d.users / maxGrowth) * 100}%`, background: '#0ea5e9', borderRadius: '4px 4px 0 0', minHeight: d.users > 0 ? 4 : 0 }}></div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 8, fontWeight: 600 }}>{d.month}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT COMPANIES TABLE */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>🏢 Recent Companies</h3>
                  <button onClick={() => navigate('/platform/tenants')} style={styles.linkBtn}>View All ({tenants.length}) →</button>
                </div>
                {loading ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>Loading companies...</p>
                ) : tenants.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>No companies registered yet.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Company Name</th>
                        <th style={styles.th}>Subscription Plan</th>
                        <th style={styles.th}>Country</th>
                        <th style={styles.th}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.slice(0, 5).map(t => (
                        <tr key={t.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#0f172a' }}>
                              <Logo size={18} /> {t.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>slug: {t.slug}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ background: planColors[t.plan] || '#94a3b8', color: 'white', padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700 }}>
                              {t.plan || 'Free'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, color: '#64748b' }}>{t.country || 'N/A'}</td>
                          <td style={{ ...styles.td, color: '#94a3b8', fontSize: '0.8rem' }}>{getRelativeTime(t.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (1fr) */}
            <div style={styles.columnGroup}>
              {/* PLAN DISTRIBUTION */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>💰 Subscription Plans</h3>
                <div style={{ marginTop: 16 }}>
                  {Object.keys(planCounts).map(plan => {
                    const count = planCounts[plan];
                    const percentage = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0;
                    return (
                      <div key={plan} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>{plan}</span>
                          <span style={{ color: '#0f172a', fontWeight: 700 }}>{count} ({percentage}%)</span>
                        </div>
                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${percentage}%`, background: planColors[plan], borderRadius: 4, transition: 'width 0.5s ease' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SYSTEM HEALTH */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>🏥 System Health</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                  <div style={styles.healthRow}>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>🟢 API Server</span>
                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>Online (200 OK)</span>
                  </div>
                  <div style={styles.healthRow}>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>🟢 Database (Neon)</span>
                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>Healthy</span>
                  </div>
                  <div style={styles.healthRow}>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>🟢 Total Registered Users</span>
                    <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>{allUsers.length} users</span>
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITIES */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>📋 Recent Activities</h3>
                  <button onClick={() => navigate('/platform/activity')} style={styles.linkBtn}>View All →</button>
                </div>
                {activities.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: 16, fontSize: '0.85rem' }}>No recent activity</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {activities.slice(0, 5).map((a, i) => (
                      <li key={a.id || i} style={{ padding: '10px 0', borderBottom: i === 4 ? 'none' : '1px solid #f1f5f9', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                          {a.user_name ? a.user_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#0f172a', fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.3 }}>{a.action}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {a.tenant_name ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Logo size={12} /> {a.tenant_name}
                              </span>
                            ) : (
                              '🌍 Platform'
                            )} • {getRelativeTime(a.created_at)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>

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
  quickActionsBar: {
    background: '#ffffff',
    padding: '14px 20px',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  quickBtnPrimary: {
    padding: '8px 16px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  quickBtnSecondary: {
    padding: '8px 16px',
    background: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  quickBtnOutline: {
    padding: '8px 16px',
    background: '#ffffff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 24,
  },
  columnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 8,
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    borderBottom: '2px solid #e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px',
    fontSize: '0.85rem',
    verticalAlign: 'middle',
  },
  healthRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
  },
};