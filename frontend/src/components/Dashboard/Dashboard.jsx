// Main Dashboard page - shows overview of all pumps with real-time sensor data
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import socket, { connectSocket } from '../../services/socket';
import PumpStatusCard from './PumpStatusCard';
import SensorGauges from './SensorGauges';
import LiveChart from './LiveChart';
import LoadingSpinner from '../Common/LoadingSpinner';

const Dashboard = () => {
  const [pumps, setPumps] = useState([]);
  const [selectedPump, setSelectedPump] = useState(null);
  const [latestDataMap, setLatestDataMap] = useState({});
  const [chartHistory, setChartHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, running: 0, warnings: 0, critical: 0 });

  // Fetch all pumps on mount
  useEffect(() => {
    const fetchPumps = async () => {
      try {
        const res = await api.get('/pumps');
        setPumps(res.data);
        if (res.data.length > 0) setSelectedPump(res.data[0]);
        // Calculate stats
        setStats({
          total: res.data.length,
          running: res.data.filter(p => p.isRunning).length,
          warnings: res.data.filter(p => p.status === 'warning').length,
          critical: res.data.filter(p => p.status === 'critical').length
        });
      } catch (err) {
        console.error('Fetch pumps error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPumps();
  }, []);

  // Fetch latest data for all pumps
  useEffect(() => {
    const fetchAllLatest = async () => {
      const map = {};
      for (const pump of pumps) {
        try {
          const res = await api.get(`/sensors/data/${pump.id}/latest`);
          map[pump.id] = res.data;
        } catch (e) { /* no data yet */ }
      }
      setLatestDataMap(map);
    };
    if (pumps.length > 0) fetchAllLatest();
  }, [pumps]);

  // Fetch chart history for selected pump
  useEffect(() => {
    if (!selectedPump) return;
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/sensors/data/${selectedPump.id}`, { params: { limit: 50 } });
        setChartHistory(res.data.reverse());
      } catch (e) {}
    };
    fetchHistory();
  }, [selectedPump]);

  // Subscribe to real-time updates via Socket.IO
  useEffect(() => {
    connectSocket();

    socket.on('sensor_data', (data) => {
      // Update the latest data map
      setLatestDataMap(prev => ({ ...prev, [data.pumpId]: data }));

      // Update chart history if this is the selected pump
      if (selectedPump && data.pumpId === selectedPump.id) {
        setChartHistory(prev => [...prev.slice(-99), data]);
      }

      // Update pump status in the pumps list
      setPumps(prev => prev.map(p =>
        p.id === data.pumpId ? { ...p, status: data.pumpStatus || p.status } : p
      ));
    });

    return () => socket.off('sensor_data');
  }, [selectedPump]);

  if (loading) return <LoadingSpinner message="Loading pumps..." />;

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>📊 Dashboard</h1>
          <p style={styles.pageSubtitle}>Real-time monitoring for all registered pumps</p>
        </div>
        <div style={styles.lastUpdate}>
          🟢 Live • Updated just now
        </div>
      </div>

      {/* Summary Stats */}
      <div style={styles.statsRow}>
        <StatCard icon="⚙️" label="Total Pumps" value={stats.total} color="#3b82f6" />
        <StatCard icon="▶️" label="Running" value={stats.running} color="#10b981" />
        <StatCard icon="⚠️" label="Warnings" value={stats.warnings} color="#f59e0b" />
        <StatCard icon="🚨" label="Critical" value={stats.critical} color="#ef4444" />
      </div>

      {/* Pump Overview Cards */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Pump Overview</h2>
      </div>

      {pumps.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No pumps registered yet.</p>
          <a href="/pumps" style={{ color: 'var(--accent-teal)', marginTop: '0.5rem', display: 'block' }}>
            + Add your first pump
          </a>
        </div>
      ) : (
        <div style={styles.pumpGrid}>
          {pumps.map(pump => (
            <div key={pump.id} onClick={() => setSelectedPump(pump)} style={{ cursor: 'pointer' }}>
              <PumpStatusCard pump={pump} latestData={latestDataMap[pump.id]} />
            </div>
          ))}
        </div>
      )}

      {/* Detailed View for Selected Pump */}
      {selectedPump && (
        <div style={styles.detailSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              🔍 Detailed View: {selectedPump.name}
            </h2>
            {pumps.length > 1 && (
              <div style={styles.pumpSelector}>
                {pumps.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPump(p)}
                    style={{
                      ...styles.selectorBtn,
                      background: selectedPump.id === p.id ? 'var(--accent-teal)' : 'var(--bg-primary)',
                      color: selectedPump.id === p.id ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${selectedPump.id === p.id ? 'var(--accent-teal)' : 'var(--border-color)'}`
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={styles.detailGrid}>
            {/* Sensor Gauges */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⚡ Live Sensor Readings</h3>
              <SensorGauges data={latestDataMap[selectedPump.id]} />
            </div>

            {/* Live Chart */}
            <div style={{ ...styles.card, gridColumn: 'span 2' }}>
              <h3 style={styles.cardTitle}>📈 Live Data Chart</h3>
              <LiveChart data={chartHistory} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: `0 4px 15px ${color}20`
  }}>
    <div style={{ fontSize: '2rem' }}>{icon}</div>
    <div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

const styles = {
  page: { padding: '1.5rem' },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  pageTitle: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' },
  pageSubtitle: { fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' },
  lastUpdate: {
    fontSize: '0.8rem',
    color: '#10b981',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)',
    padding: '0.375rem 0.75rem',
    borderRadius: '20px'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' },
  pumpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    marginBottom: '2rem'
  },
  detailSection: { marginTop: '1rem' },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '1.5rem'
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem'
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '1rem'
  },
  pumpSelector: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  selectorBtn: {
    padding: '0.375rem 0.875rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s'
  }
};

export default Dashboard;
