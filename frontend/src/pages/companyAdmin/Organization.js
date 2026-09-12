import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';

export default function Organization() {
  const { departments, teams, users, addDepartment, deleteDepartment, addTeam, deleteTeam } = useApp();

  const [newDept, setNewDept] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [loading, setLoading] = useState(false);

  // ========== ADD DEPARTMENT (REAL API) ==========
  const handleAddDept = async () => {
    if (!newDept.trim()) {
      alert('Please enter department name');
      return;
    }
    setLoading(true);
    try {
      await addDepartment(newDept.trim());
      setNewDept('');
      alert('✅ Department added successfully!');
    } catch (error) {
      alert('❌ Failed to add department');
    } finally {
      setLoading(false);
    }
  };

  // ========== ADD TEAM (REAL API) ==========
  const handleAddTeam = async () => {
    if (!newTeam.trim()) {
      alert('Please enter team name');
      return;
    }
    setLoading(true);
    try {
      await addTeam(newTeam.trim(), null);
      setNewTeam('');
      alert('✅ Team added successfully!');
    } catch (error) {
      alert('❌ Failed to add team');
    } finally {
      setLoading(false);
    }
  };

  // ========== DELETE DEPARTMENT ==========
  const handleDeleteDept = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"?`)) return;
    try {
      await deleteDepartment(id);
      alert('✅ Department deleted!');
    } catch (error) {
      alert('❌ Failed to delete department');
    }
  };

  // ========== DELETE TEAM ==========
  const handleDeleteTeam = async (id, name) => {
    if (!window.confirm(`Delete team "${name}"?`)) return;
    try {
      await deleteTeam(id);
      alert('✅ Team deleted!');
    } catch (error) {
      alert('❌ Failed to delete team');
    }
  };

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main className="main-content" style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>👥 Company Structure</h2>
        <p style={{ color: '#64748b', marginBottom: 32 }}>Manage your departments, teams, and members</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          
          {/* ===== DEPARTMENTS CARD ===== */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '1.5rem' }}>🏢</span>
              <h4 style={{ margin: 0, color: '#0f172a' }}>Departments</h4>
              <span style={{ marginLeft: 'auto', background: '#e2e8f0', padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', color: '#64748b' }}>
                {departments.length}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input 
                value={newDept} 
                onChange={(e) => setNewDept(e.target.value)} 
                placeholder="New dept name..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}
                disabled={loading}
              />
              <button 
                onClick={handleAddDept}
                disabled={loading}
                style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? '...' : '+ Add'}
              </button>
            </div>

            {departments.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 16 }}>No departments</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {departments.map((d) => (
                  <li key={d.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', color: '#0f172a', display: 'flex', justifyContent: 'space-between' }}>
                    <span>▸ {d.name}</span>
                    <button 
                      onClick={() => handleDeleteDept(d.id, d.name)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ===== TEAMS CARD ===== */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '1.5rem' }}>👥</span>
              <h4 style={{ margin: 0, color: '#0f172a' }}>Teams</h4>
              <span style={{ marginLeft: 'auto', background: '#e2e8f0', padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', color: '#64748b' }}>
                {teams.length}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input 
                value={newTeam} 
                onChange={(e) => setNewTeam(e.target.value)} 
                placeholder="New team name..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}
                disabled={loading}
              />
              <button 
                onClick={handleAddTeam}
                disabled={loading}
                style={{ padding: '8px 16px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? '...' : '+ Add'}
              </button>
            </div>

            {teams.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 16 }}>No teams</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {teams.map((t) => (
                  <li key={t.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', color: '#0f172a', display: 'flex', justifyContent: 'space-between' }}>
                    <span>▸ {t.name}</span>
                    <button 
                      onClick={() => handleDeleteTeam(t.id, t.name)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ===== MEMBERS CARD ===== */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '1.5rem' }}>👤</span>
              <h4 style={{ margin: 0, color: '#0f172a' }}>Members</h4>
              <span style={{ marginLeft: 'auto', background: '#e2e8f0', padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', color: '#64748b' }}>
                {users.length}
              </span>
            </div>

            {users.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 16 }}>No members</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.map((u) => (
                  <li key={u.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#0f172a' }}>{u.name}</span>
                    <span style={{ background: u.role === 'Admin' ? '#4f46e5' : u.role === 'Manager' ? '#0ea5e9' : '#94a3b8', color: 'white', padding: '2px 12px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600 }}>
                      {u.role}
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