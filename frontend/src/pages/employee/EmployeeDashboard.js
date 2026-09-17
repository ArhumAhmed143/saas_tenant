import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { 
    currentUser, getTasksByUser, activities,
    fetchTasks, fetchActivities
  } = useApp();

  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTasks(),
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

  const myTasks = getTasksByUser(currentUser?.id);
  const total = myTasks.length;
  const done = myTasks.filter(t => t.status === 'Done').length;
  const inProgress = myTasks.filter(t => t.status === 'In-Progress').length;
  const todo = myTasks.filter(t => t.status === 'To-Do').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  // Overdue
  const today = new Date();
  const myOverdue = myTasks.filter(t => {
    if (t.status === 'Done') return false;
    const d = new Date(t.createdAt);
    return (today - d) / (1000 * 60 * 60 * 24) > 1;
  });

  // Priority Breakdown
  const priorityCounts = {
    'High': myTasks.filter(t => t.priority === 'High' && t.status !== 'Done').length,
    'Medium': myTasks.filter(t => t.priority === 'Medium' && t.status !== 'Done').length,
    'Low': myTasks.filter(t => t.priority === 'Low' && t.status !== 'Done').length,
  };
  const priorityColors = {
    'High': '#ef4444',
    'Medium': '#f59e0b',
    'Low': '#22c55e',
  };

  // Personal Activities
  const myActivities = activities.filter(a => a.user_id === currentUser?.id || a.userId === currentUser?.id).slice(0, 6);

  return (
    <div style={styles.appContainer}>
      <Sidebar />

      <div style={styles.mainWrapper}>
        <PageHeader
          title="👤 Employee Dashboard"
          subtitle={`Welcome back, ${currentUser?.name || 'User'} — Your personal workspace & assigned tasks`}
          color="#22c55e"
          onRefresh={fetchData}
          loading={loading}
        />

        <div style={styles.contentContainer}>
          {/* STATS CARDS GRID (4 CARDS) */}
          <div style={styles.statsGrid}>
            <StatsCard
              icon="📋"
              value={total}
              label="Total Assigned Tasks"
              color="#4f46e5"
              onClick={() => navigate('/my-tasks')}
            />
            <StatsCard
              icon="✅"
              value={done}
              label="Completed Tasks"
              color="#22c55e"
              onClick={() => navigate('/my-tasks')}
            />
            <StatsCard
              icon="🔄"
              value={inProgress}
              label="In Progress"
              color="#f59e0b"
              onClick={() => navigate('/my-tasks')}
            />
            <StatsCard
              icon="⏰"
              value={myOverdue.length}
              label={myOverdue.length === 0 ? 'No Overdue Tasks' : 'Overdue Tasks!'}
              color="#dc2626"
              highlight={myOverdue.length > 0}
            />
          </div>

          {/* ROW 1: My Progress + Priority Breakdown */}
          <div style={styles.twoColumnGrid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📈 My Personal Completion Progress</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b', margin: '16px 0 6px 0' }}>
                <span>{done} / {total} tasks done</span>
                <span style={{ fontWeight: 700, color: '#22c55e' }}>{progress}%</span>
              </div>
              <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#22c55e', borderRadius: 5, transition: 'width 0.5s ease' }}></div>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>●</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Done: <strong style={{ color: '#0f172a' }}>{done}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>●</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>In Progress: <strong style={{ color: '#0f172a' }}>{inProgress}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>●</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>To-Do: <strong style={{ color: '#0f172a' }}>{todo}</strong></span>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🎯 Pending Tasks by Priority</h3>
              <div style={{ marginTop: 16 }}>
                {Object.keys(priorityCounts).map(priority => {
                  const count = priorityCounts[priority];
                  const pendingTotal = priorityCounts.High + priorityCounts.Medium + priorityCounts.Low;
                  const percentage = pendingTotal > 0 ? Math.round((count / pendingTotal) * 100) : 0;
                  return (
                    <div key={priority} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>{priority} Priority</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{count} ({percentage}%)</span>
                      </div>
                      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percentage}%`, background: priorityColors[priority], borderRadius: 4 }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ROW 2: My Tasks + Quick Actions */}
          <div style={styles.twoColumnGrid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>📋 My Assigned Tasks ({total})</h3>
                <Link to="/my-tasks" style={styles.linkBtn}>View All →</Link>
              </div>
              {myTasks.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: 30, margin: 0 }}>
                  No tasks assigned yet. Your manager will assign tasks here!
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 280, overflowY: 'auto' }}>
                  {myTasks.slice(0, 5).map(t => {
                    const isOverdue = t.status !== 'Done' && (today - new Date(t.createdAt)) / (1000 * 60 * 60 * 24) > 1;
                    return (
                      <li key={t.id} style={{
                        padding: '12px 0',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isOverdue ? '#fef2f2' : 'transparent',
                        paddingLeft: isOverdue ? 8 : 0,
                        borderRadius: isOverdue ? 4 : 0,
                      }}>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                          <Link to={`/tasks/${t.id}`} style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'none', fontSize: '0.88rem' }}>
                            {t.title}
                          </Link>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                            <span style={{
                              background: priorityColors[t.priority] || '#94a3b8',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                            }}>{t.priority}</span>
                            {isOverdue && <span style={{ color: '#dc2626', fontSize: '0.65rem', fontWeight: 700 }}>⚠️ OVERDUE</span>}
                          </div>
                        </div>
                        <span style={{
                          background: t.status === 'Done' ? '#22c55e' : t.status === 'In-Progress' ? '#f59e0b' : '#94a3b8',
                          color: 'white',
                          padding: '3px 12px',
                          borderRadius: 12,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>{t.status}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                <button 
                  onClick={() => navigate('/my-tasks')} 
                  style={styles.actionBtnPrimary}
                >
                  👤 My Tasks ({total})
                </button>
                <button 
                  onClick={() => navigate('/projects')} 
                  style={styles.actionBtnSecondary}
                >
                  📂 View Workspace Projects
                </button>
                <button 
                  onClick={() => navigate('/my-activity')} 
                  style={styles.actionBtnOutline}
                >
                  📋 My Activity Logs
                </button>
              </div>
            </div>
          </div>

          {/* ROW 3: RECENT ACTIVITY (FULL WIDTH) */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📋 My Recent Activity</h3>
            {myActivities.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24, margin: 0, fontSize: '0.85rem' }}>
                No recent personal activity logged yet.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0 0' }}>
                {myActivities.map((a, i) => (
                  <li key={a.id || i} style={{
                    padding: '10px 0',
                    borderBottom: i === myActivities.length - 1 ? 'none' : '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                  }}>
                    <span style={{ color: '#0f172a', fontWeight: 500 }}>• {a.action}</span>
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
    color: '#22c55e',
    fontSize: '0.8rem',
    fontWeight: 600,
    textDecoration: 'none',
  },
  actionBtnPrimary: {
    padding: '10px 16px',
    background: '#22c55e',
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