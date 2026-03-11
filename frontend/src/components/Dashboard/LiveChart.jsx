// LiveChart - real-time line chart for sensor data using Recharts
import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const PARAMS = [
  { key: 'temperature', label: 'Temp (°C)', color: '#06b6d4' },
  { key: 'vibration', label: 'Vibration', color: '#8b5cf6' },
  { key: 'voltage', label: 'Voltage (V)', color: '#f59e0b' },
  { key: 'current', label: 'Current (A)', color: '#3b82f6' },
  { key: 'waterFlow', label: 'Flow (L/m)', color: '#10b981' }
];

const LiveChart = ({ data = [] }) => {
  const [activeParams, setActiveParams] = useState(['temperature', 'vibration']);

  // Format timestamps for X-axis display
  const chartData = data.slice(-30).map(d => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }));

  const toggleParam = (key) => {
    setActiveParams(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value?.toFixed(2)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Parameter toggle buttons */}
      <div style={styles.toggleRow}>
        {PARAMS.map(p => (
          <button
            key={p.key}
            onClick={() => toggleParam(p.key)}
            style={{
              ...styles.toggleBtn,
              background: activeParams.includes(p.key) ? `${p.color}20` : 'transparent',
              border: `1px solid ${activeParams.includes(p.key) ? p.color : 'var(--border-color)'}`,
              color: activeParams.includes(p.key) ? p.color : 'var(--text-muted)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block', marginRight: '0.25rem' }} />
            {p.label}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          ⏳ Collecting sensor data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            {PARAMS.filter(p => activeParams.includes(p.key)).map(p => (
              <Line
                key={p.key}
                type="monotone"
                dataKey={p.key}
                name={p.label}
                stroke={p.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const styles = {
  toggleRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  toggleBtn: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    fontWeight: 500
  }
};

export default LiveChart;
