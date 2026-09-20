import React from 'react';
import { useApp } from '../context/AppContext';
import NotificationBell from './NotificationBell';

export const PageHeader = ({
  title,
  subtitle,
  color = '#0f172a',
  onRefresh,
  loading = false,
  showBell = true,
  children
}) => {
  const { toggleMobileMenu } = useApp() || {};

  return (
    <header className="page-header" style={styles.header}>
      <div className="header-left" style={styles.headerLeft}>
        <button
          className="header-hamburger-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          type="button"
        >
          ☰
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="header-title" style={{ ...styles.title, color }}>{title}</h1>
          {subtitle && <p className="header-subtitle" style={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className="header-actions" style={styles.rightActions}>
        {children}

        {onRefresh && (
          <button
            className="header-refresh-btn"
            onClick={onRefresh}
            disabled={loading}
            style={{
              ...styles.refreshBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#f1f5f9';
            }}
          >
            <span className="refresh-icon">{loading ? '⏳' : '🔄'}</span>
            <span className="refresh-text">{loading ? ' Refreshing...' : ' Refresh'}</span>
          </button>
        )}

        {showBell && <NotificationBell />}
      </div>
    </header>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 90,
    background: '#ffffff',
    padding: '20px 32px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    gap: 16,
    flexWrap: 'wrap',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  refreshBtn: {
    padding: '9px 16px',
    background: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s ease',
  },
};

export default PageHeader;
