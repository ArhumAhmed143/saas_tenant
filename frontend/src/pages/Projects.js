import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Link } from 'react-router-dom';

export default function Projects() {
  const { projects, addProject, deleteProject } = useApp();
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addProject({ name, description: '', status: 'Planning', startDate: null, endDate: null });
    setName('');
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    'Active': '#22c55e',
    'Planning': '#f59e0b',
    'Completed': '#4f46e5',
    'On Hold': '#ef4444',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>📂 Projects</h2>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{projects.length} total</span>
        </div>

        {/* Search + Add Form */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="🔍 Search projects..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 200 }}
          />
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, flex: 1 }}>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="New project name"
              style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <button type="submit" style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
              + Add
            </button>
          </form>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div style={{ background: 'white', padding: 40, borderRadius: 16, textAlign: 'center', color: '#94a3b8' }}>
            No projects found. Create one above!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filteredProjects.map(p => (
              <div key={p.id} style={{
                background: 'white',
                padding: 20,
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                  <h4 style={{ color: '#0f172a', marginBottom: 8 }}>{p.name}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 12 }}>
                    {p.description || 'No description'}
                  </p>
                  <span style={{
                    background: statusColors[p.status] || '#94a3b8',
                    color: 'white',
                    padding: '2px 12px',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                  }}>
                    {p.status}
                  </span>
                </Link>
                <button 
                  onClick={() => deleteProject(p.id)} 
                  style={{ 
                    float: 'right', 
                    background: 'none', 
                    border: 'none', 
                    color: '#ef4444', 
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    marginTop: -30,
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}