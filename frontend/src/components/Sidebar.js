import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const { currentUser, logout, currentTenant } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = currentUser?.role;

  const getLinksByRole = () => {
    if (role === 'PlatformOwner') {
      return [
        { to: '/dashboard', icon: '👑', label: 'Platform Overview' },
        { to: '/platform/tenants', icon: '🏢', label: 'All Companies' },
        { to: '/platform/users', icon: '👥', label: 'All Users' },
        { to: '/platform/analytics', icon: '📈', label: 'Platform Growth' },
        { to: '/platform/activity', icon: '📋', label: 'Platform Activity' },
      ];
    }

    if (role === 'Admin') {
      return [
        { to: '/dashboard', icon: '🏢', label: 'Dashboard' },
        { to: '/my-tasks', icon: '👤', label: 'My Tasks' },
        { to: '/projects', icon: '📂', label: 'Projects' },
        { to: '/tasks', icon: '✅', label: 'Tasks' },
        { to: '/sprints', icon: '🏃', label: 'Sprints' },
        { to: '/team-analytics', icon: '📊', label: 'Team Analytics' },
        { to: '/organization', icon: '👥', label: 'Organization' },
        { to: '/activity', icon: '📋', label: 'Activity' },
        { to: '/settings', icon: '⚙️', label: 'Settings' },
      ];
    }

    if (role === 'Manager') {
      return [
        { to: '/dashboard', icon: '👨‍💼', label: 'Dashboard' },
        { to: '/my-tasks', icon: '👤', label: 'My Tasks' },
        { to: '/projects', icon: '📂', label: 'Projects' },
        { to: '/tasks', icon: '✅', label: 'Tasks' },
        { to: '/sprints', icon: '🏃', label: 'Sprints' },
        { to: '/team-analytics', icon: '📊', label: 'Team Analytics' },
        { to: '/activity', icon: '📋', label: 'Activity' },
      ];
    }

   // Employee (default)
// Employee (default) — Individual level only
return [
  { to: '/dashboard', icon: '👤', label: 'Dashboard' },
  { to: '/my-tasks', icon: '👤', label: 'My Tasks' },
  { to: '/projects', icon: '📂', label: 'Projects' },
  { to: '/my-activity', icon: '📋', label: 'My Activity' },
];
  };

  const links = getLinksByRole();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>🚀 SaaS</div>

      {role !== 'PlatformOwner' && currentTenant && (
        <div style={styles.tenantBox}>
          <label style={styles.tenantLabel}>🏢 Workspace</label>
          <div style={styles.tenantName}>{currentTenant.name}</div>
        </div>
      )}

      <nav style={styles.nav}>
        {links.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to} 
            style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.active : {}) })}
          >
            {link.icon} {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.userBox}>
        <div style={styles.avatar}>{currentUser?.name?.charAt(0)}</div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{currentUser?.name}</div>
          <div style={styles.userRole}>{currentUser?.role}</div>
        </div>
       <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
  🚪 Logout
</button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: 240,
    height: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    padding: '20px 16px 16px 16px',
    borderRight: '1px solid #1e293b',
    zIndex: 100,
  },
  logo: { 
    fontSize: '1.4rem', 
    fontWeight: 700, 
    color: '#818cf8',
    letterSpacing: '-0.5px',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #1e293b',
  },
  tenantBox: {
    marginBottom: 16,
    padding: '8px 12px',
    background: '#1e293b',
    borderRadius: 8,
    border: '1px solid #334155',
  },
  tenantLabel: {
    display: 'block',
    fontSize: '0.6rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 4,
  },
  tenantName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'white',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nav: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 2,
    marginBottom: 12,
  },
  link: {
    padding: '8px 12px',
    borderRadius: 6,
    textDecoration: 'none',
    color: '#94a3b8',
    fontSize: '0.9rem',
    transition: 'all 0.15s',
  },
  active: { 
    background: '#1e293b', 
    color: 'white' 
  },
  userBox: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTop: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '0.8rem',
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { 
    fontSize: '0.8rem', 
    fontWeight: 500, 
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis' 
  },
  userRole: { fontSize: '0.65rem', color: '#64748b' },
logoutBtn: {
  background: '#dc2626',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: 6,
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'background 0.2s',
}
};