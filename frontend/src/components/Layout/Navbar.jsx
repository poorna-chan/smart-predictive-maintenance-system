// Navbar - top navigation bar with user info, notifications, and theme toggle
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import socket, { connectSocket } from '../../services/socket';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [alerts, setAlerts] = useState([]);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  useEffect(() => {
    connectSocket();
    socket.on('new_alert', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 5));
    });
    return () => socket.off('new_alert');
  }, []);

  const unreadCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <nav style={styles.navbar}>
      {/* Left: Menu toggle + Logo */}
      <div style={styles.left}>
        <button onClick={onMenuToggle} style={styles.menuBtn} title="Toggle Sidebar">
          ☰
        </button>
        <Link to="/dashboard" style={styles.brand}>
          <span style={styles.brandIcon}>💧</span>
          <span style={styles.brandText}>PumpMonitor</span>
        </Link>
      </div>

      {/* Right: Notifications + Theme + User */}
      <div style={styles.right}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} style={styles.iconBtn} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Notifications bell */}
        <div style={{ position: 'relative' }}>
          <button
            style={styles.iconBtn}
            onClick={() => setShowAlertDropdown(!showAlertDropdown)}
            title="Alerts"
          >
            🔔
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </button>

          {showAlertDropdown && (
            <div style={styles.alertDropdown}>
              <div style={styles.dropdownHeader}>
                <span>Recent Alerts</span>
                <Link to="/alerts" style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }} onClick={() => setShowAlertDropdown(false)}>
                  View all
                </Link>
              </div>
              {alerts.length === 0 ? (
                <p style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>No new alerts</p>
              ) : (
                alerts.map((alert, i) => (
                  <div key={i} style={{
                    ...styles.alertItem,
                    borderLeft: `3px solid ${alert.severity === 'critical' ? '#ef4444' : '#f59e0b'}`
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: alert.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
                      {alert.severity?.toUpperCase()}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {alert.message?.substring(0, 80)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User info */}
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={styles.userText}>
            <span style={styles.userName}>{user?.name}</span>
            <span style={styles.userRole}>{user?.role}</span>
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout} style={styles.logoutBtn} title="Logout">
          🚪
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    height: 'var(--navbar-height)',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)'
  },
  left: { display: 'flex', alignItems: 'center', gap: '1rem' },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem'
  },
  brand: { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' },
  brandIcon: { fontSize: '1.5rem' },
  brandText: {
    fontSize: '1.1rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  right: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: '0.375rem',
    borderRadius: '8px',
    transition: 'background 0.2s',
    position: 'relative',
    color: 'var(--text-primary)'
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6rem',
    fontWeight: 700
  },
  alertDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: '320px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 200,
    marginTop: '0.5rem',
    overflow: 'hidden'
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-color)',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--text-primary)'
  },
  alertItem: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-color)',
    cursor: 'default'
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.875rem'
  },
  userText: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 },
  userRole: { fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0.375rem',
    borderRadius: '8px',
    color: 'var(--text-secondary)'
  }
};

export default Navbar;
