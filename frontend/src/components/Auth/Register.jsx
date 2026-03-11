// Register component - handles new user registration
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'farmer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: '2.5rem' }}>💧</div>
          <h1 style={styles.title}>Smart Pump Monitor</h1>
          <p style={styles.subtitle}>Create your account</p>
        </div>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Farmer' },
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@farm.com' },
            { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' }
          ].map(field => (
            <div key={field.name} style={styles.field}>
              <label style={styles.label}>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                style={styles.input}
              />
            </div>
          ))}

          <div style={styles.field}>
            <label style={styles.label}>Account Role</label>
            <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
              <option value="farmer">🌾 Farmer</option>
              <option value="admin">⚙️ Administrator</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '⏳ Creating account...' : '✅ Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-teal)', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
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
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    background: 'var(--gradient-primary)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '0.75rem',
    color: '#ef4444',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.375rem', fontWeight: 500 },
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
    marginTop: '0.5rem'
  }
};

export default Register;
