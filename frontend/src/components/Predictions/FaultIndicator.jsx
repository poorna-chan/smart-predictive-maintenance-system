// FaultIndicator - shows individual fault type with severity level
import React from 'react';

const FAULT_ICONS = {
  'Motor Overheating': '🔥',
  'Bearing Failure': '⚙️',
  'Bearing Wear': '⚙️',
  'Dry Run': '💧',
  'Low Flow / Dry Run Risk': '💧',
  'Voltage Fluctuation': '⚡',
  'Voltage Instability': '⚡',
  'Current Overload': '🔌',
  'High Current Draw': '🔌',
  'High Temperature': '🌡️',
  'Vibration Anomaly': '📳',
  'None': '✅'
};

const SEVERITY_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
  high: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
  medium: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
  low: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
  none: { bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.2)', text: '#10b981' }
};

const FaultIndicator = ({ fault, severity, showDescription = true }) => {
  const icon = FAULT_ICONS[fault] || '⚠️';
  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.none;

  const descriptions = {
    'Motor Overheating': 'Motor temperature exceeds safe operating limits. Check cooling fins and ventilation.',
    'Bearing Failure': 'Abnormal vibration patterns indicate potential bearing damage.',
    'Bearing Wear': 'Elevated vibration suggests bearing wear. Lubricate or replace bearings.',
    'Dry Run': 'Pump running without water. Immediate shutdown required to prevent damage.',
    'Low Flow / Dry Run Risk': 'Water flow is critically low. Check water source and intake.',
    'Voltage Fluctuation': 'Severe voltage instability detected. Check power supply.',
    'Voltage Instability': 'Voltage outside optimal range. Verify electrical connections.',
    'Current Overload': 'Motor drawing excessive current. Check for mechanical obstruction.',
    'High Current Draw': 'Elevated current draw may indicate motor wear.',
    'None': 'No faults detected. Pump operating normally.'
  };

  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '10px',
      padding: '0.875rem',
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-start'
    }}>
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 700, color: colors.text, fontSize: '0.9rem' }}>{fault}</span>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '0.1rem 0.4rem',
            borderRadius: '4px',
            background: colors.border,
            color: colors.text,
            textTransform: 'uppercase'
          }}>
            {severity}
          </span>
        </div>
        {showDescription && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {descriptions[fault] || 'Anomaly detected in pump operation.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default FaultIndicator;
