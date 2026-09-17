import React from 'react';
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
  return (
    <header style={styles.header}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ ...styles.title, color }}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>

      <div style={styles.rightActions}>
        {children}

        {onRefresh && (
          <button
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
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
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
