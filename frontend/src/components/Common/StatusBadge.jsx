// StatusBadge - displays pump status with appropriate color and icon
import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const configs = {
    normal: { label: 'Normal', color: '#10b981', bg: 'rgba(16,185,129,0.15)', dot: '🟢' },
    warning: { label: 'Warning', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', dot: '🟡' },
    critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', dot: '🔴' }
  };

  const config = configs[status] || configs.normal;
  const fontSize = size === 'sm' ? '0.7rem' : size === 'lg' ? '0.9rem' : '0.75rem';
  const padding = size === 'sm' ? '0.2rem 0.5rem' : '0.25rem 0.625rem';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding,
      borderRadius: '20px',
      fontSize,
      fontWeight: 600,
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.color}40`
    }}>
      <span style={{ fontSize: size === 'sm' ? '0.6rem' : '0.75rem' }}>{config.dot}</span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
