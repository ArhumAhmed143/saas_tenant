import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import axios from 'axios';

export default function PlatformTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTenants = () => {
    const token = localStorage.getItem('accessToken');
    setLoading(true);
    axios.get('http://localhost:5000/api/platform/tenants', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setTenants(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // 🆕 DELETE TENANT
  const handleDeleteTenant = async (id, name) => {
    const confirmText = prompt(
      `⚠️ WARNING: Delete "${name}"?\n\n` +
      `This will PERMANENTLY delete:\n` +
      `• The company\n` +
      `• All its users\n` +
      `• All projects, tasks, sprints\n\n` +
      `Type the company name to confirm:`
    );

    if (confirmText !== name) {
      alert('❌ Cancelled');
      return;
    }

    setDeleting(id);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.delete(
        `http://localhost:5000/api/platform/tenants/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ ${res.data.message}`);
      fetchTenants();
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || 'Failed to delete'}`);
    } finally {
      setDeleting(null);
    }
  };

  // 🆕 VIEW COMPANY DETAILS
  const handleViewDetails = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(
        `http://localhost:5000/api/platform/tenants/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedTenant(res.data);
      setShowModal(true);
    } catch (error) {
      alert('Failed to load company details');
    }
  };

  // 🆕 UPDATE COMPANY
  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:5000/api/platform/tenants/${selectedTenant.id}`,
        selectedTenant,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Company updated successfully!');
      setShowModal(false);
      fetchTenants();
    } catch (error) {
      alert('❌ Failed to update company');
    }
  };

  const getPlanColor = (plan) => {
    if (plan === 'Enterprise') return '#7c3aed';
    if (plan === 'Pro') return '#0ea5e9';
    if (plan === 'Basic') return '#22c55e';
    return '#94a3b8';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 32, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
              🏢 All Companies
            </h1>
            <p style={{ color: '#64748b' }}>All tenants on the platform ({tenants.length} total)</p>
          </div>
          <button 
            onClick={fetchTenants}
            style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            🔄 Refresh
          </button>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>Loading...</p>
          ) : tenants.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No tenants found</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>ID</th>
                  <th style={{ padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>Company</th>
                  <th style={{ padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>Industry</th>
                  <th style={{ padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>Plan</th>
                  <th style={{ padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>Status</th>
                  <th style={{ padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>Country</th>
                  <th style={{ padding: '10px', fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 10px', color: '#94a3b8' }}>#{t.id}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ fontWeight: 500 }}>🏢 {t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t.slug}</div>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748b', fontSize: '0.9rem' }}>
                      {t.industry || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ 
                        background: getPlanColor(t.plan), 
                        color: 'white', 
                        padding: '3px 12px', 
                        borderRadius: 12, 
                        fontSize: '0.7rem', 
                        fontWeight: 600 
                      }}>
                        {t.plan || 'Free'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        color: t.is_active ? '#22c55e' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        {t.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748b', fontSize: '0.9rem' }}>
                      {t.country || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleViewDetails(t.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#4f46e5',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          marginRight: 6,
                        }}
                      >
                        👁️ View
                      </button>
                      <button 
                        onClick={() => handleDeleteTenant(t.id, t.name)}
                        disabled={deleting === t.id}
                        style={{
                          padding: '6px 12px',
                          background: deleting === t.id ? '#94a3b8' : '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: deleting === t.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {deleting === t.id ? '⏳' : '🗑️'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 🆕 COMPANY DETAILS MODAL */}
        {showModal && selectedTenant && (
          <div 
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.5)', display: 'flex',
              justifyContent: 'center', alignItems: 'center', zIndex: 999,
            }}
            onClick={() => setShowModal(false)}
          >
            <div 
              style={{
                background: 'white', padding: 32, borderRadius: 16,
                maxWidth: 600, width: '90%', maxHeight: '85vh', overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, color: '#0f172a' }}>🏢 Company Details</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateCompany}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Company Name</label>
                    <input 
                      value={selectedTenant.name || ''} 
                      onChange={(e) => setSelectedTenant({...selectedTenant, name: e.target.value})}
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Industry</label>
                    <input 
                      value={selectedTenant.industry || ''} 
                      onChange={(e) => setSelectedTenant({...selectedTenant, industry: e.target.value})}
                      placeholder="e.g., Technology, Healthcare"
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Website</label>
                    <input 
                      value={selectedTenant.website || ''} 
                      onChange={(e) => setSelectedTenant({...selectedTenant, website: e.target.value})}
                      placeholder="https://example.com"
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input 
                      value={selectedTenant.phone || ''} 
                      onChange={(e) => setSelectedTenant({...selectedTenant, phone: e.target.value})}
                      placeholder="+92 300 1234567"
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input 
                      value={selectedTenant.city || ''} 
                      onChange={(e) => setSelectedTenant({...selectedTenant, city: e.target.value})}
                      placeholder="e.g., Karachi"
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <input 
                      value={selectedTenant.country || ''} 
                      onChange={(e) => setSelectedTenant({...selectedTenant, country: e.target.value})}
                      placeholder="e.g., Pakistan"
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Plan</label>
                    <select 
                      value={selectedTenant.plan || 'Free'} 
                      onChange={(e) => setSelectedTenant({...selectedTenant, plan: e.target.value})}
                      style={inputStyle}
                    >
                      <option>Free</option>
                      <option>Basic</option>
                      <option>Pro</option>
                      <option>Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select 
                      value={selectedTenant.is_active ? 'active' : 'inactive'} 
                      onChange={(e) => setSelectedTenant({...selectedTenant, is_active: e.target.value === 'active'})}
                      style={inputStyle}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label style={labelStyle}>Address</label>
                  <input 
                    value={selectedTenant.address || ''} 
                    onChange={(e) => setSelectedTenant({...selectedTenant, address: e.target.value})}
                    placeholder="Full address"
                    style={inputStyle} 
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  <label style={labelStyle}>Description</label>
                  <textarea 
                    value={selectedTenant.description || ''} 
                    onChange={(e) => setSelectedTenant({...selectedTenant, description: e.target.value})}
                    placeholder="Company description"
                    rows={3}
                    style={{...inputStyle, resize: 'vertical'}} 
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button 
                    type="submit"
                    style={{
                      padding: '10px 24px',
                      background: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    💾 Save Changes
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '10px 24px',
                      background: '#e2e8f0',
                      color: '#64748b',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
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

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: '#64748b',
  marginBottom: 4,
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: '0.9rem',
};