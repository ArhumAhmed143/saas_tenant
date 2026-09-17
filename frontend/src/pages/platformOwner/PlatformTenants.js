import { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import api from '../../api';

export default function PlatformTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');

  const fetchTenants = () => {
    setLoading(true);
    api.get('/api/platform/tenants')
      .then(res => setTenants(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Filtered tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        t.name?.toLowerCase().includes(searchLower) ||
        t.slug?.toLowerCase().includes(searchLower) ||
        t.industry?.toLowerCase().includes(searchLower) ||
        t.country?.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && t.is_active !== false) ||
        (statusFilter === 'Inactive' && t.is_active === false);

      const matchesPlan =
        planFilter === 'All' ||
        (t.plan || 'Free') === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [tenants, searchQuery, statusFilter, planFilter]);

  // KPI Calculations
  const totalCount = tenants.length;
  const activeCount = tenants.filter(t => t.is_active !== false).length;
  const inactiveCount = tenants.filter(t => t.is_active === false).length;
  const enterpriseCount = tenants.filter(t => t.plan === 'Enterprise').length;

  // Delete Tenant
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
      const res = await api.delete(`/api/platform/tenants/${id}`);
      alert(`✅ ${res.data.message}`);
      fetchTenants();
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || 'Failed to delete'}`);
    } finally {
      setDeleting(null);
    }
  };

  // View Tenant Details Modal
  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/api/platform/tenants/${id}`);
      setSelectedTenant(res.data);
      setShowModal(true);
    } catch (error) {
      alert('Failed to load company details');
    }
  };

  // Update Tenant
  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/platform/tenants/${selectedTenant.id}`, selectedTenant);
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
    <div style={styles.appContainer}>
      <Sidebar />

      <div style={styles.mainWrapper}>
        <PageHeader
          title="🏢 All Companies"
          subtitle={`Manage all registered tenants on the platform (${totalCount} total companies)`}
          color="#dc2626"
          onRefresh={fetchTenants}
          loading={loading}
        />

        <div style={styles.contentContainer}>
          {/* STATS CARDS */}
          <div style={styles.statsGrid}>
            <StatsCard icon="🏢" value={totalCount} label="Total Companies" color="#4f46e5" />
            <StatsCard icon="✅" value={activeCount} label="Active Companies" color="#22c55e" />
            <StatsCard icon="⏸️" value={inactiveCount} label="Inactive Companies" color="#f59e0b" />
            <StatsCard icon="👑" value={enterpriseCount} label="Enterprise Tier" color="#7c3aed" />
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div style={styles.filterCard}>
            <div style={{ flex: '2', minWidth: 260 }}>
              <input
                type="text"
                placeholder="🔍 Search by company name, slug, industry, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={{ flex: '1', minWidth: 150 }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>

            <div style={{ flex: '1', minWidth: 150 }}>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Plans</option>
                <option value="Free">Free</option>
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* COMPANY CARDS GRID */}
          {loading ? (
            <div style={styles.emptyCard}>
              <p style={{ color: '#94a3b8', margin: 0 }}>⏳ Loading companies...</p>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏢</div>
              <p style={{ color: '#0f172a', fontWeight: 600, margin: '0 0 4px 0' }}>No companies found</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Try adjusting your search query or filter options.
              </p>
            </div>
          ) : (
            <div style={styles.cardsGrid}>
              {filteredTenants.map(t => (
                <div key={t.id} style={styles.companyCard}>
                  {/* CARD HEADER */}
                  <div style={styles.companyCardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={styles.companyLogoBox}>🏢</div>
                      <div>
                        <h3 style={styles.companyName}>{t.name}</h3>
                        <span style={styles.companySlug}>slug: {t.slug}</span>
                      </div>
                    </div>
                    <span style={{
                      background: t.is_active !== false ? '#dcfce7' : '#fee2e8',
                      color: t.is_active !== false ? '#16a34a' : '#dc2626',
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}>
                      {t.is_active !== false ? '● Active' : '○ Inactive'}
                    </span>
                  </div>

                  {/* CARD DETAILS */}
                  <div style={styles.companyCardBody}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Plan Tier</span>
                      <span style={{
                        background: getPlanColor(t.plan),
                        color: 'white',
                        padding: '2px 10px',
                        borderRadius: 12,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}>
                        {t.plan || 'Free'}
                      </span>
                    </div>

                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Industry</span>
                      <span style={styles.detailValue}>{t.industry || 'General'}</span>
                    </div>

                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Country</span>
                      <span style={styles.detailValue}>{t.country || 'N/A'}</span>
                    </div>

                    {t.created_at && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Registered</span>
                        <span style={styles.detailValue}>
                          {new Date(t.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CARD ACTIONS */}
                  <div style={styles.companyCardFooter}>
                    <button
                      onClick={() => handleViewDetails(t.id)}
                      style={styles.viewBtn}
                    >
                      👁️ View / Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTenant(t.id, t.name)}
                      disabled={deleting === t.id}
                      style={{
                        ...styles.deleteBtn,
                        opacity: deleting === t.id ? 0.6 : 1,
                        cursor: deleting === t.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {deleting === t.id ? '⏳' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EDIT/VIEW COMPANY MODAL */}
          {showModal && selectedTenant && (
            <div
              style={styles.modalOverlay}
              onClick={() => setShowModal(false)}
            >
              <div
                style={styles.modalCard}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.modalHeader}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem' }}>🏢 Company Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}
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
                        onChange={(e) => setSelectedTenant({ ...selectedTenant, name: e.target.value })}
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Industry</label>
                      <input
                        value={selectedTenant.industry || ''}
                        onChange={(e) => setSelectedTenant({ ...selectedTenant, industry: e.target.value })}
                        placeholder="e.g., Technology, Healthcare"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Website</label>
                      <input
                        value={selectedTenant.website || ''}
                        onChange={(e) => setSelectedTenant({ ...selectedTenant, website: e.target.value })}
                        placeholder="https://example.com"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input
                        value={selectedTenant.phone || ''}
                        onChange={(e) => setSelectedTenant({ ...selectedTenant, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>City</label>
                      <input
                        value={selectedTenant.city || ''}
                        onChange={(e) => setSelectedTenant({ ...selectedTenant, city: e.target.value })}
                        placeholder="e.g., Karachi"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Country</label>
                      <input
                        value={selectedTenant.country || ''}
                        onChange={(e) => setSelectedTenant({ ...selectedTenant, country: e.target.value })}
                        placeholder="e.g., Pakistan"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Subscription Plan</label>
                      <select
                        value={selectedTenant.plan || 'Free'}
                        onChange={(e) => setSelectedTenant({ ...selectedTenant, plan: e.target.value })}
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
                        onChange={(e) => setSelectedTenant({ ...selectedTenant, is_active: e.target.value === 'active' })}
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
                      onChange={(e) => setSelectedTenant({ ...selectedTenant, address: e.target.value })}
                      placeholder="Full address"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Description</label>
                    <textarea
                      value={selectedTenant.description || ''}
                      onChange={(e) => setSelectedTenant({ ...selectedTenant, description: e.target.value })}
                      placeholder="Company description"
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '10px 20px',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
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
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#475569',
  marginBottom: 4,
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  fontSize: '0.88rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  mainWrapper: {
    marginLeft: 240,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  contentContainer: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  filterCard: {
    background: '#ffffff',
    padding: '16px 20px',
    borderRadius: 14,
    border: '1px solid #e2e8f0',
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  filterSelect: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    background: '#ffffff',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  emptyCard: {
    background: '#ffffff',
    padding: 40,
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
  },
  companyCard: {
    background: '#ffffff',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  companyCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #f1f5f9',
  },
  companyLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    flexShrink: 0,
  },
  companyName: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  companySlug: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    display: 'block',
  },
  companyCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.84rem',
  },
  detailLabel: {
    color: '#64748b',
  },
  detailValue: {
    fontWeight: 600,
    color: '#0f172a',
  },
  companyCardFooter: {
    display: 'flex',
    gap: 8,
    paddingTop: 12,
    borderTop: '1px solid #f1f5f9',
  },
  viewBtn: {
    flex: 1,
    padding: '8px 12px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '8px 12px',
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: 8,
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalCard: {
    background: 'white',
    padding: 32,
    borderRadius: 16,
    maxWidth: 640,
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
};