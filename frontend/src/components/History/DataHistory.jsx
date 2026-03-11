// DataHistory - historical sensor data charts with daily/weekly/monthly views
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const PARAMS = [
  { key: 'temperature', label: 'Temperature (°C)', color: '#06b6d4' },
  { key: 'vibration', label: 'Vibration (mm/s)', color: '#8b5cf6' },
  { key: 'voltage', label: 'Voltage (V)', color: '#f59e0b' },
  { key: 'current', label: 'Current (A)', color: '#3b82f6' },
  { key: 'waterFlow', label: 'Water Flow (L/min)', color: '#10b981' }
];

const DataHistory = () => {
  const [pumps, setPumps] = useState([]);
  const [selectedPumpId, setSelectedPumpId] = useState(null);
  const [data, setData] = useState([]);
  const [view, setView] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeParam, setActiveParam] = useState('temperature');

  useEffect(() => {
    const fetchPumps = async () => {
      const res = await api.get('/pumps');
      setPumps(res.data);
      if (res.data.length > 0) setSelectedPumpId(res.data[0].id);
    };
    fetchPumps();
  }, []);

  const fetchHistory = async () => {
    if (!selectedPumpId) return;
    setLoading(true);
    try {
      const params = { view };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get(`/sensors/data/${selectedPumpId}/history`, { params });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedPumpId, view]);

  // Format data for charts with readable timestamps
  const chartData = data.map(d => ({
    ...d,
    time: new Date(d.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }));

  // Export data as CSV
  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = ['timestamp', 'temperature', 'vibration', 'voltage', 'current', 'waterFlow'];
    const rows = data.map(d => headers.map(h => d[h] || '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pump_${selectedPumpId}_history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📈 Data History</h1>
          <p style={styles.subtitle}>Historical sensor data visualization and analysis</p>
        </div>
        <button onClick={exportCSV} style={styles.exportBtn}>
          📥 Export CSV
        </button>
      </div>

      {/* Pump selector */}
      <div style={styles.controlRow}>
        <div style={styles.selectGroup}>
          <label style={styles.label}>Pump</label>
          <select
            value={selectedPumpId || ''}
            onChange={e => setSelectedPumpId(parseInt(e.target.value))}
            style={styles.select}
          >
            {pumps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={styles.selectGroup}>
          <label style={styles.label}>View</label>
          <select value={view} onChange={e => setView(e.target.value)} style={styles.select}>
            <option value="daily">Daily (Hourly)</option>
            <option value="weekly">Weekly (Daily avg)</option>
            <option value="monthly">Monthly (Weekly avg)</option>
          </select>
        </div>

        <div style={styles.selectGroup}>
          <label style={styles.label}>From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.select} />
        </div>

        <div style={styles.selectGroup}>
          <label style={styles.label}>To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.select} />
        </div>

        <button onClick={fetchHistory} style={styles.searchBtn}>🔍 Load</button>
      </div>

      {/* Parameter selector tabs */}
      <div style={styles.paramTabs}>
        {PARAMS.map(p => (
          <button
            key={p.key}
            onClick={() => setActiveParam(p.key)}
            style={{
              ...styles.paramTab,
              background: activeParam === p.key ? `${p.color}20` : 'transparent',
              border: `1px solid ${activeParam === p.key ? p.color : 'var(--border-color)'}`,
              color: activeParam === p.key ? p.color : 'var(--text-secondary)'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? <LoadingSpinner message="Loading historical data..." /> : (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            {PARAMS.find(p => p.key === activeParam)?.label} — {data.length} readings
          </h3>

          {chartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No data available for the selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PARAMS.find(p => p.key === activeParam)?.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PARAMS.find(p => p.key === activeParam)?.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}
                />
                <Area
                  type="monotone"
                  dataKey={activeParam}
                  stroke={PARAMS.find(p => p.key === activeParam)?.color}
                  fill="url(#colorGrad)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Multi-parameter comparison */}
      {chartData.length > 0 && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>All Parameters Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              {PARAMS.map(p => (
                <Line key={p.key} type="monotone" dataKey={p.key} name={p.label} stroke={p.color} strokeWidth={1.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' },
  exportBtn: { padding: '0.5rem 1.25rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 },
  controlRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' },
  selectGroup: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: { fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 },
  select: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', minWidth: '160px' },
  searchBtn: { padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, alignSelf: 'flex-end' },
  paramTabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  paramTab: { padding: '0.375rem 0.875rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' },
  chartCard: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  chartTitle: { fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }
};

export default DataHistory;
