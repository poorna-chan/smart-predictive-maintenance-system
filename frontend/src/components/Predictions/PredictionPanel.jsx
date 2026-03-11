// PredictionPanel - shows ML-based health predictions with health score gauge
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FaultIndicator from './FaultIndicator';
import LoadingSpinner from '../Common/LoadingSpinner';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

const HealthScoreGauge = ({ score }) => {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#ef4444' : '#dc2626';
  const data = [{ value: score, fill: color }];

  return (
    <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="70%" outerRadius="100%"
          barSize={12}
          data={data}
          startAngle={90} endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: 'var(--border-color)' }}
            dataKey="value"
            cornerRadius={10}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color, lineHeight: 1 }}>{score?.toFixed(0)}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>HEALTH</span>
      </div>
    </div>
  );
};

const PredictionPanel = () => {
  const [pumps, setPumps] = useState([]);
  const [selectedPumpId, setSelectedPumpId] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchPumps = async () => {
      const res = await api.get('/pumps');
      setPumps(res.data);
      if (res.data.length > 0) {
        setSelectedPumpId(res.data[0].id);
      }
    };
    fetchPumps();
  }, []);

  useEffect(() => {
    if (!selectedPumpId) return;
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/predictions/${selectedPumpId}`);
        if (res.data.length > 0) setPrediction(res.data[0]);
        else setPrediction(null);
      } catch (e) {
        setPrediction(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [selectedPumpId]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post(`/predictions/${selectedPumpId}/analyze`);
      setPrediction(res.data);
    } catch (err) {
      alert('Analysis failed: ' + (err.response?.data?.message || 'No sensor data available'));
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedPump = pumps.find(p => p.id === selectedPumpId);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🤖 Predictive Analysis</h1>
          <p style={styles.subtitle}>ML-based pump health prediction and fault detection</p>
        </div>
      </div>

      {/* Pump selector */}
      {pumps.length > 0 && (
        <div style={styles.selector}>
          {pumps.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPumpId(p.id)}
              style={{
                ...styles.selectorBtn,
                background: selectedPumpId === p.id ? 'rgba(6,182,212,0.15)' : 'var(--bg-primary)',
                border: `1px solid ${selectedPumpId === p.id ? 'var(--accent-teal)' : 'var(--border-color)'}`,
                color: selectedPumpId === p.id ? 'var(--accent-teal)' : 'var(--text-secondary)'
              }}
            >
              ⚙️ {p.name}
            </button>
          ))}
        </div>
      )}

      {loading ? <LoadingSpinner message="Loading predictions..." /> : (
        <div>
          {selectedPump && (
            <div style={styles.pumpInfo}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Analyzing: {selectedPump.name}</span>
              <button onClick={runAnalysis} disabled={analyzing} style={styles.analyzeBtn}>
                {analyzing ? '⏳ Analyzing...' : '🔬 Run Analysis'}
              </button>
            </div>
          )}

          {!prediction ? (
            <div style={styles.noPrediction}>
              <p style={{ fontSize: '1.5rem' }}>🤖</p>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>No prediction data yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Click &quot;Run Analysis&quot; to generate a health prediction
              </p>
            </div>
          ) : (
            <div style={styles.predictionGrid}>
              {/* Health Score */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Health Score</h3>
                <HealthScoreGauge score={prediction.healthScore} />
                <div style={styles.scoreLabel}>
                  <p style={styles.scoreStatus}>
                    {prediction.healthScore >= 80 ? '✅ Excellent' :
                     prediction.healthScore >= 60 ? '⚠️ Fair' :
                     prediction.healthScore >= 40 ? '🔴 Poor' : '🚨 Critical'}
                  </p>
                </div>
              </div>

              {/* Fault Details */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Fault Analysis</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <FaultIndicator fault={prediction.predictedFault} severity={prediction.severity} />
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>⏱️ Time to Failure</span>
                  <span style={{
                    ...styles.infoValue,
                    color: prediction.estimatedTimeToFailure.includes('Imminent') ? '#ef4444' : 'var(--accent-teal)'
                  }}>
                    {prediction.estimatedTimeToFailure}
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>📅 Last Analysis</span>
                  <span style={styles.infoValue}>{new Date(prediction.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Recommended Action */}
              <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
                <h3 style={styles.cardTitle}>🔧 Recommended Action</h3>
                <div style={{
                  background: prediction.severity === 'critical' ? 'rgba(239,68,68,0.08)' :
                              prediction.severity === 'high' ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                  border: `1px solid ${prediction.severity === 'critical' ? 'rgba(239,68,68,0.2)' :
                                       prediction.severity === 'high' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6
                }}>
                  {prediction.recommendedAction}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '1.5rem' },
  header: { marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' },
  selector: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  selectorBtn: { padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' },
  pumpInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.875rem 1.25rem', marginBottom: '1.5rem' },
  analyzeBtn: { padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 },
  noPrediction: { textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' },
  predictionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' },
  cardTitle: { fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' },
  scoreLabel: { textAlign: 'center', marginTop: '0.75rem' },
  scoreStatus: { fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' },
  infoLabel: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  infoValue: { fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }
};

export default PredictionPanel;
