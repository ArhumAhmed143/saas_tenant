import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';

export default function TaskDetail() {
  const { id } = useParams();
  const { tasks, subtasks, comments, users, addComment, updateTaskStatus } = useApp();
  const [newComment, setNewComment] = useState('');

  // ✅ SAFE: Handle undefined arrays
  const safeTasks = tasks || [];
  const safeSubtasks = subtasks || [];
  const safeComments = comments || [];
  const safeUsers = users || [];

  const task = safeTasks.find(t => t.id === parseInt(id));
  const taskSubtasks = safeSubtasks.filter(s => s.taskId === parseInt(id));
  const taskComments = safeComments.filter(c => c.taskId === parseInt(id));

  if (!task) {
    return (
      <div className="app-layout" style={{ display: 'flex' }}>
        <Sidebar />
        <main className="main-content" style={{ marginLeft: 240, padding: 32, width: '100%' }}>
          <h2>Task not found</h2>
          <Link to="/tasks" style={{ color: '#4f46e5' }}>← Back to Tasks</Link>
        </main>
      </div>
    );
  }

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(parseInt(id), newComment);
    setNewComment('');
  };

  const getUserName = (userId) => {
    const user = safeUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main className="main-content" style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        <Link to="/tasks" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>← Back to Tasks</Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginTop: 16, marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#0f172a' }}>✅ {task.title}</h2>
            <p style={{ color: '#64748b', marginTop: 4 }}>
              Priority: <strong>{task.priority}</strong> | Estimate: {task.estimatedHours || 0}h
            </p>
          </div>
          <select 
            value={task.status} 
            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontWeight: 600 }}
          >
            <option>To-Do</option>
            <option>In-Progress</option>
            <option>Done</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            {/* Subtasks */}
            <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <h4 style={{ marginBottom: 16, color: '#0f172a' }}>📌 Subtasks ({taskSubtasks.length})</h4>
              {taskSubtasks.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: 16, fontSize: '0.9rem' }}>
                  No subtasks yet
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {taskSubtasks.map(s => (
                    <li key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      {s.isCompleted ? '✅' : '⏳'} {s.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Comments */}
            <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <h4 style={{ marginBottom: 16, color: '#0f172a' }}>💬 Comments ({taskComments.length})</h4>
              {taskComments.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: 16, fontSize: '0.9rem' }}>
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {taskComments.map(c => (
                    <li key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <strong style={{ color: '#4f46e5' }}>{getUserName(c.userId)}</strong>
                      <span style={{ marginLeft: 8, color: '#0f172a' }}>{c.content}</span>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder="Add a comment..."
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                />
                <button type="submit" style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                  Post
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Info */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', height: 'fit-content' }}>
            <h4 style={{ marginBottom: 16, color: '#0f172a' }}>👤 Assignee</h4>
            <p style={{ color: '#0f172a', fontWeight: 500 }}>{getUserName(task.assigneeId)}</p>

            <h4 style={{ marginTop: 24, marginBottom: 16, color: '#0f172a' }}>📊 Status</h4>
            <span style={{
              background: task.status === 'Done' ? '#22c55e' : task.status === 'In-Progress' ? '#f59e0b' : '#94a3b8',
              color: 'white', padding: '4px 14px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600,
            }}>
              {task.status}
            </span>

            <h4 style={{ marginTop: 24, marginBottom: 16, color: '#0f172a' }}>⚡ Priority</h4>
            <span style={{
              background: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#22c55e',
              color: 'white', padding: '4px 14px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600,
            }}>
              {task.priority}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}