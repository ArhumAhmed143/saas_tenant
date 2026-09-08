import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    projects, tasks, users, activities, currentUser, 
    getOverdueTasks, burndownData 
  } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In-Progress').length;
  const todoTasks = tasks.filter(t => t.status === 'To-Do').length;
  
  const overdueTasks = getOverdueTasks();
  const overdueCount = overdueTasks.length;

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: '📂', color: '#4f46e5' },
    { label: 'Total Tasks', value: totalTasks, icon: '✅', color: '#0ea5e9' },
    { label: 'In Progress', value: inProgressTasks, icon: '🔄', color: '#f59e0b' },
    { label: 'Team Members', value: users.length, icon: '👥', color: '#22c55e' },
  ];

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // ---------- REAL / DEMO BURNDOWN DATA ----------
  const hasRealData = burndownData && burndownData.length > 0 && burndownData.some(d => d.completed > 0);
  
  let chartData = [];
  if (hasRealData) {
    let cumulativeCompleted = 0;
    chartData = burndownData.map(d => {
      cumulativeCompleted += d.completed;
      const remaining = Math.max(0, totalTasks - cumulativeCompleted);
      return { day: d.day, remaining: remaining };
    });
  } else {
    // Fallback mock data (if no real data yet)
    let remaining = totalTasks - completedTasks;
    const today = new Date();
    const fallback = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayRemaining = Math.max(0, remaining - (4 - i) * Math.floor(remaining / 5));
      fallback.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        remaining: dayRemaining,
      });
    }
    chartData = fallback;
  }

  const maxRemaining = Math.max(...chartData.map(d => d.remaining), 1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>
            👋 Welcome back, {currentUser?.name}
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Role: <strong style={{ color: '#4f46e5' }}>{currentUser?.role}</strong>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              background: 'white',
              padding: '20px 24px',
              borderRadius: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2rem', marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{stat.label}</div>
            </div>
          ))}
          
          <div style={{
            background: overdueCount > 0 ? '#fef2f2' : 'white',
            padding: '20px 24px',
            borderRadius: 16,
            border: overdueCount > 0 ? '2px solid #ef4444' : '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 4 }}>⏰</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: overdueCount > 0 ? '#dc2626' : '#0f172a' }}>
              {overdueCount}
            </div>
            <div style={{ color: overdueCount > 0 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: overdueCount > 0 ? 600 : 400 }}>
              {overdueCount === 0 ? 'No Overdue Tasks' : 'Overdue Tasks!'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 24, alignItems: 'start' }}>
          
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12, color: '#0f172a' }}>📈 Overall Progress</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b', marginBottom: 6 }}>
              <span>{completedTasks} / {totalTasks} tasks done</span>
              <span>{progress}%</span>
            </div>
            <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#4f46e5', borderRadius: 4, transition: 'width 0.5s' }}></div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div><span style={{ color: '#22c55e' }}>●</span> Done: <strong>{completedTasks}</strong></div>
              <div><span style={{ color: '#f59e0b' }}>●</span> In Progress: <strong>{inProgressTasks}</strong></div>
              <div><span style={{ color: '#94a3b8' }}>●</span> To-Do: <strong>{todoTasks}</strong></div>
            </div>
          </div>

          {/* 🔥 FINAL BURNDOWN - "MOCK" AUR "(DEMO)" DONO HAT GAYE */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12, color: '#0f172a' }}>
              📉 Sprint Burndown
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 60, gap: 4 }}>
              {chartData.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ 
                    width: '100%', 
                    height: `${(d.remaining / maxRemaining) * 50}px`, 
                    background: '#4f46e5', 
                    borderRadius: '4px 4px 0 0',
                    minHeight: '4px'
                  }}></div>
                  <div style={{ fontSize: '0.5rem', color: '#94a3b8', marginTop: 4 }}>{d.day}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
              Remaining Tasks (Last 5 Days)
            </div>
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12, color: '#0f172a' }}>⚡ Quick Actions</h3>
            <button onClick={() => navigate('/projects')} style={{ width: '100%', padding: '10px', marginBottom: 8, background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>+ New Project</button>
            <button onClick={() => navigate('/tasks')} style={{ width: '100%', padding: '10px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
          </div>
        </div>

        <div style={{ marginTop: 32, background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: '#0f172a' }}>📋 Recent Activity</h3>
          {activities.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No recent activity</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {activities.slice(0, 5).map((a, index) => (
                <li key={a.id} style={{ padding: '12px 0', borderBottom: index === activities.slice(0, 5).length - 1 ? 'none' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#0f172a' }}>• {a.action}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{a.createdAt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}