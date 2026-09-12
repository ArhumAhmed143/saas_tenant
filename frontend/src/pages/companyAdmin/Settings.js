import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';

export default function Settings() {
  const { 
    currentTenant, users, addActivity, currentUser,
    updateUserRole, removeUser, updateTenant, sendInvite
  } = useApp();
  
  const [companyName, setCompanyName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Invite State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (currentTenant?.name && currentTenant.name !== 'Loading...') {
      setCompanyName(currentTenant.name);
    }
  }, [currentTenant]);

  const handleSaveProfile = async () => {
    if (!companyName.trim()) return alert('Company name cannot be empty');
    setIsSaving(true);
    try {
      await updateTenant(companyName.trim());
      setIsEditing(false);
      alert('✅ Company profile updated!');
    } catch (error) {
      alert('❌ ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 🆕 SEND INVITE
  const handleInvite = async () => {
    if (!inviteEmail) return alert('Please enter email');
    setIsInviting(true);
    setInviteMessage('');
    setInviteLink('');

    try {
      const result = await sendInvite(inviteEmail, inviteRole);
      setInviteMessage(`✅ ${result.message}`);
      setInviteLink(result.inviteLink);
      setInviteEmail('');
    } catch (error) {
      setInviteMessage(`❌ ${error.message}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (id, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    try {
      await removeUser(id);
      alert(`✅ ${name} removed`);
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      alert(`✅ Role changed to ${newRole}`);
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main className="main-content">
        
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>⚙️ Settings</h2>
        <p style={{ color: '#64748b', marginBottom: 32 }}>Manage your organization profile and team</p>

        {/* Company Profile */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, color: '#0f172a' }}>🏢 Company Profile</h4>
            {isAdmin && (
              <button 
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={isSaving}
                style={{ padding: '6px 16px', background: isSaving ? '#94a3b8' : (isEditing ? '#22c55e' : '#4f46e5'), color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
              >
                {isSaving ? '⏳ Saving...' : (isEditing ? '💾 Save' : '✏️ Edit')}
              </button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Company Name</label>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!isEditing || !isAdmin} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: isEditing ? 'white' : '#f1f5f9', color: isEditing ? '#0f172a' : '#94a3b8', marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Slug</label>
              <input value={currentTenant?.slug || 'loading...'} disabled style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#94a3b8', marginTop: 4 }} />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <h4 style={{ marginBottom: 16, color: '#0f172a' }}>👥 Team Members ({users.length})</h4>
          {users.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No members found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Name</th>
                    <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Email</th>
                    <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b' }}>Role</th>
                    {isAdmin && <th style={{ padding: '8px', fontSize: '0.8rem', color: '#64748b', textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0', background: 'white' }} disabled={u.id === currentUser?.id || !isAdmin}>
                          <option>Admin</option>
                          <option>Manager</option>
                          <option>Employee</option>
                        </select>
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                          <button onClick={() => handleRemoveMember(u.id, u.name)} disabled={u.id === currentUser?.id} style={{ background: u.id === currentUser?.id ? '#e2e8f0' : '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 🆕 INVITE NEW MEMBER */}
        {isAdmin && (
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h4 style={{ marginBottom: 16, color: '#0f172a' }}>📨 Invite New Member</h4>

            {inviteMessage && (
              <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: inviteMessage.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: inviteMessage.startsWith('✅') ? '#16a34a' : '#dc2626', border: inviteMessage.startsWith('✅') ? '1px solid #bbf7d0' : '1px solid #fecaca' }}>
                {inviteMessage}
              </div>
            )}

            {inviteLink && (
              <div style={{ padding: 12, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0369a1', marginBottom: 6 }}>🔗 Invite Link (copy karke bhejo):</div>
                <div style={{ fontSize: '0.75rem', color: '#0c4a6e', wordBreak: 'break-all', background: 'white', padding: 8, borderRadius: 4, border: '1px solid #e0f2fe' }}>
                  {inviteLink}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Enter email address" style={{ flex: 2, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 200 }} disabled={isInviting} />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white' }} disabled={isInviting}>
                <option>Admin</option>
                <option>Manager</option>
                <option>Employee</option>
              </select>
              <button onClick={handleInvite} disabled={isInviting} style={{ padding: '10px 24px', background: isInviting ? '#94a3b8' : '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: isInviting ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', minWidth: 140 }}>
                {isInviting ? '⏳ Sending...' : '+ Send Invite'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 8 }}>
              💡 Invite link terminal mein print hoga. Woh link copy karke user ko bhejo.
            </p>
          </div>
        )}

        {/* Danger Zone */}
        {isAdmin && (
          <div style={{ background: '#fef2f2', padding: 24, borderRadius: 16, border: '1px solid #fecaca' }}>
            <h4 style={{ color: '#dc2626', marginBottom: 8 }}>⚠️ Danger Zone</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 16 }}>Permanently delete this organization and all associated data.</p>
            <button onClick={() => { if (window.confirm('🚨 Are you ABSOLUTELY sure?')) alert('🗑️ Not implemented yet (Demo)'); }} style={{ padding: '10px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
              Delete Organization
            </button>
          </div>
        )}

      </main>
    </div>
  );
}