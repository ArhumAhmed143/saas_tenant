import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';

export default function TeamDashboard() {
  const { getWorkloadByUser, getTeamStats, users, tasks } = useApp();

  const workload = getWorkloadByUser();
  const stats = getTeamStats();

  // 🆕 WORKLOAD BALANCING RECOMMENDATIONS
  const getRecommendations = () => {
    const workloadArray = Object.values(workload).filter(w => w.assigned > 0);
    if (workloadArray.length < 2) return [];

    const max = Math.max(...workloadArray.map(w => w.assigned));
    const min = Math.min(...workloadArray.map(w => w.assigned));
    const overloaded = workloadArray.filter(w => w.assigned === max);
    const underloaded = workloadArray.filter(w => w.assigned === min);

    const recommendations = [];
    // If difference is more than 2 tasks
    if (max - min > 2) {
      overloaded.forEach(o => {
        underloaded.forEach(u => {
          if (o.name !== u.name) {
            recommendations.push({
              from: o.name,
              fromCount: o.assigned,
              to: u.name,
              toCount: u.assigned,
              diff: max - min
            });
          }
        });
      });
    }
    return recommendations.slice(0, 3); // Max 3 suggestions
  };

  const recommendations = getRecommendations();

  // 🆕 TEAM BURNDOWN (Mock)
  const getTeamBurndown = () => {
    const today = new Date();
    const data = [];
    const total = stats.total || 1;
    const done = stats.done || 0;
    let remaining = total - done;
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayRemaining = Math.max(0, remaining - (4 - i) * Math.floor(remaining / 5));
      data.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        remaining: dayRemaining,
      });
    }
    return data;
  };
  const burndownData = getTeamBurndown();
  const maxRemaining = Math.max(...burndownData.map(d => d.remaining), 1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>📊 Team Analytics</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Overview of team workload and performance.</p>

        {/* 🆕 WORKLOAD BALANCING RECOMMENDATIONS */}
        {recommendations.length > 0 && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px 20px', borderRadius: 12, marginBottom: 24 }}>
            <h4 style={{ color: '#1d4ed8', marginBottom: 8 }}>⚖️ Workload Balancing Recommendations</h4>
            {recommendations.map((rec, idx) => (
              <p key={idx} style={{ margin: '4px 0', color: '#1e293b', fontSize: '0.95rem' }}>
                <strong>{rec.from}</strong> is overloaded ({rec.fromCount} tasks). 
                <strong> {rec.to}</strong> has only {rec.toCount} tasks. 
                Consider moving 1 task from {rec.from} to {rec.to}.
              </p>
            ))}
          </div>
        )}

        {/* Team Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{stats.total}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Tasks</div>
          </div>
          <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#22c55e' }}>{stats.done}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Completed</div>
          </div>
          <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ef4444' }}>{stats.overdue}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Overdue</div>
          </div>
          <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4f46e5' }}>{stats.completionRate}%</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Completion Rate</div>
          </div>
        </div>

        {/* 🆕 TEAM BURNDOWN CHART */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <h4 style={{ marginBottom: 12, color: '#0f172a' }}>📉 Team Burndown (Mock)</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 60, gap: 8 }}>
            {burndownData.map((d, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ 
                  width: '100%', 
                  height: `${(d.remaining / maxRemaining) * 50}px`, 
                  background: '#0ea5e9', 
                  borderRadius: '4px 4px 0 0',
                  minHeight: '4px'
                }}></div>
                <div style={{ fontSize: '0.5rem', color: '#94a3b8', marginTop: 4 }}>{d.day}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
            Remaining Team Tasks (Last 5 Days)
          </div>
        </div>

        {/* Member Workload Table */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <h4 style={{ marginBottom: 16, color: '#0f172a' }}>👥 Team Member Workload</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Member</th>
                  <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Role</th>
                  <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Assigned</th>
                  <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Completed</th>
                  <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Pending</th>
                  <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const w = workload[u.id] || { assigned: 0, completed: 0, pending: 0 };
                  const prog = w.assigned > 0 ? Math.round((w.completed / w.assigned) * 100) : 0;
                  const isOverloaded = w.pending > 4;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', background: isOverloaded ? '#fffbeb' : 'transparent' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 500 }}>{u.name} {isOverloaded && <span style={{ color: '#d97706', fontSize: '0.6rem', fontWeight: 600 }}>⚠️</span>}</td>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>{u.role}</td>
                      <td style={{ padding: '10px 8px' }}>{w.assigned}</td>
                      <td style={{ padding: '10px 8px', color: '#22c55e' }}>{w.completed}</td>
                      <td style={{ padding: '10px 8px', color: w.pending > 4 ? '#dc2626' : '#f59e0b' }}>{w.pending}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${prog}%`, background: prog > 70 ? '#22c55e' : '#f59e0b', borderRadius: 4 }}></div>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{prog}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}