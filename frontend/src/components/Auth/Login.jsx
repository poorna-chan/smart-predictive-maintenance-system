// Login component - handles user authentication
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo / Branding */}
        <div style={styles.header}>
          <div style={styles.logoIcon}>💧</div>
          <h1 style={styles.title}>Smart Pump Monitor</h1>
          <p style={styles.subtitle}>IoT Predictive Maintenance System</p>
        </div>

        <h2 style={styles.formTitle}>Sign In</h2>

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@pumpsystem.com"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-teal)', textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div style={styles.demoHint}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Demo Credentials:</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>Admin: admin@pumpsystem.com / admin123</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>Farmer: farmer@pumpsystem.com / farmer123</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    padding: '1rem'
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: 'var(--shadow-lg)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  logoIcon: {
    fontSize: '3rem',
    marginBottom: '0.5rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    background: 'var(--gradient-primary)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    marginTop: '0.25rem'
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '1.5rem'
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '0.75rem',
    color: '#ef4444',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  field: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.375rem',
    fontWeight: 500
  },
  input: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.625rem 0.875rem',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'all 0.2s'
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem'
  },
  demoHint: {
    marginTop: '1.5rem',
    padding: '0.75rem',
    background: 'rgba(6,182,212,0.05)',
    border: '1px solid rgba(6,182,212,0.15)',
    borderRadius: '8px',
    textAlign: 'center'
  }
};

export default Login;
