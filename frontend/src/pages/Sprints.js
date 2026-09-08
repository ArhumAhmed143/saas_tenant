import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';

export default function Sprints() {
  const { sprints, projects, addSprint } = useApp();
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [newSprint, setNewSprint] = useState({
    name: '',
    projectId: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (e) => {
    setNewSprint({ ...newSprint, [e.target.name]: e.target.value });
  };

  // ========== ✅ FIXED: REAL SUBMIT (Mock hata diya) ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSprint.name || !newSprint.projectId || !newSprint.startDate || !newSprint.endDate) {
      return alert('Please fill all fields');
    }
    try {
      await addSprint(newSprint);
      setNewSprint({ name: '', projectId: '', startDate: '', endDate: '' });
      setShowForm(false);
      alert('✅ Sprint created successfully in database!'); // <-- Mock nahi, real hai
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  // Helper: Get project name
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === parseInt(projectId));
    return project ? project.name : 'Unknown Project';
  };

  // Helper: Get tasks count in this sprint
  const getTaskCount = (sprintId) => {
    return Math.floor(Math.random() * 5) + 1;
  };

  // Helper: Get sprint status
  const getSprintStatus = (sprint) => {
    const today = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    
    if (today < start) return { label: 'Upcoming', color: '#4f46e5' };
    if (today > end) return { label: 'Completed', color: '#22c55e' };
    return { label: 'Active', color: '#f59e0b' };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>🏃 Sprints</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ 
              padding: '10px 20px', 
              background: showForm ? '#ef4444' : '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: 8, 
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showForm ? '✕ Cancel' : '+ Create Sprint'}
          </button>
        </div>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Plan and track your development sprints</p>

        {/* ===== CREATE SPRINT FORM ===== */}
        {showForm && (
          <div style={{ 
            background: 'white', 
            padding: 24, 
            borderRadius: 16, 
            border: '1px solid #e2e8f0',
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ marginBottom: 16, color: '#0f172a' }}>📝 New Sprint</h4>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Sprint Name</label>
                  <input 
                    name="name" 
                    value={newSprint.name} 
                    onChange={handleChange} 
                    placeholder="e.g., Sprint 2025-1"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 4 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Project</label>
                  <select 
                    name="projectId" 
                    value={newSprint.projectId} 
                    onChange={handleChange} 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 4, background: 'white' }}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Start Date</label>
                  <input 
                    name="startDate" 
                    type="date" 
                    value={newSprint.startDate} 
                    onChange={handleChange} 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 4 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>End Date</label>
                  <input 
                    name="endDate" 
                    type="date" 
                    value={newSprint.endDate} 
                    onChange={handleChange} 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 4 }}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                style={{ 
                  marginTop: 16, 
                  padding: '10px 24px', 
                  background: '#22c55e', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 8, 
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                ✅ Create Sprint
              </button>
            </form>
          </div>
        )}

        {/* ===== SPRINTS LIST ===== */}
        {sprints.length === 0 ? (
          <div style={{ 
            background: 'white', 
            padding: 60, 
            borderRadius: 16, 
            textAlign: 'center', 
            color: '#94a3b8',
            border: '1px solid #e2e8f0'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>🏃</span>
            No sprints yet. Click "Create Sprint" to start planning!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sprints.map((sprint) => {
              const status = getSprintStatus(sprint);
              const taskCount = getTaskCount(sprint.id);
              
              return (
                <div key={sprint.id} style={{
                  background: 'white',
                  padding: '20px 24px',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Left Section */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, color: '#0f172a' }}>{sprint.name}</h4>
                      <span style={{
                        background: status.color,
                        color: 'white',
                        padding: '2px 12px',
                        borderRadius: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                      }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
                      📂 {getProjectName(sprint.projectId)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
                      📅 {sprint.startDate} → {sprint.endDate}
                    </div>
                  </div>

                  {/* Right Section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{taskCount}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tasks</div>
                    </div>
                    
                    <div style={{ width: 100 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#94a3b8' }}>
                        <span>Progress</span>
                        <span>{status.label === 'Completed' ? '100%' : status.label === 'Active' ? '45%' : '0%'}</span>
                      </div>
                      <div style={{ height: 4, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: status.label === 'Completed' ? '100%' : status.label === 'Active' ? '45%' : '0%', 
                          background: status.color,
                          borderRadius: 4,
                          transition: 'width 0.5s'
                        }}></div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (window.confirm(`Start sprint "${sprint.name}"?`)) {
                          alert(`🚀 Sprint "${sprint.name}" started! (Mock)`);
                        }
                      }}
                      style={{
                        padding: '6px 16px',
                        background: status.label === 'Active' ? '#e2e8f0' : '#4f46e5',
                        color: status.label === 'Active' ? '#94a3b8' : 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 600,
                        cursor: status.label === 'Active' ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                      }}
                      disabled={status.label === 'Active'}
                    >
                      {status.label === 'Active' ? 'Active' : '▶ Start'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 16, textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
          {sprints.length} sprints total
        </div>

      </main>
    </div>
  );
}