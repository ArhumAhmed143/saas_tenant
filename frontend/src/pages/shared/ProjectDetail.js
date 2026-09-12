import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects, epics = [], tasks = [] } = useApp(); // ✅ Default empty arrays
  
  const project = projects.find(p => p.id === parseInt(id));
  
  // ✅ Safe filter - agar epics undefined hai toh empty array return karega
  const projectEpics = (epics || []).filter(e => e.projectId === parseInt(id));
  
  // ✅ Safe filter - agar tasks undefined hai toh empty array return karega
  const projectTasks = (tasks || []).filter(t => {
    if (!t.epicId) return false;
    return epics?.some(e => e.projectId === parseInt(id)) || false;
  });

  if (!project) {
    return (
      <div className="app-layout" style={{ display: 'flex' }}>
        <Sidebar />
        <main className="main-content">
          <h2>Project not found</h2>
          <Link to="/projects">← Back to Projects</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Link to="/projects" style={{ color: 'var(--primary)', textDecoration: 'none' }}>← Back to Projects</Link>
            <h2 style={{ marginTop: 8 }}>📂 {project.name}</h2>
            <p style={{ color: 'var(--gray-500)' }}>{project.description || 'No description'}</p>
          </div>
          <span style={{ 
            background: project.status === 'Active' ? '#22c55e' : project.status === 'Completed' ? '#4f46e5' : '#f59e0b', 
            color: 'white', 
            padding: '4px 16px', 
            borderRadius: 20 
          }}>
            {project.status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          <div className="card">
            <h4>📋 Epics ({projectEpics.length})</h4>
            {projectEpics.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No epics for this project</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {projectEpics.map(epic => (
                  <li key={epic.id} style={{ padding: 8, borderBottom: '1px solid var(--gray-200)' }}>
                    <strong>{epic.name}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{epic.description || 'No description'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <h4>✅ Tasks ({projectTasks.length})</h4>
            {projectTasks.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No tasks for this project</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {projectTasks.slice(0, 5).map(task => (
                  <li key={task.id} style={{ padding: 8, borderBottom: '1px solid var(--gray-200)' }}>
                    {task.title}
                    <span style={{ 
                      marginLeft: 8, 
                      fontSize: '0.75rem', 
                      background: task.status === 'Done' ? '#22c55e' : task.status === 'In-Progress' ? '#f59e0b' : '#94a3b8',
                      color: 'white',
                      padding: '2px 8px', 
                      borderRadius: 12 
                    }}>
                      {task.status || 'To-Do'}
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