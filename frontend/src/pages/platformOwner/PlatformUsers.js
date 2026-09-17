import { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import api from '../../api';

export default function PlatformUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Accordion open state for company groups
  const [openGroups, setOpenGroups] = useState({});

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/platform/users')
        .then(res => setAllUsers(res.data))
        .catch(err => console.error('Users:', err)),
      api.get('/api/platform/tenants')
        .then(res => setTenants(res.data))
        .catch(err => console.error('Tenants:', err)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Initialize all groups open by default once loaded
  useEffect(() => {
    if (tenants.length > 0) {
      const initial = { 'platform': true };
      tenants.forEach(t => { initial[t.id] = true; });
      setOpenGroups(initial);
    }
  }, [tenants]);

  const toggleGroup = (groupId) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const getRoleColor = (role) => {
    if (role === 'PlatformOwner') return '#dc2626';
    if (role === 'Admin') return '#4f46e5';
    if (role === 'Manager') return '#0ea5e9';
    return '#64748b';
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const searchLower = searchQuery.toLowerCase();
      const userTenant = tenants.find(t => t.id === u.tenant_id);
      const companyName = userTenant ? userTenant.name.toLowerCase() : 'platform (no company)';
      const matchesSearch = 
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        companyName.includes(searchLower);

      const matchesRole = roleFilter === 'All' || u.role === roleFilter;

      const matchesCompany = companyFilter === 'All' || 
        (companyFilter === 'Platform' ? !u.tenant_id : String(u.tenant_id) === String(companyFilter));

      const userActive = u.is_active !== false;
      const matchesStatus = statusFilter === 'All' ||
        (statusFilter === 'Active' && userActive) ||
        (statusFilter === 'Inactive' && !userActive);

      return matchesSearch && matchesRole && matchesCompany && matchesStatus;
    });
  }, [allUsers, tenants, searchQuery, roleFilter, companyFilter, statusFilter]);

  // Role Statistics
  const totalCount = allUsers.length;
  const adminCount = allUsers.filter(u => u.role === 'Admin').length;
  const managerCount = allUsers.filter(u => u.role === 'Manager').length;
  const employeeCount = allUsers.filter(u => u.role === 'Employee').length;

  // Group Users by Tenant
  const groupedUsers = useMemo(() => {
    const groups = {};
    
    // Group per tenant
    tenants.forEach(t => {
      groups[t.id] = {
        tenant: t,
        users: filteredUsers.filter(u => u.tenant_id === t.id)
      };
    });

    // Group for Platform (no tenant)
    const platformUsers = filteredUsers.filter(u => !u.tenant_id);
    if (platformUsers.length > 0 || companyFilter === 'Platform') {
      groups['platform'] = {
        tenant: { id: 'platform', name: '🌍 Platform Admins (No Company)', slug: 'platform' },
        users: platformUsers
      };
    }

    return groups;
  }, [tenants, filteredUsers, companyFilter]);

  return (
    <div style={styles.appContainer}>
      <Sidebar />

      <div style={styles.mainWrapper}>
        <PageHeader
          title="👥 All Platform Users"
          subtitle={`Manage user accounts across ${tenants.length} registered companies (${totalCount} total users)`}
          color="#dc2626"
          onRefresh={fetchData}
          loading={loading}
        />

        <div style={styles.contentContainer}>
          {/* STATS CARDS GRID */}
          <div style={styles.statsGrid}>
            <StatsCard icon="👥" value={totalCount} label="Total Users" color="#4f46e5" />
            <StatsCard icon="🏢" value={adminCount} label="Company Admins" color="#4f46e5" />
            <StatsCard icon="👨‍💼" value={managerCount} label="Team Managers" color="#0ea5e9" />
            <StatsCard icon="👤" value={employeeCount} label="Employees" color="#64748b" />
          </div>

          {/* SEARCH BAR & FILTERS BAR */}
          <div style={styles.filterCard}>
            <div style={{ flex: '2', minWidth: 240 }}>
              <input
                type="text"
                placeholder="🔍 Search by user name, email address, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={{ flex: '1', minWidth: 140 }}>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
                <option value="PlatformOwner">PlatformOwner</option>
              </select>
            </div>

            <div style={{ flex: '1.2', minWidth: 160 }}>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Companies</option>
                <option value="Platform">Platform Admins</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1', minWidth: 130 }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* COMPANY-WISE ACCORDION GROUPED LIST */}
          {loading ? (
            <div style={styles.card}>
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40, margin: 0 }}>Loading users...</p>
            </div>
          ) : Object.keys(groupedUsers).length === 0 ? (
            <div style={styles.card}>
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40, margin: 0 }}>No users match the selected filters.</p>
            </div>
          ) : (
            Object.keys(groupedUsers).map(groupId => {
              const group = groupedUsers[groupId];
              if (!group || (group.users.length === 0 && searchQuery)) return null;

              const isExpanded = openGroups[groupId] !== false;

              return (
                <div key={groupId} style={styles.accordionCard}>
                  {/* ACCORDION HEADER */}
                  <div
                    onClick={() => toggleGroup(groupId)}
                    style={styles.accordionHeader}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {groupId === 'platform' ? '👑' : '🏢'}
                      </span>
                      <div>
                        <span style={styles.accordionTitle}>
                          {group.tenant.name}
                        </span>
                        <span style={styles.userCountBadge}>
                          {group.users.length} user{group.users.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.1rem', color: '#64748b' }}>
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>

                  {/* ACCORDION CONTENT (TABLE) */}
                  {isExpanded && (
                    <div style={{ overflowX: 'auto' }}>
                      {group.users.length === 0 ? (
                        <p style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                          No users found in this company matching the filters.
                        </p>
                      ) : (
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Name</th>
                              <th style={styles.th}>Email Address</th>
                              <th style={styles.th}>Role</th>
                              <th style={styles.th}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.users.map(u => (
                              <tr key={u.id} style={styles.tr}>
                                <td style={styles.td}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: '50%',
                                      background: getRoleColor(u.role),
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 700,
                                      fontSize: '0.8rem',
                                    }}>
                                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                                  </div>
                                </td>
                                <td style={{ ...styles.td, color: '#64748b' }}>{u.email}</td>
                                <td style={styles.td}>
                                  <span style={{
                                    background: getRoleColor(u.role),
                                    color: 'white',
                                    padding: '3px 12px',
                                    borderRadius: 12,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                  }}>
                                    {u.role}
                                  </span>
                                </td>
                                <td style={styles.td}>
                                  <span style={{
                                    background: u.is_active !== false ? '#dcfce7' : '#fee2e8',
                                    color: u.is_active !== false ? '#16a34a' : '#dc2626',
                                    padding: '3px 10px',
                                    borderRadius: 10,
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                  }}>
                                    {u.is_active !== false ? '● Active' : '○ Inactive'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

        </div>
      </div>
    </div>
  );
}

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
    gap: '20px',
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
  card: {
    background: '#ffffff',
    padding: 24,
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  accordionCard: {
    background: '#ffffff',
    borderRadius: 14,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  accordionHeader: {
    padding: '16px 24px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  accordionTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a',
    marginRight: 12,
  },
  userCountBadge: {
    background: '#e0e7ff',
    color: '#4338ca',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    borderBottom: '2px solid #e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: '#ffffff',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 24px',
    fontSize: '0.88rem',
    verticalAlign: 'middle',
  },
};