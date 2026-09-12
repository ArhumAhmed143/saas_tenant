import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';
import { Link } from 'react-router-dom';

export default function Tasks() {
  const { tasks, updateTaskStatus } = useApp();

  const columns = ['To-Do', 'In-Progress', 'Done'];

  const columnColors = {
    'To-Do': '#94a3b8',
    'In-Progress': '#f59e0b',
    'Done': '#22c55e',
  };

  const priorityColors = {
    'High': '#ef4444',
    'Medium': '#f59e0b',
    'Low': '#22c55e',
  };

  // Helper: Get assignee name (mock)
  const getAssignee = (id) => {
    const users = {
      2: 'Ali Hassan',
      3: 'Sara Khan',
    };
    return users[id] || 'Unassigned';
  };

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main className="main-content" style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>✅ Task Board</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Drag and drop tasks across statuses</p>
          </div>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{tasks.length} total tasks</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {columns.map((status) => {
            const columnTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} style={{
                background: 'white',
                padding: 16,
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                minHeight: 300,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                    <span style={{ color: columnColors[status] }}>●</span> {status}
                  </h3>
                  <span style={{ background: '#e2e8f0', padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', color: '#64748b' }}>
                    {columnTasks.length}
                  </span>
                </div>

                {columnTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: 30, fontSize: '0.85rem', border: '2px dashed #e2e8f0', borderRadius: 8 }}>
                    ✨ Empty
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {columnTasks.map(t => (
                      <div key={t.id} style={{
                        background: '#f8fafc',
                        padding: '14px 16px',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        {/* TITLE - SIRF YAHI CLICKABLE HAI */}
                        <Link to={`/tasks/${t.id}`} style={{ 
                          textDecoration: 'none', 
                          color: '#0f172a', 
                          fontWeight: 600, 
                          fontSize: '0.95rem',
                          display: 'block',
                          marginBottom: 6,
                        }}>
                          {t.title}
                        </Link>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ 
                              background: priorityColors[t.priority] || '#94a3b8', 
                              color: 'white', 
                              padding: '2px 10px', 
                              borderRadius: 12, 
                              fontSize: '0.6rem',
                              fontWeight: 600,
                            }}>
                              {t.priority}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              👤 {getAssignee(t.assigneeId)}
                            </span>
                          </div>
                          
                          {/* DROPDOWN - AB ERROR NAHI AAYEGI */}
                          <select 
                            value={t.status} 
                            onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              padding: '4px 8px', 
                              borderRadius: 6, 
                              border: '1px solid #e2e8f0', 
                              fontSize: '0.7rem',
                              background: 'white',
                              cursor: 'pointer',
                            }}
                          >
                            {columns.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 6 }}>
                          ⏱️ {t.estimatedHours}h estimated
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}