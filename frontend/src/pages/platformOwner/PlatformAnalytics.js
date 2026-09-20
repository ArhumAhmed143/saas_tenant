import { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import api from '../../api';

export default function PlatformAnalytics() {
  const [tenants, setTenants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/platform/tenants')
        .then(res => setTenants(res.data)),
      api.get('/api/platform/users')
        .then(res => setAllUsers(res.data)),
    ])
    .catch(err => console.error('❌ Analytics error:', err))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const planCounts = { Free: 0, Basic: 0, Pro: 0, Enterprise: 0 };
  tenants.forEach(t => {
    const plan = t.plan || 'Free';
    if (planCounts[plan] !== undefined) planCounts[plan]++;
  });
  const planColors = { Free: '#94a3b8', Basic: '#22c55e', Pro: '#0ea5e9', Enterprise: '#7c3aed' };

  const getGrowthData = () => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const companiesCount = tenants.filter(t => t.created_at && new Date(t.created_at) < nextMonth).length;
      const usersCount = allUsers.filter(u => u.created_at && new Date(u.created_at) < nextMonth).length;
      months.push({ month: d.toLocaleDateString('en-US', { month: 'short' }), companies: companiesCount, users: usersCount });
    }
    return months;
  };
  const growthData = getGrowthData();
  const maxGrowth = Math.max(...growthData.map(d => Math.max(d.companies, d.users)), 1);

  const currentMonthCompanies = growthData[growthData.length - 1]?.companies || 0;
  const lastMonthCompanies = growthData[growthData.length - 2]?.companies || 0;
  const growthRate = currentMonthCompanies - lastMonthCompanies;
  const avgUsersPerCompany = tenants.length > 0 ? (allUsers.length / tenants.length).toFixed(1) : 0;

  return (
    <div style={styles.appContainer}>
      <Sidebar />

      <div className="main-wrapper" style={styles.mainWrapper}>
        <PageHeader
          title="📈 Platform Analytics"
          subtitle="Growth metrics, user expansion trends, and plan distribution across all tenants"
          color="#dc2626"
          onRefresh={fetchAnalytics}
          loading={loading}
        />

        <div className="content-container" style={styles.contentContainer}>
          {/* STATS CARDS GRID (4 CARDS) */}
          <div className="stats-grid" style={styles.statsGrid}>
            <StatsCard value={tenants.length} label="Total Companies" color="#4f46e5" />
            <StatsCard value={allUsers.length} label="Total Platform Users" color="#0ea5e9" />
            <StatsCard
              value={growthRate > 0 ? `+${growthRate}` : `${growthRate}`}
              label="Growth (This Month)"
              color={growthRate >= 0 ? "#22c55e" : "#dc2626"}
            />
            <StatsCard value={avgUsersPerCompany} label="Avg Users / Company" color="#7c3aed" />
          </div>

          {/* LARGE GROWTH CHART (FULL WIDTH) */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📈 Platform Growth Trend (Last 6 Months)</h3>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem' }}>
                <span style={{ color: '#4f46e5', fontWeight: 600 }}>● Companies</span>
                <span style={{ color: '#0ea5e9', fontWeight: 600 }}>● Users</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 220, gap: 16, paddingTop: 20 }}>
              {growthData.map((d, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: '100%', width: '100%', justifyContent: 'center' }}>
                    <div title={`Companies: ${d.companies}`} style={{ width: '32%', height: `${(d.companies / maxGrowth) * 100}%`, background: '#4f46e5', borderRadius: '4px 4px 0 0', minHeight: d.companies > 0 ? 4 : 0 }}></div>
                    <div title={`Users: ${d.users}`} style={{ width: '32%', height: `${(d.users / maxGrowth) * 100}%`, background: '#0ea5e9', borderRadius: '4px 4px 0 0', minHeight: d.users > 0 ? 4 : 0 }}></div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 10, fontWeight: 600 }}>{d.month}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TWO COLUMN GRID FOR PLAN DISTRIBUTION & KEY METRICS */}
          <div className="two-column-grid" style={styles.twoColumnGrid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💰 Subscription Plan Distribution</h3>
              <div style={{ marginTop: 20 }}>
                {Object.keys(planCounts).map(plan => {
                  const count = planCounts[plan];
                  const percentage = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0;
                  return (
                    <div key={plan} style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 6 }}>
                        <span style={{ color: '#475569', fontWeight: 600 }}>{plan} Tier</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{count} ({percentage}%)</span>
                      </div>
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percentage}%`, background: planColors[plan], borderRadius: 5, transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📊 Key Growth Metrics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <div style={styles.metricRow}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Active Companies</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.15rem' }}>{tenants.length}</span>
                </div>
                <div style={styles.metricRow}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Registered Users</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.15rem' }}>{allUsers.length}</span>
                </div>
                <div style={styles.metricRow}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Average Users per Company</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.15rem' }}>{avgUsersPerCompany}</span>
                </div>
                <div style={{ ...styles.metricRow, borderBottom: 'none' }}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Monthly Growth Delta</span>
                  <span style={{ fontWeight: 700, color: growthRate > 0 ? '#22c55e' : '#64748b', fontSize: '1.15rem' }}>
                    {growthRate > 0 ? `📈 +${growthRate}` : growthRate === 0 ? '—' : `📉 ${growthRate}`}
                  </span>
                </div>
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
  },
};