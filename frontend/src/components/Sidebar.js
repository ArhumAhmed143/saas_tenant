import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const { currentUser, logout, currentTenant } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const role = currentUser?.role;

  const getSectionsByRole = () => {
    if (role === 'PlatformOwner') {
      return [
        {
          title: 'PLATFORM MANAGEMENT',
          links: [
            { to: '/dashboard', icon: '👑', label: 'Platform Overview' },
            { to: '/platform/tenants', icon: '🏢', label: 'All Companies' },
            { to: '/platform/users', icon: '👥', label: 'All Users' },
            { to: '/platform/analytics', icon: '📈', label: 'Platform Growth' },
            { to: '/platform/activity', icon: '📋', label: 'Platform Activity' },
          ]
        }
      ];
    }

    if (role === 'Admin') {
      return [
        {
          title: 'MAIN',
          links: [
            { to: '/dashboard', icon: '🏢', label: 'Dashboard' },
            { to: '/my-tasks', icon: '👤', label: 'My Tasks' },
            { to: '/projects', icon: '📂', label: 'Projects' },
            { to: '/tasks', icon: '✅', label: 'Tasks' },
            { to: '/sprints', icon: '🏃', label: 'Sprints' },
          ]
        },
        {
          title: 'ADMINISTRATION',
          links: [
            { to: '/team-analytics', icon: '📊', label: 'Team Analytics' },
            { to: '/organization', icon: '👥', label: 'Organization' },
            { to: '/activity', icon: '📋', label: 'Activity' },
            { to: '/settings', icon: '⚙️', label: 'Settings' },
          ]
        }
      ];
    }

    if (role === 'Manager') {
      return [
        {
          title: 'MAIN',
          links: [
            { to: '/dashboard', icon: '👨‍💼', label: 'Dashboard' },
            { to: '/my-tasks', icon: '👤', label: 'My Tasks' },
            { to: '/projects', icon: '📂', label: 'Projects' },
            { to: '/tasks', icon: '✅', label: 'Tasks' },
            { to: '/sprints', icon: '🏃', label: 'Sprints' },
          ]
        },
        {
          title: 'INSIGHTS',
          links: [
            { to: '/team-analytics', icon: '📊', label: 'Team Analytics' },
            { to: '/activity', icon: '📋', label: 'Activity' },
          ]
        }
      ];
    }

    // Employee
    return [
      {
        title: 'MY WORKSPACE',
        links: [
          { to: '/dashboard', icon: '👤', label: 'Dashboard' },
          { to: '/my-tasks', icon: '👤', label: 'My Tasks' },
          { to: '/projects', icon: '📂', label: 'Projects' },
          { to: '/my-activity', icon: '📋', label: 'My Activity' },
        ]
      }
    ];
  };

  const sections = getSectionsByRole();

  return (
    <>
      {/* Hamburger Toggle Button (Mobile Only) */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay (Mobile Only) */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`sidebar ${isOpen ? 'open' : ''}`}
        style={styles.sidebar}
      >
        {/* LOGO WITH SVG */}
        <div style={styles.logoHeader}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
            <path d="M10 16L16 10L22 16L16 22L10 16Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="16" cy="16" r="3" fill="white"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#4f46e5"/>
                <stop offset="1" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
          </svg>
          <span style={styles.logoText}>SaaS</span>
        </div>

        {/* WORKSPACE BADGE */}
        {role !== 'PlatformOwner' && currentTenant && (
          <div style={styles.tenantBox}>
            <div style={styles.tenantIcon}>🏢</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={styles.tenantLabel}>WORKSPACE</label>
              <div style={styles.tenantName}>{currentTenant.name}</div>
            </div>
          </div>
        )}

        {role === 'PlatformOwner' && (
          <div style={styles.platformBadge}>
            <span style={{ fontSize: '0.9rem' }}>👑</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', letterSpacing: '0.5px' }}>
              PLATFORM ADMIN
            </span>
          </div>
        )}

        {/* NAVIGATION SECTIONS */}
        <nav style={styles.nav}>
          {sections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: 16 }}>
              <div style={styles.sectionHeader}>{section.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {section.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeSidebar}
                    style={({ isActive }) => ({
                      ...styles.link,
                      ...(isActive ? styles.active : {}),
                    })}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* USER PROFILE BOX WITH PROFESSIONAL LOGOUT BUTTON */}
        <div style={styles.userBox}>
          <div style={styles.avatar}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{currentUser?.name || 'User'}</div>
            <div style={styles.userRole}>{currentUser?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#dc2626')}
            title="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
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
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  logoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '1px solid #1e293b',
  },
  logoText: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  tenantBox: {
    marginBottom: 20,
    padding: '10px 12px',
    background: '#1e293b',
    borderRadius: 10,
    border: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  tenantIcon: {
    fontSize: '1.1rem',
  },
  tenantLabel: {
    display: 'block',
    fontSize: '0.6rem',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.6px',
    marginBottom: 2,
  },
  tenantName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'white',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  platformBadge: {
    marginBottom: 20,
    padding: '8px 12px',
    background: 'rgba(220, 38, 38, 0.15)',
    borderRadius: 8,
    border: '1px solid rgba(239, 68, 68, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.8px',
    marginBottom: 8,
    paddingLeft: 8,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    color: '#94a3b8',
    fontSize: '0.88rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  active: {
    background: '#4f46e5',
    color: '#ffffff',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
  },
  userBox: {
    marginTop: 'auto',
    paddingTop: 14,
    borderTop: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: { fontSize: '0.7rem', color: '#94a3b8' },
  logoutBtn: {
    padding: '6px 12px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s ease',
    flexShrink: 0,
  },
};