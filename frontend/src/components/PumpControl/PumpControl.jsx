// PumpControl - remote ON/OFF control panel for pumps with confirmation dialog
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../Common/StatusBadge';
import LoadingSpinner from '../Common/LoadingSpinner';

const PumpControl = () => {
  const [pumps, setPumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [controlLoading, setControlLoading] = useState({});
  const [newPump, setNewPump] = useState({ name: '', location: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchPumps = async () => {
    try {
      const res = await api.get('/pumps');
      setPumps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPumps(); }, []);

  const handleControl = (pump, command) => {
    setConfirmDialog({ pump, command });
  };

  const confirmControl = async () => {
    const { pump, command } = confirmDialog;
    setConfirmDialog(null);
    setControlLoading(prev => ({ ...prev, [pump.id]: true }));
    try {
      await api.post(`/pumps/${pump.id}/control`, { command });
      setPumps(prev => prev.map(p => p.id === pump.id ? { ...p, isRunning: command === 'on' } : p));
    } catch (err) {
      alert('Control command failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setControlLoading(prev => ({ ...prev, [pump.id]: false }));
    }
  };

  const addPump = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/pumps', newPump);
      setPumps(prev => [...prev, res.data]);
      setNewPump({ name: '', location: '' });
      setShowAddForm(false);
    } catch (err) {
      alert('Failed to add pump: ' + (err.response?.data?.message || err.message));
    }
  };

  const deletePump = async (id) => {
    if (!window.confirm('Delete this pump? This will remove all associated data.')) return;
    try {
      await api.delete(`/pumps/${id}`);
      setPumps(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <LoadingSpinner message="Loading pumps..." />;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚙️ Pump Control</h1>
          <p style={styles.subtitle}>Remote ON/OFF control and pump management</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={styles.addBtn}>
          {showAddForm ? '✕ Cancel' : '+ Add Pump'}
        </button>
      </div>

      {/* Add pump form */}
      {showAddForm && (
        <form onSubmit={addPump} style={styles.addForm}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Register New Pump</h3>
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Pump Name</label>
              <input
                value={newPump.name}
                onChange={e => setNewPump({ ...newPump, name: e.target.value })}
                placeholder="e.g., Main Irrigation Pump"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Location</label>
              <input
                value={newPump.location}
                onChange={e => setNewPump({ ...newPump, location: e.target.value })}
                placeholder="e.g., North Field - Zone A"
                required
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.submitBtn}>✅ Add Pump</button>
          </div>
        </form>
      )}

      {/* Pump control cards */}
      {pumps.length === 0 ? (
        <div style={styles.emptyState}>No pumps registered. Add your first pump above.</div>
      ) : (
        <div style={styles.pumpGrid}>
          {pumps.map(pump => (
            <div key={pump.id} style={styles.pumpCard}>
              {/* Pump header */}
              <div style={styles.pumpHeader}>
                <div>
                  <h3 style={styles.pumpName}>{pump.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {pump.location}</p>
                </div>
                <StatusBadge status={pump.status} />
              </div>

              {/* ON/OFF Toggle */}
              <div style={styles.toggleSection}>
                <div style={styles.toggleLabel}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Power Status</span>
                  <span style={{
                    fontSize: '0.8rem',
                    color: pump.isRunning ? '#10b981' : 'var(--text-muted)',
                    fontWeight: 600
                  }}>
                    {pump.isRunning ? '● RUNNING' : '○ STOPPED'}
                  </span>
                </div>

                {controlLoading[pump.id] ? (
                  <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sending command...</span>
                  </div>
                ) : (
                  <div style={styles.controlBtns}>
                    <button
                      onClick={() => handleControl(pump, 'on')}
                      disabled={pump.isRunning}
                      style={{
                        ...styles.controlBtn,
                        background: pump.isRunning ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.15)',
                        border: `1px solid ${pump.isRunning ? '#10b981' : 'rgba(16,185,129,0.3)'}`,
                        color: '#10b981',
                        cursor: pump.isRunning ? 'default' : 'pointer'
                      }}
                    >
                      ▶ START
                    </button>
                    <button
                      onClick={() => handleControl(pump, 'off')}
                      disabled={!pump.isRunning}
                      style={{
                        ...styles.controlBtn,
                        background: !pump.isRunning ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${!pump.isRunning ? '#ef4444' : 'rgba(239,68,68,0.2)'}`,
                        color: '#ef4444',
                        cursor: !pump.isRunning ? 'default' : 'pointer'
                      }}
                    >
                      ■ STOP
                    </button>
                  </div>
                )}
              </div>

              {/* Last updated */}
              <p style={styles.lastUpdated}>
                Last updated: {new Date(pump.updatedAt).toLocaleString()}
              </p>

              {/* Delete button */}
              <button
                onClick={() => deletePump(pump.id)}
                style={styles.deleteBtn}
              >
                🗑️ Remove Pump
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Confirm Action</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to turn <strong style={{ color: confirmDialog.command === 'on' ? '#10b981' : '#ef4444' }}>
                {confirmDialog.command.toUpperCase()}
              </strong> the pump &quot;<strong>{confirmDialog.pump.name}</strong>&quot;?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDialog(null)} style={styles.cancelBtn}>Cancel</button>
              <button
                onClick={confirmControl}
                style={{
                  ...styles.confirmBtn,
                  background: confirmDialog.command === 'on' ? '#10b981' : '#ef4444'
                }}
              >
                Confirm {confirmDialog.command.toUpperCase()}
              </button>
            </div>
          </div>
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
  addBtn: { padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 },
  addForm: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  formRow: { display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  formField: { flex: 1, minWidth: '200px' },
  label: { display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.375rem', fontWeight: 500 },
  input: { width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.625rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.875rem' },
  submitBtn: { padding: '0.625rem 1.25rem', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 },
  emptyState: { textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' },
  pumpGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  pumpCard: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' },
  pumpHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' },
  pumpName: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' },
  toggleSection: { marginBottom: '1rem' },
  toggleLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' },
  controlBtns: { display: 'flex', gap: '0.75rem' },
  controlBtn: { flex: 1, padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.2s' },
  lastUpdated: { fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem' },
  deleteBtn: { width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  dialog: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '90%', boxShadow: 'var(--shadow-lg)' },
  cancelBtn: { padding: '0.5rem 1.25rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' },
  confirmBtn: { padding: '0.5rem 1.25rem', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }
};

export default PumpControl;
