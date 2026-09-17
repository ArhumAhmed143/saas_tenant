import React from 'react';

export const StatsCard = ({
  icon,
  value,
  label,
  color,
  highlight = false,
  onClick,
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: highlight ? '#fef2f2' : '#ffffff',
        padding: '20px 24px',
        borderRadius: 14,
        border: highlight ? '2px solid #ef4444' : '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: hovered ? '0 6px 18px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: highlight
            ? 'rgba(239, 68, 68, 0.15)'
            : color
            ? `${color}15`
            : '#f1f5f9',
          color: highlight ? '#dc2626' : color || '#4f46e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: highlight ? '#dc2626' : color || '#0f172a',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: '0.84rem',
            color: highlight ? '#b91c1c' : '#64748b',
            fontWeight: 500,
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
