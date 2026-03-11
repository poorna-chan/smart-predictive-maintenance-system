// LoadingSpinner - animated loading indicator
import React from 'react';

const LoadingSpinner = ({ size = 40, message = 'Loading...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem' }}>
    <div style={{
      width: size,
      height: size,
      border: `3px solid var(--border-color)`,
      borderTop: `3px solid var(--accent-teal)`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    {message && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{message}</p>}
  </div>
);

export default LoadingSpinner;
