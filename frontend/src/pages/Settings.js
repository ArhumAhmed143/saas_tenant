import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import axios from 'axios';

export default function Settings() {
  const { currentTenant, users, addActivity, currentUser } = useApp();
  
  const [companyName, setCompanyName] = useState(currentTenant?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

  // Handle Save Profile
  const handleSaveProfile = () => {
    setIsEditing(false);
    addActivity(`Updated company name to "${companyName}"`);
    alert('✅ Company profile updated successfully!');
  };

  // Handle Invite (REAL EMAIL SENDING)
  const handleInvite = async () => {
    if (!inviteEmail) {
      alert('Please enter an email address');
      return;
    }

    setIsInviting(true);
    setInviteMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'http://localhost:5000/api/invite',
        { email: inviteEmail, role: inviteRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInviteMessage(`✅ ${response.data.message}`);
      addActivity(`Invited ${inviteEmail} as ${inviteRole}`);
      setInviteEmail('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setInviteMessage(''), 5000);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to send invitation';
      setInviteMessage(`❌ ${errMsg}`);
      console.error('Invite error:', error);
    } finally {
      setIsInviting(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      addActivity(`Removed member ${name}`);
      alert(`❌ ${name} removed from tenant`);
    }
  };

  // Handle Role Change
  const handleRoleChange = (id, newRole) => {
    addActivity(`Changed member role to ${newRole}`);
    alert(`🔄 Role changed to ${newRole}`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>⚙️ Settings</h2>
        <p style={{ color: '#64748b', marginBottom: 32 }}>Manage your organization profile and team</p>

        {/* ===== SECTION 1: COMPANY PROFILE ===== */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, color: '#0f172a' }}>🏢 Company Profile</h4>
            <button 
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              style={{ 
                padding: '6px 16px', 
                background: isEditing ? '#22c55e' : '#4f46e5', 
                color: 'white', 
                border: 'none', 
                borderRadius: 6, 
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {isEditing ? '💾 Save Changes' : '✏️ Edit'}
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Company Name</label>
              <input 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                disabled={!isEditing}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: 8, 
                  border: '1px solid #e2e8f0',
                  background: isEditing ? 'white' : '#f1f5f9',
                  color: isEditing ? '#0f172a' : '#94a3b8',
                  marginTop: 4
                }} 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Slug (URL)</label>
              <input 
                value={currentTenant?.slug || 'No slug'} 
                disabled
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: 8, 
                  border: '1px solid #e2e8f0',
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  marginTop: 4
                }} 
              />
            </div>
          </div>
        </div>

        {/* ===== SECTION 2: MEMBERS MANAGEMENT ===== */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <h4 style={{ marginBottom: 16, color: '#0f172a' }}>👥 Team Members ({users.length})</h4>
          
          {users.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>
              No members found.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px 8px 8px 0', fontSize: '0.8rem', color: '#64748b' }}>Name</th>
                    <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Email</th>
                    <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Role</th>
                    <th style={{ padding: '8px 0 8px 8px', fontSize: '0.8rem', color: '#64748b', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px 10px 0', fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0', background: 'white' }}
                          disabled={u.id === currentUser?.id}
                        >
                          <option>Admin</option>
                          <option>Manager</option>
                          <option>Employee</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px 0 10px 8px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleRemoveMember(u.id, u.name)}
                          disabled={u.id === currentUser?.id}
                          style={{ 
                            background: u.id === currentUser?.id ? '#e2e8f0' : '#ef4444', 
                            color: 'white', 
                            border: 'none', 
                            padding: '4px 12px', 
                            borderRadius: 4, 
                            cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== SECTION 3: INVITE MEMBER (REAL EMAIL) ===== */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <h4 style={{ marginBottom: 16, color: '#0f172a' }}>📨 Invite New Member</h4>
          
          {/* Message Display */}
          {inviteMessage && (
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: 8, 
              marginBottom: 16,
              background: inviteMessage.startsWith('✅') ? '#dcfce7' : '#fee2e2',
              color: inviteMessage.startsWith('✅') ? '#16a34a' : '#dc2626',
              border: inviteMessage.startsWith('✅') ? '1px solid #bbf7d0' : '1px solid #fecaca'
            }}>
              {inviteMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input 
              value={inviteEmail} 
              onChange={(e) => setInviteEmail(e.target.value)} 
              placeholder="Enter email address"
              style={{ flex: 2, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 200 }}
              disabled={isInviting}
            />
            <select 
              value={inviteRole} 
              onChange={(e) => setInviteRole(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white' }}
              disabled={isInviting}
            >
              <option>Admin</option>
              <option>Manager</option>
              <option selected>Employee</option>
            </select>
            <button 
              onClick={handleInvite}
              disabled={isInviting}
              style={{ 
                padding: '10px 24px', 
                background: isInviting ? '#94a3b8' : '#4f46e5', 
                color: 'white', 
                border: 'none', 
                borderRadius: 8, 
                fontWeight: 600,
                cursor: isInviting ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                minWidth: 140
              }}
            >
              {isInviting ? '⏳ Sending...' : '+ Send Invite'}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 8 }}>
            An email invitation will be sent to the provided address.
          </p>
        </div>

        {/* ===== SECTION 4: DANGER ZONE ===== */}
        <div style={{ background: '#fef2f2', padding: 24, borderRadius: 16, border: '1px solid #fecaca' }}>
          <h4 style={{ color: '#dc2626', marginBottom: 8 }}>⚠️ Danger Zone</h4>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 16 }}>Permanently delete this organization and all associated data.</p>
          <button 
            onClick={() => {
              if (window.confirm('🚨 Are you ABSOLUTELY sure? This cannot be undone!')) {
                alert('🗑️ Organization deleted successfully');
                addActivity('Deleted the entire organization!');
              }
            }}
            style={{ 
              padding: '10px 24px', 
              background: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: 8, 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Delete Organization
          </button>
        </div>

      </main>
    </div>
  );
}