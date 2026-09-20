import React, { useId } from 'react';

export const Logo = ({ size = 32, style = {}, className = '' }) => {
  const rawId = useId();
  const gradientId = `logo-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    >
      <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
      <path
        d="M10 16L16 10L22 16L16 22L10 16Z"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3" fill="white" />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;
