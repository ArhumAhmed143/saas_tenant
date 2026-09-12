import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { 
    currentUser, users, tasks, sprints, activities,
    getTasksByUser, getWorkloadByUser, getOverdueTasks,
    fetchUsers, fetchTasks, fetchSprints, fetchActivities
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  // ✅ Force fetch with loading state
  const fetchData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchTasks(),
        fetchSprints(),
        fetchActivities()
      ]);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============ DATA ============
  const myTasks = getTasksByUser(currentUser?.id);
  const workload = getWorkloadByUser();
  const overdueTasks = getOverdueTasks();

  const totalMyTasks = myTasks.length;
  const myDone = myTasks.filter(t => t.status === 'Done').length;
  const myInProgress = myTasks.filter(t => t.status === 'In-Progress').length;
  const myTodo = myTasks.filter(t => t.status === 'To-Do').length;
  const myProgress = totalMyTasks > 0 ? Math.round((myDone / totalMyTasks) * 100) : 0;

  const workloadArray = Object.keys(workload).map(id => ({ id, ...workload[id] }));

  // ============ WORKLOAD BALANCING SUGGESTIONS ============
  const getBalanceSuggestions = () => {
    if (workloadArray.length < 2) return [];

    const sorted = [...workloadArray].sort((a, b) => b.assigned - a.assigned);
    const maxAssigned = sorted[0];
    const minAssigned = sorted[sorted.length - 1];

    const suggestions = [];

    if (maxAssigned.pending > 5) {
      suggestions.push({
        type: 'warning',
        text: `${maxAssigned.name} has ${maxAssigned.pending} pending tasks — consider reassigning.`
      });
    }

    if (maxAssigned.assigned - minAssigned.assigned > 3) {
      suggestions.push({
        type: 'info',
        text: `Workload imbalance: ${maxAssigned.name} (${maxAssigned.assigned}) vs ${minAssigned.name} (${minAssigned.assigned}).`
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        text: 'Team workload is well-balanced! ✅'
      });
    }

    return suggestions;
  };
  const balanceSuggestions = getBalanceSuggestions();

  // ============ TASK DISTRIBUTION ============
  const taskStatusCounts = {
    'Done': tasks.filter(t => t.status === 'Done').length,
    'In-Progress': tasks.filter(t => t.status === 'In-Progress').length,
    'To-Do': tasks.filter(t => t.status === 'To-Do').length,
  };
  const taskStatusColors = {
    'Done': '#22c55e',
    'In-Progress': '#f59e0b',
    'To-Do': '#94a3b8',
  };
  const totalTasks = tasks.length;

  // ============ ACTIVE SPRINTS ============
  const today = new Date();
  const activeSprints = sprints.filter(s => {
    const start = new Date(s.start_date);
    const end = new Date(s.end_date);
    return today >= start && today <= end;
  });

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <NotificationBell />

      <main className="main-content" style={{ marginLeft: 240, padding: 32, paddingTop: 80, width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0ea5e9' }}>
            👨‍💼 Manager Dashboard
          </h1>
          <p style={{ color: '#64748b' }}>
            Welcome, <strong style={{ color: '#0ea5e9' }}>{currentUser?.name}</strong> — Team lead access
          </p>
        </div>

        {/* STATS CARDS (5) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>📋</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{totalMyTasks}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>My Tasks</div>
          </div>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>✅</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#22c55e' }}>{myDone}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Completed</div>
          </div>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🔄</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b' }}>{myInProgress}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>In Progress</div>
          </div>
          <div style={{ 
            background: overdueTasks.length > 0 ? '#fef2f2' : 'white', 
            padding: '18px 20px', 
            borderRadius: 14, 
            border: overdueTasks.length > 0 ? '2px solid #ef4444' : '1px solid #e2e8f0' 
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>⏰</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: overdueTasks.length > 0 ? '#dc2626' : '#0f172a' }}>{overdueTasks.length}</div>
            <div style={{ color: overdueTasks.length > 0 ? '#dc2626' : '#64748b', fontSize: '0.8rem' }}>Overdue</div>
          </div>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>👥</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{users.length}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Team Members</div>
          </div>
        </div>

        {/* ROW 1: My Progress + Task Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          
          {/* My Progress */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>📈 My Progress</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b', marginBottom: 6 }}>
              <span>{myDone} / {totalMyTasks} tasks done</span>
              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>{myProgress}%</span>
            </div>
            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ height: '100%', width: `${myProgress}%`, background: '#0ea5e9', borderRadius: 5 }}></div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div><span style={{ color: '#22c55e' }}>●</span> Done: <strong>{myDone}</strong></div>
              <div><span style={{ color: '#f59e0b' }}>●</span> In Progress: <strong>{myInProgress}</strong></div>
              <div><span style={{ color: '#94a3b8' }}>●</span> To-Do: <strong>{myTodo}</strong></div>
            </div>
          </div>

          {/* Task Distribution */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>📊 Task Distribution (Team)</h3>
            {totalTasks === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No tasks yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.keys(taskStatusCounts).map(status => {
                  const count = taskStatusCounts[status];
                  const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>{status}</span>
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{count} ({percentage}%)</span>
                      </div>
                      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percentage}%`, background: taskStatusColors[status], borderRadius: 4 }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: Team Workload + Suggestions */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          
          {/* Team Workload */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>👥 Team Workload</h3>
              <Link to="/team-analytics" style={{ fontSize: '0.75rem', color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>
                View Details →
              </Link>
            </div>
            {workloadArray.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No team members yet</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px', fontSize: '0.75rem', color: '#64748b' }}>Member</th>
                    <th style={{ padding: '8px', fontSize: '0.75rem', color: '#64748b' }}>Role</th>
                    <th style={{ padding: '8px', fontSize: '0.75rem', color: '#64748b' }}>Assigned</th>
                    <th style={{ padding: '8px', fontSize: '0.75rem', color: '#64748b' }}>Completed</th>
                    <th style={{ padding: '8px', fontSize: '0.75rem', color: '#64748b' }}>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {workloadArray.map(member => {
                    const isOverloaded = member.pending > 5;
                    return (
                      <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: '#0ea5e9', color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 600,
                            }}>
                              {member.name.charAt(0)}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                              {member.name} {isOverloaded && <span title="Overloaded">⚠️</span>}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px', color: '#64748b', fontSize: '0.8rem' }}>{member.role}</td>
                        <td style={{ padding: '10px 8px', fontWeight: 600 }}>{member.assigned}</td>
                        <td style={{ padding: '10px 8px', color: '#22c55e', fontWeight: 600 }}>{member.completed}</td>
                        <td style={{ padding: '10px 8px', color: isOverloaded ? '#dc2626' : '#f59e0b', fontWeight: 600 }}>
                          {member.pending}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Workload Suggestions */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>⚖️ Balancing Suggestions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {balanceSuggestions.map((s, i) => {
                const colors = {
                  warning: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '⚠️' },
                  info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', icon: '💡' },
                  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: '✅' },
                };
                const c = colors[s.type];
                return (
                  <div key={i} style={{
                    padding: '12px 14px',
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    color: c.text,
                    lineHeight: 1.5,
                  }}>
                    {c.icon} {s.text}
                  </div>
                );
              })}
            </div>

            {activeSprints.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: 10 }}>🏃 Active Sprints</h4>
                {activeSprints.slice(0, 2).map(sprint => (
                  <div key={sprint.id} style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
                    • {sprint.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: Quick Actions + Recent Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          
          {/* Quick Actions */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button 
                onClick={() => navigate('/tasks')} 
                style={{ padding: '10px 16px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
              >
                ✅ Manage Tasks
              </button>
              <button 
                onClick={() => navigate('/sprints')} 
                style={{ padding: '10px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
              >
                🏃 Plan Sprint
              </button>
              <button 
                onClick={() => navigate('/team-analytics')} 
                style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
              >
                📊 Team Analytics
              </button>
              <button 
                onClick={fetchData} 
                disabled={refreshing}
                style={{ 
                  padding: '10px 16px', 
                  background: refreshing ? '#e2e8f0' : '#f1f5f9', 
                  color: refreshing ? '#94a3b8' : '#0f172a', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 8, 
                  fontWeight: 600, 
                  fontSize: '0.85rem', 
                  cursor: refreshing ? 'not-allowed' : 'pointer', 
                  textAlign: 'left' 
                }}
              >
                {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>📋 Recent Activity</h3>
              <Link to="/activity" style={{ fontSize: '0.75rem', color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>
                View All →
              </Link>
            </div>
            {activities.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20, fontSize: '0.85rem' }}>
                No recent activity
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {activities.slice(0, 5).map((a, i) => (
                  <li key={a.id || i} style={{
                    padding: '10px 0',
                    borderBottom: i === activities.slice(0, 5).length - 1 ? 'none' : '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                  }}>
                    <span style={{ color: '#0f172a' }}>• {a.action}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
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