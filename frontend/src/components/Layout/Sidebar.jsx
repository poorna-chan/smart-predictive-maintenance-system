// Sidebar - navigation sidebar with links to all sections
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/pumps', icon: '⚙️', label: 'Pump Control' },
  { path: '/predictions', icon: '🤖', label: 'Predictions' },
  { path: '/alerts', icon: '🔔', label: 'Alerts' },
  { path: '/history', icon: '📈', label: 'Data History' }
];

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  return (
    <aside style={{
      ...styles.sidebar,
      width: isOpen ? 'var(--sidebar-width)' : '0',
      overflow: 'hidden',
      transition: 'width 0.3s ease'
    }}>
      <div style={styles.inner}>
        <div style={styles.sectionLabel}>MONITORING</div>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
              {isActive && <div style={styles.activeIndicator} />}
            </Link>
          );
        })}

        <div style={{ ...styles.sectionLabel, marginTop: '1.5rem' }}>SYSTEM</div>
        <Link to="/profile" style={styles.navItem}>
          <span style={styles.navIcon}>👤</span>
          <span style={styles.navLabel}>Profile</span>
        </Link>

        {/* System status indicator */}
        <div style={styles.statusBox}>
          <div style={styles.statusDot} />
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Online</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Simulator Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    height: 'calc(100vh - var(--navbar-height))',
    position: 'fixed',
    top: 'var(--navbar-height)',
    left: 0,
    zIndex: 90,
    overflowY: 'auto'
  },
  inner: {
    padding: '1rem 0',
    width: 'var(--sidebar-width)'
  },
  sectionLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    padding: '0 1.25rem 0.5rem'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.7rem 1.25rem',
    textDecoration: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    fontWeight: 500,
    borderRadius: '0 8px 8px 0',
    marginRight: '0.75rem',
    transition: 'all 0.2s',
    position: 'relative',
    cursor: 'pointer'
  },
  navItemActive: {
    color: 'var(--accent-teal)',
    background: 'rgba(6, 182, 212, 0.1)',
    fontWeight: 600
  },
  navIcon: { fontSize: '1rem', width: '20px', textAlign: 'center' },
  navLabel: { flex: 1 },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: '3px',
    background: 'var(--accent-teal)',
    borderRadius: '0 2px 2px 0'
  },
  statusBox: {
    margin: '1.5rem 1rem 0',
    padding: '0.75rem',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 6px rgba(16,185,129,0.6)',
    animation: 'pulse 2s infinite'
  }
};

export default Sidebar;
