// SensorGauges - displays real-time sensor values as visual gauges
import React from 'react';

const GaugeItem = ({ icon, label, value, unit, min, max, warning, critical, color }) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const isWarning = warning && value >= warning;
  const isCritical = critical && value >= critical;
  const barColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : color || '#10b981';

  return (
    <div style={styles.gauge}>
      <div style={styles.gaugeHeader}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <p style={styles.gaugeLabel}>{label}</p>
          <p style={{ ...styles.gaugeValue, color: barColor }}>
            {value?.toFixed(1)} <span style={styles.unit}>{unit}</span>
          </p>
        </div>
        {(isWarning || isCritical) && (
          <span style={{ fontSize: '1rem', animation: 'pulse 1s infinite' }}>
            {isCritical ? '🔴' : '🟡'}
          </span>
        )}
      </div>
      {/* Progress bar */}
      <div style={styles.barBg}>
        <div style={{
          ...styles.barFill,
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${barColor}80, ${barColor})`
        }} />
      </div>
      <div style={styles.rangeLabels}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

const SensorGauges = ({ data }) => {
  if (!data) {
    return (
      <div style={styles.container}>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
          ⏳ Awaiting sensor data...
        </p>
      </div>
    );
  }

  const gauges = [
    { icon: '🌡️', label: 'Temperature', value: data.temperature, unit: '°C', min: 0, max: 120, warning: 80, critical: 95, color: '#06b6d4' },
    { icon: '📳', label: 'Vibration', value: data.vibration, unit: 'mm/s', min: 0, max: 10, warning: 4.5, critical: 7.0, color: '#8b5cf6' },
    { icon: '⚡', label: 'Voltage', value: data.voltage, unit: 'V', min: 150, max: 280, warning: null, critical: null, color: '#f59e0b' },
    { icon: '🔌', label: 'Current', value: data.current, unit: 'A', min: 0, max: 25, warning: 15, critical: 20, color: '#3b82f6' },
    { icon: '💧', label: 'Water Flow', value: data.waterFlow, unit: 'L/min', min: 0, max: 50, warning: null, critical: null, color: '#10b981' }
  ];

  return (
    <div style={styles.container}>
      {gauges.map(g => (
        <GaugeItem key={g.label} {...g} />
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem'
  },
  gauge: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '0.75rem'
  },
  gaugeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    marginBottom: '0.5rem'
  },
  gaugeLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: 1
  },
  gaugeValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)'
  },
  unit: {
    fontSize: '0.75rem',
    fontWeight: 400,
    color: 'var(--text-muted)'
  },
  barBg: {
    height: '6px',
    background: 'var(--border-color)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.3rem'
  },
  barFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease'
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.65rem',
    color: 'var(--text-muted)'
  }
};

export default SensorGauges;
