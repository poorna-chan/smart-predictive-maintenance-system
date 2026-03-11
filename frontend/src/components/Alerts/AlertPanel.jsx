// AlertPanel - shows active alerts with severity indicators and acknowledgment
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import socket, { connectSocket } from '../../services/socket';

const AlertPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.severity = filter;
      const res = await api.get('/alerts', { params });
      setAlerts(res.data);
    } catch (err) {
      console.error('Fetch alerts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  // Subscribe to real-time alerts
  useEffect(() => {
    connectSocket();
    socket.on('new_alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });
    return () => socket.off('new_alert');
  }, []);

  const acknowledgeAlert = async (id) => {
    try {
      await api.put(`/alerts/${id}/acknowledge`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isAcknowledged: true } : a));
    } catch (err) {
      console.error('Acknowledge error:', err);
    }
  };

  const unackCount = alerts.filter(a => !a.isAcknowledged).length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🔔 Alert Center</h1>
          <p style={styles.subtitle}>Monitor and manage system alerts</p>
        </div>
        {unackCount > 0 && (
          <div style={styles.unackBadge}>{unackCount} unacknowledged</div>
        )}
      </div>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {['all', 'critical', 'warning'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              background: filter === f ? getFilterColor(f) + '20' : 'transparent',
              border: `1px solid ${filter === f ? getFilterColor(f) : 'var(--border-color)'}`,
              color: filter === f ? getFilterColor(f) : 'var(--text-secondary)'
            }}
          >
            {f === 'all' ? '📋 All' : f === 'critical' ? '🔴 Critical' : '🟡 Warning'}
          </button>
        ))}
        <button onClick={fetchAlerts} style={styles.refreshBtn}>🔄 Refresh</button>
      </div>

      {/* Alerts list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '2rem' }}>✅</p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>No alerts found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>All systems operating normally</p>
        </div>
      ) : (
        <div style={styles.alertList}>
          {alerts.map(alert => (
            <div
              key={alert.id}
              style={{
                ...styles.alertCard,
                borderLeft: `4px solid ${alert.severity === 'critical' ? '#ef4444' : '#f59e0b'}`,
                opacity: alert.isAcknowledged ? 0.6 : 1
              }}
            >
              <div style={styles.alertMain}>
                <div style={styles.alertTop}>
                  <span style={{
                    ...styles.severityTag,
                    background: alert.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    color: alert.severity === 'critical' ? '#ef4444' : '#f59e0b'
                  }}>
                    {alert.severity === 'critical' ? '🔴' : '🟡'} {alert.severity?.toUpperCase()}
                  </span>
                  <span style={styles.alertType}>{alert.type?.toUpperCase()}</span>
                  {alert.pump && (
                    <span style={styles.pumpTag}>📍 {alert.pump.name}</span>
                  )}
                  <span style={styles.alertTime}>
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={styles.alertMessage}>{alert.message}</p>
              </div>

              <div style={styles.alertActions}>
                {alert.isAcknowledged ? (
                  <span style={styles.ackBadge}>✅ Acknowledged</span>
                ) : (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    style={styles.ackBtn}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getFilterColor = (f) => f === 'critical' ? '#ef4444' : f === 'warning' ? '#f59e0b' : '#06b6d4';

const styles = {
  page: { padding: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' },
  unackBadge: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444',
    padding: '0.375rem 0.875rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  filterRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterBtn: { padding: '0.375rem 1rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' },
  refreshBtn: {
    padding: '0.375rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    marginLeft: 'auto'
  },
  emptyState: { textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' },
  alertList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  alertCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '0 10px 10px 0',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    transition: 'all 0.2s'
  },
  alertMain: { flex: 1 },
  alertTop: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' },
  severityTag: { padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 },
  alertType: { fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '0.15rem 0.4rem', borderRadius: '4px' },
  pumpTag: { fontSize: '0.75rem', color: 'var(--accent-teal)' },
  alertTime: { fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' },
  alertMessage: { fontSize: '0.875rem', color: 'var(--text-secondary)' },
  alertActions: {},
  ackBadge: { fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' },
  ackBtn: {
    padding: '0.375rem 0.875rem',
    background: 'rgba(6,182,212,0.1)',
    border: '1px solid var(--accent-teal)',
    borderRadius: '6px',
    color: 'var(--accent-teal)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: 500
  }
};

export default AlertPanel;
