import { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import axios from 'axios';

export default function PlatformUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get('http://localhost:5000/api/platform/users', { headers })
        .then(res => setAllUsers(res.data))
        .catch(err => console.error('Users:', err)),
      axios.get('http://localhost:5000/api/platform/tenants', { headers })
        .then(res => setTenants(res.data))
        .catch(err => console.error('Tenants:', err)),
    ]).finally(() => setLoading(false));
  }, []);

  const getRoleColor = (role) => {
    if (role === 'PlatformOwner') return '#dc2626';
    if (role === 'Admin') return '#4f46e5';
    if (role === 'Manager') return '#0ea5e9';
    return '#94a3b8';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          👥 All Users
        </h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>
          All users across all companies ({allUsers.length} total)
        </p>

        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>Loading...</p>
          ) : allUsers.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>No users found</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>Name</th>
                  <th style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>Email</th>
                  <th style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>Role</th>
                  <th style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>Company</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => {
                  const userTenant = tenants.find(t => t.id === u.tenant_id);
                  const tenantDisplay = u.tenant_id 
                    ? (userTenant ? `🏢 ${userTenant.name}` : `#${u.tenant_id}`) 
                    : '🌍 Platform (No Company)';
                  
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: '14px 12px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{
                          background: getRoleColor(u.role),
                          color: 'white',
                          padding: '3px 12px',
                          borderRadius: 12,
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}>{u.role}</span>
                      </td>
                      <td style={{ 
                        padding: '14px 12px', 
                        color: u.tenant_id ? '#64748b' : '#dc2626', 
                        fontSize: '0.85rem', 
                        fontWeight: u.tenant_id ? 400 : 600 
                      }}>
                        {tenantDisplay}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}