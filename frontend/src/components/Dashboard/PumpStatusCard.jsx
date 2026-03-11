// PumpStatusCard - shows pump overview with status and key metrics
import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../Common/StatusBadge';

const PumpStatusCard = ({ pump, latestData }) => {
  const statusGlow = {
    normal: 'rgba(16, 185, 129, 0.2)',
    warning: 'rgba(245, 158, 11, 0.2)',
    critical: 'rgba(239, 68, 68, 0.2)'
  };

  return (
    <div style={{
      ...styles.card,
      boxShadow: `0 4px 20px ${statusGlow[pump.status] || 'rgba(0,0,0,0.2)'}`
    }}>
      {/* Card Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.pumpName}>{pump.name}</h3>
          <p style={styles.location}>📍 {pump.location}</p>
        </div>
        <StatusBadge status={pump.status} size="md" />
      </div>

      {/* Running status */}
      <div style={styles.runningStatus}>
        <div style={{
          ...styles.runDot,
          background: pump.isRunning ? '#10b981' : '#64748b',
          boxShadow: pump.isRunning ? '0 0 8px rgba(16,185,129,0.6)' : 'none'
        }} />
        <span style={{ fontSize: '0.8rem', color: pump.isRunning ? '#10b981' : 'var(--text-muted)' }}>
          {pump.isRunning ? 'Running' : 'Stopped'}
        </span>
      </div>

      {/* Sensor Data Grid */}
      {latestData ? (
        <div style={styles.metricsGrid}>
          <MetricItem icon="🌡️" label="Temp" value={`${latestData.temperature?.toFixed(1)}°C`} alert={latestData.temperature > 80} />
          <MetricItem icon="📳" label="Vibration" value={`${latestData.vibration?.toFixed(1)} mm/s`} alert={latestData.vibration > 4.5} />
          <MetricItem icon="⚡" label="Voltage" value={`${latestData.voltage?.toFixed(0)}V`} alert={latestData.voltage < 200 || latestData.voltage > 250} />
          <MetricItem icon="🔌" label="Current" value={`${latestData.current?.toFixed(1)}A`} alert={latestData.current > 15} />
          <MetricItem icon="💧" label="Flow" value={`${latestData.waterFlow?.toFixed(1)} L/m`} alert={latestData.waterFlow < 5} />
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1rem 0', textAlign: 'center' }}>
          ⏳ Waiting for sensor data...
        </p>
      )}

      {/* Action Links */}
      <div style={styles.actions}>
        <Link to={`/pumps`} style={styles.actionBtn}>⚙️ Control</Link>
        <Link to={`/history?pump=${pump.id}`} style={styles.actionBtn}>📈 History</Link>
        <Link to={`/predictions`} style={styles.actionBtn}>🤖 Predict</Link>
      </div>
    </div>
  );
};

const MetricItem = ({ icon, label, value, alert }) => (
  <div style={{
    ...styles.metric,
    background: alert ? 'rgba(239,68,68,0.08)' : 'var(--bg-primary)',
    border: `1px solid ${alert ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`
  }}>
    <span style={{ fontSize: '1rem' }}>{icon}</span>
    <div>
      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1 }}>{label}</p>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: alert ? '#ef4444' : 'var(--text-primary)' }}>{value}</p>
    </div>
  </div>
);

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '1.25rem',
    transition: 'all 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem'
  },
  pumpName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.2rem'
  },
  location: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  runningStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  },
  runDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  metric: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.5rem',
    borderRadius: '8px'
  },
  actions: {
    display: 'flex',
    gap: '0.5rem'
  },
  actionBtn: {
    flex: 1,
    textAlign: 'center',
    padding: '0.375rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    fontSize: '0.7rem',
    textDecoration: 'none',
    transition: 'all 0.2s'
  }
};

export default PumpStatusCard;
