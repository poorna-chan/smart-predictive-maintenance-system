// AlertHistory - historical alerts view with date range filtering
import React, { useState } from 'react';
import api from '../../services/api';

const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (severity) params.severity = severity;
      const res = await api.get('/alerts', { params });
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>📅 Alert History</h2>

      <div style={styles.filterRow}>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.input} />
        <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>to</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.input} />
        <select value={severity} onChange={e => setSeverity(e.target.value)} style={styles.input}>
          <option value="">All Severities</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <button onClick={fetchHistory} style={styles.searchBtn}>🔍 Search</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Loading...</p>
      ) : (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{alerts.length} result(s)</p>
          {alerts.map(a => (
            <div key={a.id} style={{ ...styles.row, borderLeft: `3px solid ${a.severity === 'critical' ? '#ef4444' : '#f59e0b'}` }}>
              <span style={{ color: a.severity === 'critical' ? '#ef4444' : '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>{a.severity?.toUpperCase()}</span>
              <span style={{ fontSize: '0.875rem', flex: 1 }}>{a.message}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  filterRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
  input: { maxWidth: '180px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem' },
  searchBtn: { padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 },
  row: { display: 'flex', gap: '1rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', background: 'var(--bg-primary)', borderRadius: '0 8px 8px 0', alignItems: 'flex-start', flexWrap: 'wrap' }
};

export default AlertHistory;
