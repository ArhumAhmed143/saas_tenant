import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { 
    currentUser, getTasksByUser, activities,
    fetchTasks, fetchActivities
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  // ✅ Force fetch with loading state
  const fetchData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchTasks(),
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
  const myActivities = activities.filter(a => a.user_id === currentUser?.id || a.userId === currentUser?.id).slice(0, 5);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <NotificationBell />

      <main style={{ marginLeft: 240, padding: 32, paddingTop: 80, width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#22c55e' }}>
            👤 Employee Dashboard
          </h1>
          <p style={{ color: '#64748b' }}>
            Welcome, <strong style={{ color: '#22c55e' }}>{currentUser?.name}</strong> — Your personal workspace
          </p>
        </div>

        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>📋</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{total}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Total Tasks</div>
          </div>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>✅</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#22c55e' }}>{done}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Completed</div>
          </div>
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🔄</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b' }}>{inProgress}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>In Progress</div>
          </div>
          <div style={{ 
            background: myOverdue.length > 0 ? '#fef2f2' : 'white', 
            padding: '18px 20px', 
            borderRadius: 14, 
            border: myOverdue.length > 0 ? '2px solid #ef4444' : '1px solid #e2e8f0' 
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>⏰</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: myOverdue.length > 0 ? '#dc2626' : '#0f172a' }}>{myOverdue.length}</div>
            <div style={{ color: myOverdue.length > 0 ? '#dc2626' : '#64748b', fontSize: '0.8rem' }}>Overdue</div>
          </div>
        </div>

        {/* ROW 1: My Progress + Priority Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>📈 My Progress</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{done} / {total} tasks done</span>
              <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '1.1rem' }}>{progress}%</span>
            </div>
            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#4f46e5', borderRadius: 5 }}></div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div><span style={{ color: '#22c55e' }}>●</span> Done: <strong>{done}</strong></div>
              <div><span style={{ color: '#f59e0b' }}>●</span> In Progress: <strong>{inProgress}</strong></div>
              <div><span style={{ color: '#94a3b8' }}>●</span> To-Do: <strong>{todo}</strong></div>
            </div>
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>🎯 Pending by Priority</h3>
            {Object.keys(priorityCounts).map(priority => {
              const count = priorityCounts[priority];
              const pendingTotal = priorityCounts.High + priorityCounts.Medium + priorityCounts.Low;
              const percentage = pendingTotal > 0 ? Math.round((count / pendingTotal) * 100) : 0;
              return (
                <div key={priority} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>{priority} Priority</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: priorityColors[priority], borderRadius: 3 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROW 2: My Tasks + Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>📋 My Assigned Tasks ({total})</h3>
              <Link to="/my-tasks" style={{ fontSize: '0.75rem', color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
                View All →
              </Link>
            </div>
            {myTasks.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 30 }}>
                No tasks assigned yet. Wait for your manager to assign you something!
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, maxHeight: 300, overflowY: 'auto' }}>
                {myTasks.slice(0, 6).map(t => {
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
                      <div style={{ flex: 1 }}>
                        <Link to={`/tasks/${t.id}`} style={{ fontWeight: 500, color: '#0f172a', textDecoration: 'none', fontSize: '0.9rem' }}>
                          {t.title}
                        </Link>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                          <span style={{
                            background: priorityColors[t.priority] || '#94a3b8',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: '0.6rem',
                            fontWeight: 600,
                          }}>{t.priority}</span>
                          {isOverdue && <span style={{ color: '#dc2626', fontSize: '0.65rem', fontWeight: 600 }}>⚠️ OVERDUE</span>}
                        </div>
                      </div>
                      <span style={{
                        background: t.status === 'Done' ? '#22c55e' : t.status === 'In-Progress' ? '#f59e0b' : '#94a3b8',
                        color: 'white',
                        padding: '3px 12px',
                        borderRadius: 12,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}>{t.status}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button 
                onClick={() => navigate('/my-tasks')} 
                style={{ padding: '10px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
              >
                👤 My Tasks
              </button>
              <button 
                onClick={() => navigate('/projects')} 
                style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
              >
                📂 View Projects
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
        </div>

        {/* ROW 3: Recent Activity */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>📋 My Recent Activity</h3>
          {myActivities.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20, fontSize: '0.85rem' }}>
              No recent activity yet.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {myActivities.map((a, i) => (
                <li key={a.id || i} style={{
                  padding: '10px 0',
                  borderBottom: i === myActivities.length - 1 ? 'none' : '1px solid #f1f5f9',
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

      </main>
    </div>
  );
}