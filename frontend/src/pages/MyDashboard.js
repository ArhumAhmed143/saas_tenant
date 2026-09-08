import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Link } from 'react-router-dom';

export default function MyDashboard() {
  const { currentUser, getTasksByUser, tasks, users, projects, addTask } = useApp();

  // ---------- MODAL STATE ----------
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    projectId: '',
    assigneeId: currentUser?.id || '',
    priority: 'Medium',
    estimatedHours: 0,
    description: ''
  });

  if (!currentUser) return <div>Loading...</div>;

  const myTasks = getTasksByUser(currentUser.id);
  const total = myTasks.length;
  const done = myTasks.filter(t => t.status === 'Done').length;
  const pending = total - done;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  // Overdue Check
  const today = new Date();
  const myOverdueTasks = myTasks.filter(t => {
    if (t.status === 'Done') return false;
    const taskDate = new Date(t.createdAt);
    const diffDays = (today - taskDate) / (1000 * 60 * 60 * 24);
    return diffDays > 1;
  });
  const overdueCount = myOverdueTasks.length;
  const isOverloaded = pending > 4;

  // ---------- HANDLE ADD TASK ----------
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId) {
      alert('Please fill in Title and Project');
      return;
    }
    try {
      await addTask(newTask);
      setShowModal(false);
      setNewTask({ title: '', projectId: '', assigneeId: currentUser.id, priority: 'Medium', estimatedHours: 0, description: '' });
      alert('✅ Task created successfully!');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const statusColors = {
    'To-Do': '#94a3b8',
    'In-Progress': '#f59e0b',
    'Done': '#22c55e',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        
        {/* Header + Create Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>👤 My Tasks</h2>
            <p style={{ color: '#64748b' }}>Here are all the tasks assigned to you.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              padding: '10px 20px', 
              background: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: 8, 
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            ➕ Create Task
          </button>
        </div>

        {/* Alerts */}
        {overdueCount > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
            <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠️ You have {overdueCount} overdue task{overdueCount > 1 ? 's' : ''}!</span>
          </div>
        )}
        {isOverloaded && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
            <span style={{ color: '#d97706', fontWeight: 600 }}>📊 You are overloaded! ({pending} pending tasks)</span>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{total}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Tasks</div>
          </div>
          <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#22c55e' }}>{done}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Completed</div>
          </div>
          <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>{pending}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Pending</div>
          </div>
          <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4f46e5' }}>{progress}%</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Progress</div>
          </div>
          <div style={{ background: overdueCount > 0 ? '#fef2f2' : 'white', padding: 16, borderRadius: 12, border: overdueCount > 0 ? '2px solid #ef4444' : '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: overdueCount > 0 ? '#dc2626' : '#0f172a' }}>{overdueCount}</div>
            <div style={{ color: overdueCount > 0 ? '#dc2626' : '#64748b', fontSize: '0.85rem' }}>Overdue</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#4f46e5', borderRadius: 4 }}></div>
          </div>
        </div>

        {/* Task List */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <h4 style={{ marginBottom: 16, color: '#0f172a' }}>📋 Assigned to me ({total})</h4>
          {myTasks.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>
              No tasks assigned to you yet. Click <strong>"Create Task"</strong> to assign one to yourself!
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {myTasks.map(t => {
                const taskDate = new Date(t.createdAt);
                const diffDays = (today - taskDate) / (1000 * 60 * 60 * 24);
                const isTaskOverdue = t.status !== 'Done' && diffDays > 1;
                return (
                  <li key={t.id} style={{ 
                    padding: '10px 0', 
                    borderBottom: '1px solid #f1f5f9', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: isTaskOverdue ? '#fef2f2' : 'transparent',
                    paddingLeft: isTaskOverdue ? 8 : 0,
                    borderRadius: isTaskOverdue ? 4 : 0,
                  }}>
                    <div>
                      <Link to={`/tasks/${t.id}`} style={{ fontWeight: 500, color: '#0f172a', textDecoration: 'none' }}>{t.title}</Link>
                      <span style={{ marginLeft: 8, background: statusColors[t.status] || '#94a3b8', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: '0.65rem', fontWeight: 600 }}>{t.status}</span>
                      {isTaskOverdue && <span style={{ marginLeft: 8, color: '#dc2626', fontSize: '0.65rem', fontWeight: 600 }}>⚠️ OVERDUE</span>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Priority: {t.priority}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ========== MODAL: CREATE TASK ========== */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }} onClick={() => setShowModal(false)}>
            <div style={{
              background: 'white',
              padding: 32,
              borderRadius: 16,
              maxWidth: 500,
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: 16, color: '#0f172a' }}>📝 Create New Task</h3>
              <form onSubmit={handleAddTask}>
                <div className="input-group">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Project *</label>
                  <select
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Assign To</label>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({...newTask, assigneeId: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Estimated Hours</label>
                  <input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 0})}
                    placeholder="e.g., 4"
                    min="0"
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                    ✅ Create Task
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}