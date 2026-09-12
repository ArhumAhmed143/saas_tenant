import { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import api from '../../api';

export default function PlatformAnalytics() {
  const [tenants, setTenants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/platform/tenants')
        .then(res => setTenants(res.data)),
      api.get('/api/platform/users')
        .then(res => setAllUsers(res.data)),
    ])
    .catch(err => console.error('❌ Analytics error:', err))
    .finally(() => setLoading(false));
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

  const currentMonthCompanies = growthData[growthData.length - 1].companies;
  const lastMonthCompanies = growthData[growthData.length - 2]?.companies || 0;
  const growthRate = currentMonthCompanies - lastMonthCompanies;

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main className="main-content" style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          📈 Platform Analytics
        </h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Growth metrics and plan distribution</p>

        {/* Growth Chart */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>📈 Platform Growth (Last 6 Months)</h3>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem' }}>
              <span style={{ color: '#4f46e5' }}>● Companies</span>
              <span style={{ color: '#0ea5e9' }}>● Users</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 12, paddingBottom: 30 }}>
            {growthData.map((d, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: '100%', width: '100%', justifyContent: 'center' }}>
                  <div title={`Companies: ${d.companies}`} style={{ width: '30%', height: `${(d.companies / maxGrowth) * 100}%`, background: '#4f46e5', borderRadius: '4px 4px 0 0', minHeight: d.companies > 0 ? 4 : 0 }}></div>
                  <div title={`Users: ${d.users}`} style={{ width: '30%', height: `${(d.users / maxGrowth) * 100}%`, background: '#0ea5e9', borderRadius: '4px 4px 0 0', minHeight: d.users > 0 ? 4 : 0 }}></div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 8 }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: 20 }}>💰 Plan Distribution</h3>
            {Object.keys(planCounts).map(plan => {
              const count = planCounts[plan];
              const percentage = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0;
              return (
                <div key={plan} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6 }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>{plan}</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: planColors[plan], borderRadius: 4 }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: 20 }}>📊 Key Metrics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Total Companies</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.2rem' }}>{tenants.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Total Users</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.2rem' }}>{allUsers.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Avg Users/Company</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.2rem' }}>
                  {tenants.length > 0 ? (allUsers.length / tenants.length).toFixed(1) : 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ color: '#64748b' }}>Growth (This Month)</span>
                <span style={{ fontWeight: 700, color: growthRate > 0 ? '#22c55e' : '#64748b', fontSize: '1.2rem' }}>
                  {growthRate > 0 ? `📈 +${growthRate}` : growthRate === 0 ? '—' : `📉 ${growthRate}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}