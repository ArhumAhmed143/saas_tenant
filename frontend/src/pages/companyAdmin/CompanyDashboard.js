import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { 
    projects, tasks, users, activities, currentUser, 
    getOverdueTasks, burndownData, getWorkloadByUser,
    fetchUsers, fetchProjects, fetchTasks, fetchActivities, fetchSprints
  } = useApp();

  // ✅ Force fetch on mount
  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchTasks();
    fetchActivities();
    fetchSprints();
  }, [fetchUsers, fetchProjects, fetchTasks, fetchActivities, fetchSprints]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In-Progress').length;
  const todoTasks = tasks.filter(t => t.status === 'To-Do').length;
  
  const overdueTasks = getOverdueTasks();
  const overdueCount = overdueTasks.length;

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: '📂', color: '#4f46e5' },
    { label: 'Total Tasks', value: totalTasks, icon: '✅', color: '#0ea5e9' },
    { label: 'In Progress', value: inProgressTasks, icon: '🔄', color: '#f59e0b' },
    { label: 'Team Members', value: users.length, icon: '👥', color: '#22c55e' },
  ];

  const projectStatusCounts = {
    'Active': projects.filter(p => p.status === 'Active').length,
    'Planning': projects.filter(p => p.status === 'Planning').length,
    'Completed': projects.filter(p => p.status === 'Completed').length,
    'On Hold': projects.filter(p => p.status === 'On Hold').length,
  };
  const projectStatusColors = {
    'Active': '#22c55e',
    'Planning': '#f59e0b',
    'Completed': '#4f46e5',
    'On Hold': '#ef4444',
  };

  const workload = getWorkloadByUser();
  const workloadArray = Object.keys(workload).map(id => ({ id, ...workload[id] }));

  const hasRealData = burndownData && burndownData.length > 0 && burndownData.some(d => d.completed > 0);
  let chartData = [];
  if (hasRealData) {
    let cumulativeCompleted = 0;
    chartData = burndownData.map(d => {
      cumulativeCompleted += d.completed;
      return { day: d.day, remaining: Math.max(0, totalTasks - cumulativeCompleted) };
    });
  } else {
    let remaining = totalTasks - completedTasks;
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayRemaining = Math.max(0, remaining - (4 - i) * Math.floor(remaining / 5));
      chartData.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), remaining: dayRemaining });
    }
  }
  const maxRemaining = Math.max(...chartData.map(d => d.remaining), 1);

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <NotificationBell />   {/* 🆕 Bell icon - top-right corner */}
      
      <main className="main-content" style={{ marginLeft: 240, padding: 32, width: '100%', paddingTop: 80 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4f46e5' }}>
            🏢 Company Admin Dashboard
          </h1>
          <p style={{ color: '#64748b' }}>
            Welcome, <strong style={{ color: '#4f46e5' }}>{currentUser?.name}</strong> — Full company access
          </p>
        </div>

        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{stat.label}</div>
            </div>
          ))}
          <div style={{ 
            background: overdueCount > 0 ? '#fef2f2' : 'white', 
            padding: '18px 20px', 
            borderRadius: 14, 
            border: overdueCount > 0 ? '2px solid #ef4444' : '1px solid #e2e8f0' 
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>⏰</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: overdueCount > 0 ? '#dc2626' : '#0f172a' }}>{overdueCount}</div>
            <div style={{ color: overdueCount > 0 ? '#dc2626' : '#64748b', fontSize: '0.8rem' }}>
              {overdueCount === 0 ? 'No Overdue' : 'Overdue Tasks!'}
            </div>
          </div>
        </div>

        {/* ROW 1: Overall Progress + Sprint Burndown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>📈 Overall Progress</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b', marginBottom: 6 }}>
              <span>{completedTasks} / {totalTasks} tasks done</span>
              <span style={{ fontWeight: 700, color: '#4f46e5' }}>{progress}%</span>
            </div>
            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#4f46e5', borderRadius: 5 }}></div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>●</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Done: <strong style={{ color: '#0f172a' }}>{completedTasks}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>●</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>In Progress: <strong style={{ color: '#0f172a' }}>{inProgressTasks}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>●</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>To-Do: <strong style={{ color: '#0f172a' }}>{todoTasks}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>📉 Sprint Burndown</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 100, gap: 4 }}>
              {chartData.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ 
                    width: '100%', 
                    height: `${(d.remaining / maxRemaining) * 80}px`, 
                    background: '#4f46e5', 
                    borderRadius: '4px 4px 0 0',
                    minHeight: '4px'
                  }}></div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 6 }}>{d.day}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
              Remaining Tasks (Last 5 Days)
            </div>
          </div>
        </div>

        {/* ROW 2: Projects + Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>📂 Projects by Status</h3>
              <Link to="/projects" style={{ fontSize: '0.75rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                View All →
              </Link>
            </div>
            {projects.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No projects yet</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {Object.keys(projectStatusCounts).map(status => (
                  <div key={status} style={{
                    padding: 16,
                    background: '#f8fafc',
                    borderRadius: 10,
                    borderLeft: `4px solid ${projectStatusColors[status]}`,
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                      {projectStatusCounts[status]}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>{status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => navigate('/projects')} style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
                + New Project
              </button>
              <button onClick={() => navigate('/tasks')} style={{ padding: '10px 16px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
                + New Task
              </button>
              <button onClick={() => navigate('/sprints')} style={{ padding: '10px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
                + New Sprint
              </button>
              <button onClick={() => navigate('/organization')} style={{ padding: '10px 16px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
                👥 Manage Team
              </button>
            </div>
          </div>
        </div>

        {/* ROW 3: Team Workload + Recent Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>👥 Team Workload</h3>
              <Link to="/team-analytics" style={{ fontSize: '0.75rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                Details →
              </Link>
            </div>
            {workloadArray.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No team members yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {workloadArray.slice(0, 5).map(member => {
                  const memberProgress = member.assigned > 0 ? Math.round((member.completed / member.assigned) * 100) : 0;
                  const isOverloaded = member.pending > 4;
                  return (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: '#4f46e5', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 600, flexShrink: 0,
                      }}>
                        {member.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>
                            {member.name} {isOverloaded && <span title="Overloaded">⚠️</span>}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {member.completed}/{member.assigned} tasks
                          </span>
                        </div>
                        <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${memberProgress}%`, background: memberProgress > 70 ? '#22c55e' : '#f59e0b', borderRadius: 3 }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>📋 Recent Activity</h3>
              <Link to="/activity" style={{ fontSize: '0.75rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                View All →
              </Link>
            </div>
            {activities.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20, fontSize: '0.85rem' }}>
                No recent activity
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, maxHeight: 280, overflowY: 'auto' }}>
                {activities.slice(0, 6).map((a, i) => (
                  <li key={a.id || i} style={{ 
                    padding: '10px 0', 
                    borderBottom: i === activities.slice(0, 6).length - 1 ? 'none' : '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <span style={{ color: '#0f172a', fontSize: '0.85rem', flex: 1 }}>
                      • {a.action}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}