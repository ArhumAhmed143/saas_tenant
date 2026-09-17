import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { 
    currentUser, users, tasks, sprints, activities,
    getTasksByUser, getWorkloadByUser, getOverdueTasks,
    fetchUsers, fetchTasks, fetchSprints, fetchActivities
  } = useApp();

  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // DATA CALCULATIONS
  const myTasks = getTasksByUser(currentUser?.id);
  const workload = getWorkloadByUser();
  const overdueTasks = getOverdueTasks();

  const totalMyTasks = myTasks.length;
  const myDone = myTasks.filter(t => t.status === 'Done').length;
  const myInProgress = myTasks.filter(t => t.status === 'In-Progress').length;
  const myTodo = myTasks.filter(t => t.status === 'To-Do').length;
  const myProgress = totalMyTasks > 0 ? Math.round((myDone / totalMyTasks) * 100) : 0;

  const workloadArray = Object.keys(workload).map(id => ({ id, ...workload[id] }));

  // WORKLOAD BALANCING SUGGESTIONS
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

  // TASK DISTRIBUTION
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

  // ACTIVE SPRINTS
  const today = new Date();
  const activeSprints = sprints.filter(s => {
    const start = new Date(s.start_date);
    const end = new Date(s.end_date);
    return today >= start && today <= end;
  });

  return (
    <div style={styles.appContainer}>
      <Sidebar />

      <div style={styles.mainWrapper}>
        <PageHeader
          title="👨‍💼 Manager Dashboard"
          subtitle={`Welcome back, ${currentUser?.name || 'Manager'} — Team workload & sprint monitoring`}
          color="#0ea5e9"
          onRefresh={fetchData}
          loading={loading}
        />

        <div style={styles.contentContainer}>
          {/* STATS CARDS GRID (5 CARDS) */}
          <div style={styles.statsGrid}>
            <StatsCard
              icon="📋"
              value={totalMyTasks}
              label="My Tasks"
              color="#0ea5e9"
              onClick={() => navigate('/my-tasks')}
            />
            <StatsCard
              icon="✅"
              value={myDone}
              label="Completed Tasks"
              color="#22c55e"
              onClick={() => navigate('/my-tasks')}
            />
            <StatsCard
              icon="🔄"
              value={myInProgress}
              label="In Progress"
              color="#f59e0b"
              onClick={() => navigate('/my-tasks')}
            />
            <StatsCard
              icon="⏰"
              value={overdueTasks.length}
              label={overdueTasks.length === 0 ? 'No Overdue Tasks' : 'Overdue Tasks!'}
              color="#dc2626"
              highlight={overdueTasks.length > 0}
            />
            <StatsCard
              icon="👥"
              value={users.length}
              label="Team Members"
              color="#4f46e5"
              onClick={() => navigate('/team-analytics')}
            />
          </div>

          {/* ROW 1: My Progress + Task Distribution */}
          <div style={styles.twoColumnGrid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📈 My Work Progress</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b', margin: '16px 0 6px 0' }}>
                <span>{myDone} / {totalMyTasks} tasks done</span>
                <span style={{ fontWeight: 700, color: '#0ea5e9' }}>{myProgress}%</span>
              </div>
              <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ height: '100%', width: `${myProgress}%`, background: '#0ea5e9', borderRadius: 5, transition: 'width 0.5s ease' }}></div>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>●</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Done: <strong style={{ color: '#0f172a' }}>{myDone}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>●</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>In Progress: <strong style={{ color: '#0f172a' }}>{myInProgress}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>●</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>To-Do: <strong style={{ color: '#0f172a' }}>{myTodo}</strong></span>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📊 Team Task Distribution</h3>
              {totalTasks === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24, margin: 0 }}>No tasks in team backlog</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                  {Object.keys(taskStatusCounts).map(status => {
                    const count = taskStatusCounts[status];
                    const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                    return (
                      <div key={status}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                          <span style={{ color: '#64748b', fontWeight: 600 }}>{status}</span>
                          <span style={{ color: '#0f172a', fontWeight: 700 }}>{count} ({percentage}%)</span>
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

          {/* ROW 2: Team Workload + Balancing Suggestions */}
          <div style={styles.twoColumnGrid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>👥 Team Workload Breakdown</h3>
                <Link to="/team-analytics" style={styles.linkBtn}>Details →</Link>
              </div>
              {workloadArray.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24, margin: 0 }}>No team members assigned</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Member</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Assigned</th>
                      <th style={styles.th}>Completed</th>
                      <th style={styles.th}>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workloadArray.map(member => {
                      const isOverloaded = member.pending > 5;
                      return (
                        <tr key={member.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: '#0ea5e9', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700,
                              }}>
                                {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                              </div>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                {member.name} {isOverloaded && <span title="Overloaded">⚠️</span>}
                              </span>
                            </div>
                          </td>
                          <td style={{ ...styles.td, color: '#64748b', fontSize: '0.8rem' }}>{member.role}</td>
                          <td style={{ ...styles.td, fontWeight: 700 }}>{member.assigned}</td>
                          <td style={{ ...styles.td, color: '#22c55e', fontWeight: 700 }}>{member.completed}</td>
                          <td style={{ ...styles.td, color: isOverloaded ? '#dc2626' : '#f59e0b', fontWeight: 700 }}>
                            {member.pending}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⚖️ Balancing Suggestions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
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
                      borderRadius: 10,
                      fontSize: '0.82rem',
                      color: c.text,
                      lineHeight: 1.5,
                      fontWeight: 500,
                    }}>
                      {c.icon} {s.text}
                    </div>
                  );
                })}
              </div>

              {activeSprints.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: 8, fontWeight: 700 }}>🏃 Active Sprints</h4>
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
          <div style={styles.twoColumnGrid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⚡ Manager Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                <button 
                  onClick={() => navigate('/tasks')} 
                  style={styles.actionBtnPrimary}
                >
                  ✅ Manage Tasks
                </button>
                <button 
                  onClick={() => navigate('/sprints')} 
                  style={styles.actionBtnWarning}
                >
                  🏃 Plan Sprint
                </button>
                <button 
                  onClick={() => navigate('/team-analytics')} 
                  style={styles.actionBtnSecondary}
                >
                  📊 Team Analytics
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>📋 Recent Activity</h3>
                <Link to="/activity" style={styles.linkBtn}>View All →</Link>
              </div>
              {activities.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24, margin: 0, fontSize: '0.85rem' }}>
                  No recent activity recorded
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {activities.slice(0, 5).map((a, i) => (
                    <li key={a.id || i} style={{
                      padding: '10px 0',
                      borderBottom: i === activities.slice(0, 5).length - 1 ? 'none' : '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.84rem',
                    }}>
                      <span style={{ color: '#0f172a' }}>• {a.action}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
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
  linkBtn: {
    color: '#0ea5e9',
    fontSize: '0.8rem',
    fontWeight: 600,
    textDecoration: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 8,
  },
  th: {
    padding: '10px 8px',
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
    padding: '10px 8px',
    fontSize: '0.85rem',
    verticalAlign: 'middle',
  },
  actionBtnPrimary: {
    padding: '10px 16px',
    background: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    textAlign: 'left',
  },
  actionBtnSecondary: {
    padding: '10px 16px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    textAlign: 'left',
  },
  actionBtnWarning: {
    padding: '10px 16px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    textAlign: 'left',
  },
};