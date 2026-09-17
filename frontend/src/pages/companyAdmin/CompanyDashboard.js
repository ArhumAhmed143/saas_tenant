import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { 
    projects, tasks, users, activities, currentUser, 
    getOverdueTasks, burndownData, getWorkloadByUser,
    fetchUsers, fetchProjects, fetchTasks, fetchActivities, fetchSprints
  } = useApp();

  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchProjects(),
        fetchTasks(),
        fetchActivities(),
        fetchSprints(),
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

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In-Progress').length;
  const todoTasks = tasks.filter(t => t.status === 'To-Do').length;
  
  const overdueTasks = getOverdueTasks();
  const overdueCount = overdueTasks.length;

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
    <div style={styles.appContainer}>
      <Sidebar />
      
      <div style={styles.mainWrapper}>
        <PageHeader
          title="🏢 Company Admin Dashboard"
          subtitle={`Welcome back, ${currentUser?.name || 'Admin'} — Full workspace access & company analytics`}
          color="#4f46e5"
          onRefresh={fetchData}
          loading={loading}
        />

        <div style={styles.contentContainer}>
          {/* STATS CARDS GRID (5 CARDS) */}
          <div style={styles.statsGrid}>
            <StatsCard
              icon="📂"
              value={projects.length}
              label="Total Projects"
              color="#4f46e5"
              onClick={() => navigate('/projects')}
            />
            <StatsCard
              icon="✅"
              value={totalTasks}
              label="Total Tasks"
              color="#0ea5e9"
              onClick={() => navigate('/tasks')}
            />
            <StatsCard
              icon="🔄"
              value={inProgressTasks}
              label="In Progress"
              color="#f59e0b"
              onClick={() => navigate('/tasks')}
            />
            <StatsCard
              icon="👥"
              value={users.length}
              label="Team Members"
              color="#22c55e"
              onClick={() => navigate('/organization')}
            />
            <StatsCard
              icon="⏰"
              value={overdueCount}
              label={overdueCount === 0 ? 'No Overdue Tasks' : 'Overdue Tasks!'}
              color="#dc2626"
              highlight={overdueCount > 0}
            />
          </div>

          {/* ROW 1: Overall Progress + Sprint Burndown */}
          <div style={styles.twoColumnGrid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📈 Overall Task Completion Progress</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b', margin: '16px 0 6px 0' }}>
                <span>{completedTasks} / {totalTasks} tasks done</span>
                <span style={{ fontWeight: 700, color: '#4f46e5' }}>{progress}%</span>
              </div>
              <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#4f46e5', borderRadius: 5, transition: 'width 0.5s ease' }}></div>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
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

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📉 Sprint Burndown</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 110, gap: 8, marginTop: 16 }}>
                {chartData.map((d, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ 
                      width: '100%', 
                      height: `${(d.remaining / maxRemaining) * 80}px`, 
                      background: '#4f46e5', 
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px'
                    }}></div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 8, fontWeight: 600 }}>{d.day}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
                Remaining Tasks (Last 5 Days)
              </div>
            </div>
          </div>

          {/* ROW 2: Projects + Quick Actions */}
          <div style={styles.twoColumnGrid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>📂 Projects by Status</h3>
                <Link to="/projects" style={styles.linkBtn}>View All →</Link>
              </div>
              {projects.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24, margin: 0 }}>No projects created yet</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12, marginTop: 12 }}>
                  {Object.keys(projectStatusCounts).map(status => (
                    <div key={status} style={{
                      padding: 16,
                      background: '#f8fafc',
                      borderRadius: 12,
                      borderLeft: `4px solid ${projectStatusColors[status]}`,
                    }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                        {projectStatusCounts[status]}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, fontWeight: 600 }}>{status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                <button onClick={() => navigate('/projects')} style={styles.actionBtnPrimary}>
                  + New Project
                </button>
                <button onClick={() => navigate('/tasks')} style={styles.actionBtnSecondary}>
                  + New Task
                </button>
                <button onClick={() => navigate('/sprints')} style={styles.actionBtnWarning}>
                  + New Sprint
                </button>
                <button onClick={() => navigate('/organization')} style={styles.actionBtnOutline}>
                  👥 Manage Team
                </button>
              </div>
            </div>
          </div>

          {/* ROW 3: Team Workload + Recent Activity */}
          <div style={styles.twoColumnGrid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>👥 Team Workload</h3>
                <Link to="/team-analytics" style={styles.linkBtn}>Details →</Link>
              </div>
              {workloadArray.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24, margin: 0 }}>No team members assigned</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                  {workloadArray.slice(0, 5).map(member => {
                    const memberProgress = member.assigned > 0 ? Math.round((member.completed / member.assigned) * 100) : 0;
                    const isOverloaded = member.pending > 4;
                    return (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: '#4f46e5', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                              {member.name} {isOverloaded && <span title="Overloaded">⚠️</span>}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {member.completed}/{member.assigned} tasks
                            </span>
                          </div>
                          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${memberProgress}%`, background: memberProgress > 70 ? '#22c55e' : '#f59e0b', borderRadius: 3 }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                      gap: 12,
                    }}>
                      <span style={{ color: '#0f172a', fontSize: '0.84rem', flex: 1 }}>
                        • {a.action}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
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
    color: '#4f46e5',
    fontSize: '0.8rem',
    fontWeight: 600,
    textDecoration: 'none',
  },
  actionBtnPrimary: {
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
  actionBtnSecondary: {
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
  actionBtnOutline: {
    padding: '10px 16px',
    background: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    textAlign: 'left',
  },
};