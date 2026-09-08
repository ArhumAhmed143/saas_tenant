import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';

export default function TaskDetail() {
  const { id } = useParams();
  const { tasks, subtasks, comments, users, addComment, updateTaskStatus } = useApp();
  const [newComment, setNewComment] = useState('');

  const task = tasks.find(t => t.id === parseInt(id));
  const taskSubtasks = subtasks.filter(s => s.taskId === parseInt(id));
  const taskComments = comments.filter(c => c.taskId === parseInt(id));

  if (!task) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
          <h2>Task not found</h2>
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
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        <Link to="/tasks" style={{ color: 'var(--primary)', textDecoration: 'none' }}>← Back to Tasks</Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginTop: 16 }}>
          <div>
            <h2>✅ {task.title}</h2>
            <p style={{ color: 'var(--gray-500)' }}>Priority: <strong>{task.priority}</strong> | Estimate: {task.estimatedHours}h</p>
          </div>
          <select 
            value={task.status} 
            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--gray-200)' }}
          >
            <option>To-Do</option>
            <option>In-Progress</option>
            <option>Done</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 24 }}>
          <div>
            <h4>📌 Subtasks</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {taskSubtasks.map(s => (
                <li key={s.id} style={{ padding: 8, borderBottom: '1px solid var(--gray-200)' }}>
                  {s.isCompleted ? '✅' : '⏳'} {s.title}
                </li>
              ))}
            </ul>

            <h4 style={{ marginTop: 24 }}>💬 Comments</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {taskComments.map(c => (
                <li key={c.id} style={{ padding: 8, borderBottom: '1px solid var(--gray-200)' }}>
                  <strong>{getUserName(c.userId)}</strong>: {c.content}
                  <small style={{ color: 'var(--gray-500)', marginLeft: 8 }}>{c.createdAt}</small>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder="Add a comment..."
                style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--gray-200)' }}
              />
              <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Post</button>
            </form>
          </div>

          <div className="card">
            <h4>Assignee</h4>
            <p>{getUserName(task.assigneeId)}</p>
          </div>
        </div>
      </main>
    </div>
  );
}