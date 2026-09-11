import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

export default function PlatformOwnerDashboard() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);

    Promise.all([
      axios.get('http://localhost:5000/api/platform/tenants', { headers })
        .then(res => setTenants(res.data))
        .catch(err => console.error('Tenants:', err)),
      axios.get('http://localhost:5000/api/platform/users', { headers })
        .then(res => setAllUsers(res.data))
        .catch(err => console.error('Users:', err)),
      axios.get('http://localhost:5000/api/platform/activities', { headers })
        .then(res => setActivities(res.data))
        .catch(err => console.error('Activities:', err)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRoleColor = (role) => {
    if (role === 'PlatformOwner') return '#dc2626';
    if (role === 'Admin') return '#4f46e5';
    if (role === 'Manager') return '#0ea5e9';
    return '#94a3b8';
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <NotificationBell />

      <main style={{ marginLeft: 240, padding: 32, paddingTop: 80, width: '100%' }}>
        
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>
            👑 Platform Owner Dashboard
          </h1>
          <p style={{ color: '#64748b' }}>
            Welcome, <strong>{currentUser?.name}</strong> — Full platform access
          </p>
        </div>

        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🏢</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{tenants.length}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Total Companies</div>
          </div>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>👥</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{allUsers.length}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Total Users</div>
          </div>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>📋</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{activities.length}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Activities</div>
          </div>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>✅</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#22c55e' }}>Active</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>System Status</div>
          </div>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>💚</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#22c55e' }}>Healthy</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Database</div>
          </div>
        </div>

        {/* ROW 1: Growth Chart + Plan Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>📈 Platform Growth</h3>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem' }}>
                <span style={{ color: '#4f46e5' }}>● Companies</span>
                <span style={{ color: '#0ea5e9' }}>● Users</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 140, gap: 8, paddingBottom: 24 }}>
              {growthData.map((d, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: '100%', width: '100%', justifyContent: 'center' }}>
                    <div title={`Companies: ${d.companies}`} style={{ width: '30%', height: `${(d.companies / maxGrowth) * 100}%`, background: '#4f46e5', borderRadius: '4px 4px 0 0', minHeight: d.companies > 0 ? 4 : 0 }}></div>
                    <div title={`Users: ${d.users}`} style={{ width: '30%', height: `${(d.users / maxGrowth) * 100}%`, background: '#0ea5e9', borderRadius: '4px 4px 0 0', minHeight: d.users > 0 ? 4 : 0 }}></div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 6 }}>{d.month}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 20 }}>💰 Plan Distribution</h3>
            {Object.keys(planCounts).map(plan => {
              const count = planCounts[plan];
              const percentage = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0;
              return (
                <div key={plan} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>{plan}</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: planColors[plan], borderRadius: 3 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROW 2: System Health + Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>🏥 System Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>🟢 API Server</span>
                <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.85rem' }}>Online</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>🟢 Database</span>
                <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.85rem' }}>Healthy</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>🟢 Storage</span>
                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>0.03 GB / 0.5 GB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>🟢 Active Users</span>
                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>{allUsers.length} registered</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button 
                onClick={() => navigate('/platform/tenants')}
                style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
              >
                🏢 Manage All Companies
              </button>
              <button 
                onClick={() => navigate('/platform/users')}
                style={{ padding: '10px 16px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
              >
                👥 Manage All Users
              </button>
              <button 
                onClick={fetchData}
                style={{ padding: '10px 16px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
              >
                {loading ? '⏳ Refreshing...' : '🔄 Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* ROW 3: Companies + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>🏢 All Companies (Recent 5)</h3>
            {loading ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>Loading...</p>
            ) : tenants.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No companies</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px', fontSize: '0.75rem', color: '#64748b' }}>Company</th>
                    <th style={{ padding: '8px', fontSize: '0.75rem', color: '#64748b' }}>Plan</th>
                    <th style={{ padding: '8px', fontSize: '0.75rem', color: '#64748b' }}>Country</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.slice(0, 5).map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>🏢 {t.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t.slug}</div>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ background: planColors[t.plan] || '#94a3b8', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 600 }}>{t.plan || 'Free'}</span>
                      </td>
                      <td style={{ padding: '10px 8px', color: '#64748b', fontSize: '0.85rem' }}>{t.country || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>📋 Platform Activity</h3>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: 10 }}>Last 50</span>
            </div>
            {activities.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20, fontSize: '0.85rem' }}>
                No activities yet.
                <br />
                <span style={{ fontSize: '0.75rem' }}>Create a project to see activity</span>
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, maxHeight: 300, overflowY: 'auto' }}>
                {activities.slice(0, 15).map((a, i) => (
                  <li key={a.id || i} style={{ padding: '8px 0', borderBottom: i === activities.slice(0, 15).length - 1 ? 'none' : '1px solid #f1f5f9', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: a.tenant_id ? '#4f46e5' : '#dc2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 600, flexShrink: 0 }}>
                        {a.user_name ? a.user_name.charAt(0) : '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#0f172a', fontSize: '0.8rem', wordBreak: 'break-word' }}>{a.action}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>
                          {a.tenant_name ? `🏢 ${a.tenant_name}` : '🌍 Platform'} • {getRelativeTime(a.created_at)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ROW 4: All Users */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>👥 All Users (All Tenants)</h3>
          {allUsers.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No users found</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px', fontSize: '0.75rem', color: '#64748b' }}>Name</th>
                  <th style={{ padding: '10px', fontSize: '0.75rem', color: '#64748b' }}>Email</th>
                  <th style={{ padding: '10px', fontSize: '0.75rem', color: '#64748b' }}>Role</th>
                  <th style={{ padding: '10px', fontSize: '0.75rem', color: '#64748b' }}>Tenant</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => {
                  const userTenant = tenants.find(t => t.id === u.tenant_id);
                  const tenantDisplay = u.tenant_id 
                    ? (userTenant ? userTenant.name : `#${u.tenant_id}`) 
                    : '🌍 Platform (No Tenant)';
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 500, fontSize: '0.9rem' }}>{u.name}</td>
                      <td style={{ padding: '10px', color: '#64748b', fontSize: '0.85rem' }}>{u.email}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: getRoleColor(u.role), color: 'white', padding: '2px 10px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 600 }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '10px', color: u.tenant_id ? '#64748b' : '#dc2626', fontSize: '0.8rem', fontWeight: u.tenant_id ? 400 : 600 }}>
                        {tenantDisplay}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  );
}