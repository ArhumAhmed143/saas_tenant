import React from 'react';

export const StatsCard = ({
  value,
  label,
  color,
  highlight = false,
  onClick,
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className="stats-card"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: highlight ? '#fef2f2' : '#ffffff',
        padding: '22px 24px',
        borderRadius: 14,
        border: highlight ? '2px solid #ef4444' : '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: hovered ? '0 6px 18px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: '0.82rem',
          color: highlight ? '#b91c1c' : '#64748b',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          marginBottom: 8,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '1.85rem',
          fontWeight: 800,
          color: highlight ? '#dc2626' : color || '#0f172a',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
    </div>
  );
};

export default StatsCard;
